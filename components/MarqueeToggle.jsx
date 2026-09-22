'use client';

import { useState } from 'react';
import styles from './Departments.module.css';

// WCAG 2.2.2: content that moves for more than five seconds needs a way to pause it.
// Hover-pause alone does not help keyboard or touch users.
export default function MarqueeToggle({ targetId }) {
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    document.getElementById(targetId)?.toggleAttribute('data-paused', next);
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-controls={targetId}
      aria-label={paused ? 'הפעלת תנועת רשימת המחלקות' : 'עצירת תנועת רשימת המחלקות'}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        {paused ? <path d="M7 5l8 5-8 5z" fill="currentColor" /> : <path d="M6.5 5v10M13.5 5v10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />}
      </svg>
    </button>
  );
}
