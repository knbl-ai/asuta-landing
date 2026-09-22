// Hospital departments, used by the departments strip and the lead form's select.
export const DEPARTMENTS = [
  { id: 'orthopedics', label: 'אורתופדיה', color: 'turquoise' },
  { id: 'cardiology', label: 'קרדיולוגיה', color: 'maccabi' },
  { id: 'neurology', label: 'נוירולוגיה', color: 'lightBlue' },
  { id: 'urology', label: 'אורולוגיה', color: 'aqua' },
  { id: 'surgery', label: 'כירורגיה', color: 'turquoise' },
  { id: 'ent', label: 'אף אוזן גרון', color: 'maccabi' },
];

export const OTHER_DEPARTMENT = 'אחר';

export const DEPARTMENT_LABELS = [...DEPARTMENTS.map((d) => d.label), OTHER_DEPARTMENT];
