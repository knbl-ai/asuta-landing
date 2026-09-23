'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Hero.module.css';

const INTERVAL = 6000;

const wantsStill = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.dataset.a11yMotion === 'off';

/**
 * Cycles the hero between the department slides. It only flips a data attribute
 * on the wrapper; the slides themselves are rendered on the server (Hero.jsx) and
 * shown or hidden by CSS, so hidden slides leave the accessibility tree too.
 *
 * WCAG 2.2.2: auto-updating content needs a way to stop it, hence the pause
 * button. It also never starts when the visitor asked for reduced motion.
 */
export default function HeroRotator({ count, labels, children }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const stop = useCallback(() => {
    clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    const tick = () => {
      // Re-checked every tick so the accessibility panel's switch takes effect at once.
      if (wantsStill() || document.hidden) return;
      setIndex((i) => (i + 1) % count);
    };
    timer.current = setInterval(tick, INTERVAL);
    return stop;
  }, [paused, count, stop]);

  return (
    <div className={styles.rotator} data-slide={index}>
      {children}
      <button
        type="button"
        className={styles.rotatorToggle}
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'הפעלת חילופי התמונות' : 'עצירת חילופי התמונות'}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          {paused ? (
            <path d="M7 5l8 5-8 5z" fill="currentColor" />
          ) : (
            <path d="M6.5 5v10M13.5 5v10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          )}
        </svg>
      </button>
      <p className="sr-only" aria-live="polite">
        {labels[index]}
      </p>
    </div>
  );
}
