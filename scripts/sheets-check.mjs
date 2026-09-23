#!/usr/bin/env node
/**
 * Verifies the Google Sheets setup end to end: signs in as the service account,
 * writes the header row if the tab is empty, and appends one test lead.
 *
 *   npm run sheets:check
 *
 * Reads .env.local, so it checks exactly what the app will use locally. For the
 * deployed site, pull the production values first: `vercel env pull .env.local`.
 */
import { appendLeadToSheet, sheetsConfigured } from '../lib/googleSheets.js';

if (!sheetsConfigured()) {
  console.error('Missing configuration. Set GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local');
  process.exit(1);
}

const lead = {
  fullName: 'בדיקה אוטומטית',
  phone: '0500000000',
  department: 'אחר',
  gclid: 'SHEETS_CHECK',
  source: 'scripts/sheets-check.mjs',
};

try {
  await appendLeadToSheet(lead);
  const via = process.env.GOOGLE_SHEETS_WEBAPP_URL ? 'Apps Script web app' : 'service account';
  console.log(`OK — test row appended to the sheet (via the ${via}).`);
  if (process.env.GOOGLE_SHEETS_ID) {
    console.log(`   https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_ID}/edit`);
  }
  console.log('   Delete that row once you have seen it.');
} catch (err) {
  console.error('FAILED —', err.message);
  if (process.env.GOOGLE_SHEETS_WEBAPP_URL) {
    console.error('   Check the web app: "Who has access: Anyone", and that the deployment was');
    console.error('   republished after the last code change (Manage deployments -> Edit -> New version).');
  } else if (/permission|not found|403|404/i.test(err.message)) {
    console.error(`   Check that the sheet is shared as Editor with ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
    console.error('   and that GOOGLE_SHEETS_ID is the id from the sheet URL.');
  }
  process.exit(1);
}
