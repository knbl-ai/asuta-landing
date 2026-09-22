// Shared by the lead form (client) and the /api/lead route (server).
import { DEPARTMENT_LABELS } from './departments';

export function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('972')) digits = `0${digits.slice(3)}`;
  return digits;
}

export function validateLead({ fullName, phone, department, terms }) {
  const errors = {};
  const name = String(fullName || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 120) errors.fullName = 'יש להזין שם מלא';
  if (!/^0\d{8,9}$/.test(normalizePhone(phone))) errors.phone = 'יש להזין מספר טלפון תקין';
  if (!DEPARTMENT_LABELS.includes(department)) errors.department = 'יש לבחור תחום רפואי';
  if (terms !== true) errors.terms = 'יש לאשר את תנאי השימוש';
  return errors;
}

// Salesforce expects first/last name separately; the form collects a single full name.
export function splitName(fullName) {
  const parts = String(fullName).trim().split(/\s+/);
  const first = parts.shift() || '';
  const last = parts.join(' ') || first;
  return { first, last };
}
