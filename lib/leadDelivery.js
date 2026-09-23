import { appendLeadToSheet, sheetsConfigured } from './googleSheets.js';
import { submitLead } from './salesforce.js';

/*
 * Where a lead goes is one environment variable:
 *
 *   LEAD_DESTINATION=salesforce   Salesforce Web-to-Lead only (default)
 *   LEAD_DESTINATION=sheets       a private Google Sheet only
 *   LEAD_DESTINATION=both         both, so nothing is lost while one side is being set up
 *
 * With `both`, the lead counts as delivered when at least one target accepted it; a
 * failure of the other is logged. Salesforce's own mock/live switch stays in SF_MODE.
 */
export function leadTargets() {
  const value = (process.env.LEAD_DESTINATION || 'salesforce').toLowerCase().trim();
  if (value === 'sheets') return ['sheets'];
  if (value === 'both') return ['sheets', 'salesforce'];
  return ['salesforce'];
}

export async function deliverLead(lead, options = {}) {
  const targets = leadTargets();

  const results = await Promise.all(
    targets.map(async (target) => {
      try {
        if (target === 'sheets') {
          if (!sheetsConfigured()) throw new Error('google sheets is not configured');
          return { target, ...(await appendLeadToSheet(lead)) };
        }
        const result = await submitLead(lead, options);
        return { target, ok: result.ok, mode: result.mode, status: result.status };
      } catch (err) {
        return { target, ok: false, error: err.message };
      }
    }),
  );

  return { ok: results.some((r) => r.ok), results };
}
