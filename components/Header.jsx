'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '@/lib/useFocusTrap';
import LogoMark from './LogoMark';
import styles from './Header.module.css';

const NAV = [
  { href: '#top', label: 'עמוד הבית' },
  { href: '#why', label: 'למה אנחנו' },
  { href: '#testimonials', label: 'מכתבי תודה' },
];

export default function Header({ showNav = true }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const dialogRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);

  // Focus trap, Escape and focus restore to the hamburger.
  useFocusTrap(dialogRef, open, close);

  /*
   * While the menu is open the page behind it must be neither scrollable nor
   * reachable by a screen reader's virtual cursor.
   */
  useEffect(() => {
    if (!open) return;
    const behind = [document.getElementById('content'), document.getElementById('contact')].filter(Boolean);
    const prevOverflow = document.body.style.overflow;
    behind.forEach((el) => el.setAttribute('inert', ''));
    document.body.style.overflow = 'hidden';
    return () => {
      behind.forEach((el) => el.removeAttribute('inert'));
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  /*
   * Desktop: the "contact us" button pins to the top of the screen once the page
   * scrolls past it. The threshold is the scroll offset at which the button's
   * design position (8.76rem) reaches the pinned position (1.6rem), so it hands
   * over without a jump.
   */
  useEffect(() => {
    if (!showNav) return;
    const desktop = window.matchMedia('(min-width: 1100px)');
    const onScroll = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      setPinned(desktop.matches && window.scrollY > (8.76 - 1.6) * rem);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    desktop.addEventListener('change', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      desktop.removeEventListener('change', onScroll);
    };
  }, [showNav]);

  return (
    <header className={styles.header} id="top" role="banner">
      <div className={`frame ${styles.frame}`}>
        <a href={showNav ? '#top' : '/'} className={styles.brand} aria-label="בית החולים הציבורי אסותא אשדוד – לעמוד הראשי">
          <LogoMark className={styles.logo} />
          <span className={styles.tagline}>
            <b>מומחיות</b> לכל אורך הדרך
          </span>
        </a>

        {showNav && (
          <>
            <nav className={styles.nav} aria-label="ניווט ראשי">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} className={styles.navLink}>
                  {item.label}
                </a>
              ))}
            </nav>
            <a href="#contact" className={`${styles.cta} ${pinned ? styles.ctaPinned : ''}`}>
              צרו איתנו קשר
            </a>

            <button
              type="button"
              className={styles.burger}
              aria-label={open ? 'סגירת תפריט' : 'פתיחת תפריט'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>

            {open && (
              <div
                ref={dialogRef}
                id="mobile-menu"
                className={styles.drawer}
                role="dialog"
                aria-modal="true"
                aria-label="תפריט"
              >
                <div className={styles.backdrop} aria-hidden="true" onClick={close} />
                <nav className={styles.drawerPanel} aria-label="תפריט נייד">
                  <button type="button" className={styles.drawerClose} aria-label="סגירת תפריט" onClick={close}>
                    <span aria-hidden="true">×</span>
                  </button>
                  {NAV.map((item) => (
                    <a key={item.href} href={item.href} onClick={close}>
                      {item.label}
                    </a>
                  ))}
                  <a href="#contact" onClick={close} className={styles.drawerCta}>
                    צרו איתנו קשר
                  </a>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
