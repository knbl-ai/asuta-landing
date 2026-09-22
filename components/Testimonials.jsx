'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Testimonials.module.css';

const TESTIMONIALS = [
  {
    quote: (
      <>
        הרגשתי בידיים טובות מהרגע הראשון <br className="br-desktop" />- הצוות הסביר כל שלב, היה קשוב{' '}
        <br className="br-desktop" />
        ולא מיהר איתי.
      </>
    ),
    name: 'דני אברהם, 58, אשדוד',
    color: 'maccabi',
    arc: 'M186.6 -31.8C169 31.8 206.2 97.6 269.8 115.2C333.4 132.9 399.2 95.6 416.8 32.1',
  },
  {
    quote: (
      <>
        הניתוח עצמו והתאוששות אחריו <br className="br-desktop" />
        התנהלו בצורה מקצועית ורגועה, עם <br className="br-desktop" />
        ציוד וטכנולוגיה שהרגישו עדכניים <br className="br-desktop" />
        ומתקדמים.
      </>
    ),
    name: 'מרינה לוי, 39, אשקלון',
    color: 'turquoise',
    arc: 'M241.6 378C250.8 312.7 205.2 252.3 139.9 243.1C74.6 233.9 14.2 279.4 5 344.8',
  },
  {
    quote: (
      <>
        הרופאה ליוותה אותי לאורך כל התהליך, <br className="br-desktop" />
        לא רק ברגע הקריטי - הרגשתי שיש לי <br className="br-desktop" />
        מישהי לפנות אליה בכל שלב.
      </>
    ),
    name: 'שירה מזרחי, 31, באר שבע',
    color: 'lightBlue',
    arc: 'M-62.1 15.1C-29.1 72.2 43.9 91.8 101 58.8C158.2 25.8 177.7 -47.2 144.8 -104.3',
  },
  {
    quote: (
      <>
        ילדתנו טופלה במחלקת ילדים <br className="br-desktop" />
        ברגישות ובחום, <br className="br-desktop" />
        וזה עשה הבדל גדול עבורנו כהורים.
      </>
    ),
    name: 'אלי פרץ, אשדוד',
    color: 'maccabi',
    arc: 'M-40.8 303.9C25.2 303.9 78.7 250.4 78.7 184.5C78.7 118.5 25.2 65 -40.8 65',
  },
];

// On mobile every card uses the first card's arc, as in the design (also the
// fallback for testimonials added without an arc of their own).
const MOBILE_ARC = TESTIMONIALS[0].arc;

// Thin chevron, as drawn in the design file next to the testimonials (13 x 35.7pt).
function Chevron({ direction }) {
  return (
    <svg viewBox="0 0 15 38" aria-hidden="true" focusable="false">
      <path d={direction === 'left' ? 'M14 1L1.5 19L14 37' : 'M1 1L13.5 19L1 37'} />
    </svg>
  );
}

export default function Testimonials() {
  const scroller = useRef(null);
  // Arrows exist only while there is more than fits, so they appear on desktop by
  // themselves once a fifth testimonial is added.
  const [nav, setNav] = useState({ overflow: false, prev: false, next: false });

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // RTL: scrollLeft runs from 0 to negative
    const overflow = max > 1;
    // A scrollable region must be reachable by keyboard (arrow keys scroll it once focused).
    if (overflow) el.tabIndex = 0;
    else el.removeAttribute('tabindex');
    setNav({ overflow, prev: overflow && pos > 1, next: overflow && pos < max - 1 });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // Mobile: start with the first testimonial centred, its neighbours peeking in.
    if (window.matchMedia('(max-width: 1099.98px)').matches) {
      const first = el.querySelector('li');
      const a = first.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      el.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: 'instant' });
    }
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update]);

  // One card per click. In RTL the next card is to the left.
  const go = (dir) => {
    const el = scroller.current;
    const card = el.querySelector('li');
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.a11yMotion === 'off';
    el.scrollBy({ left: (dir === 'next' ? -1 : 1) * (card.offsetWidth + gap), behavior: reduce ? 'instant' : 'smooth' });
  };

  return (
    <section className={styles.section} id="testimonials" aria-labelledby="testimonials-title">
      <div className={`frame ${styles.frame}`}>
        <h2 id="testimonials-title" className={styles.title}>
          המטופלים שלנו אומרים תודה
        </h2>
        <ul className={styles.cards} id="testimonials-list" ref={scroller} aria-label="המלצות מטופלים">
          {TESTIMONIALS.map((t) => (
            <li key={t.name} className={styles.card}>
              <figure>
                <svg className={`${styles.arc} ${styles.arcDesktop}`} viewBox="0 0 345.2 336.9" aria-hidden="true">
                  <path d={t.arc ?? MOBILE_ARC} />
                </svg>
                <svg className={`${styles.arc} ${styles.arcMobile}`} viewBox="0 0 345.2 336.9" aria-hidden="true">
                  <path d={MOBILE_ARC} />
                </svg>
                <span className={`${styles.mark} ${styles[t.color]}`} aria-hidden="true">
                  &quot;
                </span>
                <blockquote className={styles.quote}>
                  <p>{t.quote}</p>
                </blockquote>
                <figcaption className={styles.footer}>
                  <span className={styles.name}>{t.name}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {nav.overflow && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowPrev}`}
              onClick={() => go('prev')}
              disabled={!nav.prev}
              aria-controls="testimonials-list"
              aria-label="ההמלצה הקודמת"
            >
              <Chevron direction="right" />
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowNext}`}
              onClick={() => go('next')}
              disabled={!nav.next}
              aria-controls="testimonials-list"
              aria-label="ההמלצה הבאה"
            >
              <Chevron direction="left" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
