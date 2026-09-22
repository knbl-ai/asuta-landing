'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import styles from './A11yPanel.module.css';

/**
 * User-preference panel.
 *
 * This is deliberately NOT an accessibility "overlay". It injects nothing into
 * the accessibility tree, rewrites no ARIA and repairs nothing at runtime: every
 * control sets one `data-a11y-*` attribute on <html>, and one rule in
 * globals.css responds to it. Compliance rests on the markup itself; the panel
 * exists because visitors expect it, and because its preferences (bigger text,
 * no motion, underlined links) help people whose OS settings do not cover them.
 */

const DEFAULTS = {
  zoom: 100,
  contrast: 'off',
  grayscale: false,
  links: false,
  motion: false, // true = animations stopped
  readableFont: false,
  bigCursor: false,
};

export const A11Y_STORAGE_KEY = 'asuta-a11y';
// Up to 200% so the site-provided control alone satisfies WCAG 1.4.4 (technique G178).
const ZOOMS = [100, 110, 125, 150, 175, 200];

/*
 * Preferences live in a tiny external store rather than component state. They
 * are read from localStorage, which does not exist during server render, so the
 * component subscribes with useSyncExternalStore: React renders the defaults for
 * hydration and then re-renders with the stored values.
 */
let store = null;
const listeners = new Set();

function readStore() {
  if (store) return store;
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    store = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    store = DEFAULTS; // private mode, blocked storage
  }
  return store;
}

function writeStore(next) {
  store = next;
  applyPrefs(next);
  try {
    if (next === DEFAULTS) window.localStorage.removeItem(A11Y_STORAGE_KEY);
    else window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Single source of truth for the attribute mapping. The no-flash script in
 *  app/layout.js mirrors it and must be kept in sync by hand. */
export function applyPrefs(p) {
  const el = document.documentElement;
  const set = (name, value) => {
    if (value === null) el.removeAttribute(`data-a11y-${name}`);
    else el.setAttribute(`data-a11y-${name}`, value);
  };
  set('zoom', p.zoom === 100 ? null : String(p.zoom));
  set('contrast', p.contrast === 'invert' ? 'invert' : null);
  set('grayscale', p.grayscale ? 'on' : null);
  set('links', p.links ? 'on' : null);
  set('motion', p.motion ? 'off' : null);
  set('font', p.readableFont ? 'readable' : null);
  set('cursor', p.bigCursor ? 'big' : null);
}

const TOGGLES = [
  { key: 'contrast', label: 'ניגודיות גבוהה' },
  { key: 'grayscale', label: 'גווני אפור' },
  { key: 'links', label: 'הדגשת קישורים' },
  { key: 'motion', label: 'עצירת אנימציות' },
  { key: 'readableFont', label: 'גופן קריא' },
  { key: 'bigCursor', label: 'סמן עכבר גדול' },
];

export default function A11yPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  // The inline script in the layout has already applied these to <html>; this
  // only gives React its own view of the same values.
  const prefs = useSyncExternalStore(subscribe, readStore, () => DEFAULTS);

  const update = useCallback((patch) => writeStore({ ...readStore(), ...patch }), []);
  const reset = useCallback(() => writeStore(DEFAULTS), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Clicking outside dismisses, via pointerdown so that a drag which starts
  // inside the panel and ends outside does not close it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const isOn = (key) => (key === 'contrast' ? prefs.contrast === 'invert' : prefs[key]);
  const zoomIndex = ZOOMS.indexOf(prefs.zoom);

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          id="a11y-panel"
          className={`${styles.panel} a11y-fx`}
          role="dialog"
          aria-modal="false"
          aria-labelledby="a11y-panel-title"
        >
          <p id="a11y-panel-title" className={styles.title}>
            הגדרות נגישות
          </p>

          <div className={styles.size} role="group" aria-label="גודל טקסט">
            <span className={styles.sizeLabel}>גודל טקסט</span>
            <span className={styles.stepper}>
              <button
                type="button"
                className={styles.step}
                onClick={() => update({ zoom: ZOOMS[Math.max(0, zoomIndex - 1)] })}
                disabled={zoomIndex <= 0}
                aria-label="הקטנת טקסט"
              >
                −
              </button>
              <span className={styles.value} aria-live="polite">
                {prefs.zoom}%
              </span>
              <button
                type="button"
                className={styles.step}
                onClick={() => update({ zoom: ZOOMS[Math.min(ZOOMS.length - 1, zoomIndex + 1)] })}
                disabled={zoomIndex >= ZOOMS.length - 1}
                aria-label="הגדלת טקסט"
              >
                +
              </button>
            </span>
          </div>

          <ul className={styles.switches}>
            {TOGGLES.map(({ key, label }) => {
              const on = isOn(key);
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    className={styles.switch}
                    onClick={() => update(key === 'contrast' ? { contrast: on ? 'off' : 'invert' } : { [key]: !on })}
                  >
                    <span>{label}</span>
                    <span className={styles.track} aria-hidden="true">
                      <span className={styles.thumb} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={styles.footer}>
            <button type="button" className={styles.reset} onClick={reset}>
              איפוס הגדרות
            </button>
            <Link href="/accessibility" className={styles.statement} onClick={close}>
              הצהרת נגישות
            </Link>
          </div>
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        className={`${styles.fab} a11y-fx`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="פתיחת תפריט נגישות"
      >
        {/* The internationally recognised accessibility mark. */}
        <svg aria-hidden="true" focusable="false" width="26" height="26" viewBox="0 0 24 24" fill="#FFFFFF">
          <circle cx="12" cy="4" r="2" />
          <path d="M20.5 7.4a1.1 1.1 0 0 0-1.3-.8L15 7.5a3 3 0 0 1-.6.1H9.6a3 3 0 0 1-.6-.1L4.8 6.6a1.1 1.1 0 1 0-.45 2.15l4 .85V13l-1.7 6.6a1.15 1.15 0 0 0 2.22.57L10.4 15h3.2l1.53 5.17a1.15 1.15 0 0 0 2.22-.57L15.65 13V9.6l4-.85a1.1 1.1 0 0 0 .85-1.35z" />
        </svg>
      </button>
    </>
  );
}
