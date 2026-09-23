'use client';

import { useEffect, useRef, useState } from 'react';
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
 * WCAG 2.2.2 (auto-updating content needs a way to stop it) is met by the
 * accessibility panel's "stop animations" switch, which this checks on every tick;
 * the rotation also never starts under prefers-reduced-motion, and pauses while the
 * tab is in the background.
 */
export default function HeroRotator({ count, labels, children }) {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    const tick = () => {
      // Re-checked every tick so the accessibility panel's switch takes effect at once.
      if (wantsStill() || document.hidden) return;
      setIndex((i) => (i + 1) % count);
    };
    timer.current = setInterval(tick, INTERVAL);
    return () => clearInterval(timer.current);
  }, [count]);

  return (
    <div className={styles.rotator} data-slide={index}>
      {children}
      <p className="sr-only" aria-live="polite">
        {labels[index]}
      </p>
    </div>
  );
}
