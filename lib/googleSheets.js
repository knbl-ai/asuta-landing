import { createSign } from 'node:crypto';
import { normalizePhone } from './validation.js';

/*
 * Appends leads to a private Google Sheet, through one of two transports:
 *
 * 1. An Apps Script web app (GOOGLE_SHEETS_WEBAPP_URL). The script is bound to the
 *    sheet and runs as its owner, so the sheet itself stays private and there is no
 *    service account to create. Simplest to set up; used while Salesforce is down.
 * 2. A service account (GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY), signing a
 *    JWT here rather than pulling in googleapis. Better for the long term: the key can
 *    be rotated and access is granted by sharing the sheet with the account.
 *
 * Note that neither can be replaced by an API key: the Sheets API does not accept API
 * keys for writes, whatever the sheet's sharing settings are.
 */
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API = 'https://sheets.googleapis.com/v4/spreadsheets';

export const SHEET_HEADERS = ['תאריך ושעה', 'שם מלא', 'טלפון', 'תחום רפואי', 'GCLID', 'מקור'];

function config() {
  return {
    id: process.env.GOOGLE_SHEETS_ID || '',
    tab: process.env.GOOGLE_SHEETS_TAB || 'Leads',
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    // Vercel stores the key with escaped newlines; a pasted PEM keeps real ones.
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };
}

function webAppConfig() {
  return {
    url: process.env.GOOGLE_SHEETS_WEBAPP_URL || '',
    // Shared secret checked by the script, so a leaked URL alone cannot write rows.
    token: process.env.GOOGLE_SHEETS_WEBAPP_TOKEN || '',
  };
}

export function sheetsConfigured() {
  const cfg = config();
  return Boolean(webAppConfig().url || (cfg.id && cfg.email && cfg.key));
}

const base64url = (input) => Buffer.from(input).toString('base64url');

let cachedToken = { value: '', expiresAt: 0 };

async function accessToken() {
  if (cachedToken.value && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.value;

  const { email, key } = config();
  const iat = Math.floor(Date.now() / 1000);
  const claim = { iss: email, scope: SCOPE, aud: TOKEN_URL, iat, exp: iat + 3600 };
  const unsigned = `${base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64url(JSON.stringify(claim))}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key, 'base64url');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`google auth ${res.status}: ${data.error_description || data.error || 'unknown'}`);

  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

async function sheetsFetch(pathAndQuery, init = {}) {
  const token = await accessToken();
  const res = await fetch(`${API}/${config().id}/${pathAndQuery}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
    signal: AbortSignal.timeout(10_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`sheets ${res.status}: ${data.error?.message || 'unknown error'}`);
  return data;
}

/** Writes the header row once, so a fresh sheet is readable without any setup. */
async function ensureHeaders(tab) {
  const range = `${encodeURIComponent(tab)}!A1:F1`;
  const current = await sheetsFetch(`values/${range}`);
  if (current.values?.[0]?.length) return;
  await sheetsFetch(`values/${range}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [SHEET_HEADERS] }),
  });
}

export function buildSheetRow(lead) {
  return [
    // Written as text so Sheets keeps the exact local time.
    new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', hour12: false }),
    String(lead.fullName || '').trim(),
    // Leading apostrophe: without it Sheets drops the leading zero of 05X numbers.
    `'${normalizePhone(lead.phone)}`,
    String(lead.department || ''),
    String(lead.gclid || ''),
    String(lead.source || ''),
  ];
}

async function appendViaWebApp(lead) {
  const { url, token } = webAppConfig();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Apps Script answers with a redirect to googleusercontent.com, which fetch follows.
    body: JSON.stringify({ token, row: buildSheetRow(lead), headers: SHEET_HEADERS }),
    signal: AbortSignal.timeout(10_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`sheets web app ${res.status}`);
  // The script replies with JSON; anything else means it returned its error page.
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('sheets web app returned an unexpected response (check the deployment URL and access)');
  }
  if (!data.ok) throw new Error(`sheets web app: ${data.error || 'unknown error'}`);
  return { ok: true, target: 'sheets' };
}

export async function appendLeadToSheet(lead) {
  if (webAppConfig().url) return appendViaWebApp(lead);
  const { tab } = config();
  await ensureHeaders(tab);
  const range = `${encodeURIComponent(tab)}!A:F`;
  await sheetsFetch(`values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    body: JSON.stringify({ values: [buildSheetRow(lead)] }),
  });
  return { ok: true, target: 'sheets' };
}
