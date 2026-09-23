import { appendFile } from 'node:fs/promises';
import path from 'node:path';
import { normalizePhone, splitName } from './validation.js';

// Salesforce Web-to-Lead. Field names follow the form Salesforce generated for Assuta
// (test_support_files/code.txt); the GCLID custom field id comes from the environment.
function config() {
  return {
    mode: process.env.SF_MODE === 'live' ? 'live' : 'mock',
    endpoint: process.env.SF_ENDPOINT || 'https://test.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8',
    oid: process.env.SF_OID || '00D7E000000FWtK',
    gclidField: process.env.SF_GCLID_FIELD || '00NWl000000Q9E9',
    debug: process.env.SF_DEBUG === '1',
    debugEmail: process.env.SF_DEBUG_EMAIL || '',
  };
}

export function buildLeadFields(lead, { returnUrl } = {}) {
  const cfg = config();
  const { first, last } = splitName(lead.fullName);
  const fields = {
    oid: cfg.oid,
    first_name: first.slice(0, 40),
    last_name: last.slice(0, 80),
    phone: normalizePhone(lead.phone).slice(0, 40),
    description: `תחום רפואי: ${lead.department}`,
  };
  if (returnUrl) fields.retURL = returnUrl;
  if (lead.gclid) fields[cfg.gclidField] = String(lead.gclid).slice(0, 255);
  if (cfg.debug) {
    fields.debug = '1';
    if (cfg.debugEmail) fields.debugEmail = cfg.debugEmail;
  }
  return fields;
}

export async function submitLead(lead, options) {
  const cfg = config();
  const fields = buildLeadFields(lead, options);

  if (cfg.mode === 'mock') {
    // Local development: log what would be sent, like test/mock_sf_server.py did.
    const record = { received_at: new Date().toISOString(), endpoint: cfg.endpoint, fields };
    console.log('[lead:mock]', JSON.stringify(record));
    try {
      await appendFile(path.join(process.cwd(), 'leads.dev.log'), `${JSON.stringify(record)}\n`);
    } catch {}
    return { ok: true, mode: 'mock' };
  }

  const res = await fetch(cfg.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams(fields).toString(),
    redirect: 'manual',
    signal: AbortSignal.timeout(10_000),
  });
  // Web-to-Lead answers 200, or a redirect to retURL, on success.
  const ok = res.status < 400;
  return { ok, mode: 'live', status: res.status };
}
