'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEPARTMENT_LABELS } from '@/lib/departments';
import { captureGclid, getGclid } from '@/lib/gclid';
import { LEGAL } from '@/lib/site';
import { validateLead } from '@/lib/validation';
import styles from './LeadForm.module.css';

const EMPTY = { fullName: '', phone: '', department: '', terms: false, company: '' };

export default function LeadForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | error

  useEffect(() => {
    captureGclid();
  }, []);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors(({ [field]: _, ...rest }) => rest);
  };

  async function onSubmit(e) {
    e.preventDefault();
    const found = validateLead(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`lead-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, gclid: getGclid() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      window.dataLayer?.push({ event: 'lead_submitted', department: values.department });
      router.push('/thank-you');
    } catch {
      setStatus('error');
    }
  }

  const firstError = Object.values(errors)[0];
  const message =
    firstError || (status === 'error' ? 'אירעה שגיאה בשליחת הפרטים. אפשר לנסות שוב או להתקשר ל-8480*' : '');

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-labelledby="lead-title">
      <p id="lead-title" className={styles.title}>
        השאירו פרטים ונחזור אליכם.
      </p>

      <label className="sr-only" htmlFor="lead-fullName">
        שם מלא
      </label>
      <input
        id="lead-fullName"
        className={`${styles.field} ${styles.name}`}
        name="fullName"
        type="text"
        autoComplete="name"
        placeholder="שם מלא"
        maxLength={120}
        value={values.fullName}
        onChange={set('fullName')}
        aria-invalid={!!errors.fullName}
        aria-required="true"
        aria-describedby={errors.fullName ? 'lead-message' : undefined}
      />

      <label className="sr-only" htmlFor="lead-phone">
        טלפון
      </label>
      <input
        id="lead-phone"
        className={`${styles.field} ${styles.phone}`}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="טלפון"
        maxLength={20}
        value={values.phone}
        onChange={set('phone')}
        aria-invalid={!!errors.phone}
        aria-required="true"
        aria-describedby={errors.phone ? 'lead-message' : undefined}
      />

      <label className="sr-only" htmlFor="lead-department">
        בחירת תחום רפואי
      </label>
      <select
        id="lead-department"
        className={`${styles.field} ${styles.select} ${values.department ? '' : styles.placeholder}`}
        name="department"
        value={values.department}
        onChange={set('department')}
        aria-invalid={!!errors.department}
        aria-required="true"
        aria-describedby={errors.department ? 'lead-message' : undefined}
      >
        <option value="" disabled>
          בחירת תחום רפואי
        </option>
        {DEPARTMENT_LABELS.map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>

      {/* Honeypot: hidden from people, bots tend to fill it. */}
      <input
        className={styles.honeypot}
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={values.company}
        onChange={set('company')}
      />

      <input
        id="lead-terms"
        className={styles.checkbox}
        type="checkbox"
        name="terms"
        checked={values.terms}
        onChange={set('terms')}
        aria-invalid={!!errors.terms}
        aria-required="true"
        aria-describedby={errors.terms ? 'lead-message' : undefined}
      />
      <label htmlFor="lead-terms" className={styles.terms}>
        קראתי ואני מאשר/ת את{' '}
        <a href={LEGAL.terms} target="_blank" rel="noopener noreferrer">
          תנאי השימוש
          <span className="sr-only"> (נפתח בחלון חדש)</span>
        </a>
      </label>

      <p id="lead-message" className={styles.message} role="alert">
        {message}
      </p>

      <button className={styles.submit} type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'שולח…' : 'שליחה'}
      </button>
    </form>
  );
}
