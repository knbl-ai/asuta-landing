'use client';

import { useEffect, useState } from 'react';
import LogoMark from './LogoMark';
import styles from './Header.module.css';

const NAV = [
  { href: '#top', label: 'עמוד הבית' },
  { href: '#why', label: 'למה אנחנו' },
  { href: '#testimonials', label: 'מכתבי תודה' },
];

export default function Header({ showNav = true }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={styles.header} id="top">
      <div className={`frame ${styles.frame}`}>
        <a href={showNav ? '#top' : '/'} className={styles.brand}>
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
            <a href="#contact" className={styles.cta}>
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

            <div
              id="mobile-menu"
              className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
              hidden={!open}
            >
              <button type="button" className={styles.backdrop} aria-label="סגירת תפריט" onClick={close} />
              <nav className={styles.drawerPanel} aria-label="תפריט נייד">
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
          </>
        )}
      </div>
    </header>
  );
}
