'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Testimonials.module.css';

// Patient thank-you letters, supplied by Assuta Ashdod.
const TESTIMONIALS = [
  {
    name: 'ראובן ואסתר נ.',
    quote: 'בחוויה שלנו הפסיפס האנושי – מהפקידה בדלפק, דרך האחות ועד למנהלת המחלקה – היה מקצועי, אנושי, חם וקשוב בצורה יוצאת דופן.',
  },
  {
    name: 'מאירה ה.',
    quote: 'הצוות נמצא פיזית כל הזמן ליד המטופלים ומעניק מענה מיידי עוד לפני שמבקשים... אינכם מעניקים רק טיפול רפואי – אתם מעניקים ביטחון, תקווה, שלווה ואמון.',
  },
  {
    name: 'אייל ג.',
    quote: 'רציתי להודות על האוזן הקשבת, על הרגישות, ועל המקצועיות בטיפול שקיבלתי באופן אישי.',
  },
  {
    name: 'יפה א.',
    quote: 'שמרתם עליי, דאגתם לי וריפאתם אותי... הכל נעשה בשקט, בביטחון, בנועם הליכות וכמובן במקצועיות מלאה. חזרתי לעצמי ואני זוכרת אתכם כחוויה הכי לטובה.',
  },
  {
    name: 'אביבה א.',
    quote: 'הגעתי חרדתית וחששתי מאוד מההליך, אך הצלחתם להפיג את החששות, להרגיע אותי ולהעניק לי תחושת ביטחון אמיתית. היחס החם והאכפתיות גרמו לי להרגיש כבת בית.',
  },
  {
    name: 'גרגורי ט.',
    quote: 'בזכות הטיפול, המקצועיות והאמונה בי – אני עומד על הרגליים והולך בכוחות עצמי. השינוי הזה הוא הרבה מעבר לשיפור רפואי, הוא החזרת העצמאות והתקווה לחיים.',
  },
  {
    name: 'מיכאל ד.',
    quote: 'תודה עמוקה על הטיפול המסור, המקצועי והאנושי ועל הגישה הרפואית המדויקת שקיבלנו.',
  },
  {
    name: 'נורית מ.',
    quote: 'אני ואימי בת ה-81 פגשנו רופא אנושי, אדיב וסבלני שהקשיב והסביר הכל בנחת וברוגע. בזכות ההסבר והשיקוף שלו – תחושת הביטחון שלנו גברה.',
  },
  {
    name: 'אברהם א.',
    quote: 'רציתי להודות לכם על הצוות המיוחד שאתם מעסיקים - בעלי יחסי אנוש מעולים, משרים אווירה נעימה ומקצועיות רבה. תודה רבה לכם!',
  },
];

// The four card styles of the design (quote-mark colour + background arc), repeated in order.
const CARD_STYLES = [
  { color: 'maccabi', arc: 'M186.6 -31.8C169 31.8 206.2 97.6 269.8 115.2C333.4 132.9 399.2 95.6 416.8 32.1' },
  { color: 'turquoise', arc: 'M241.6 378C250.8 312.7 205.2 252.3 139.9 243.1C74.6 233.9 14.2 279.4 5 344.8' },
  { color: 'lightBlue', arc: 'M-62.1 15.1C-29.1 72.2 43.9 91.8 101 58.8C158.2 25.8 177.7 -47.2 144.8 -104.3' },
  { color: 'maccabi', arc: 'M-40.8 303.9C25.2 303.9 78.7 250.4 78.7 184.5C78.7 118.5 25.2 65 -40.8 65' },
];

// On mobile every card uses the first card's arc, as in the design.
const MOBILE_ARC = CARD_STYLES[0].arc;

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
      // Absolute, not relative: the effect can run twice (React Strict Mode in dev).
      el.scrollTo({ left: 0, behavior: 'instant' });
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
          {TESTIMONIALS.map((t, i) => {
            const look = CARD_STYLES[i % CARD_STYLES.length];
            return (
              <li key={t.name} className={styles.card}>
                <figure>
                  <svg className={`${styles.arc} ${styles.arcDesktop}`} viewBox="0 0 345.2 336.9" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
                    <path d={look.arc} />
                  </svg>
                  <svg className={`${styles.arc} ${styles.arcMobile}`} viewBox="0 0 345.2 336.9" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
                    <path d={MOBILE_ARC} />
                  </svg>
                  <span className={`${styles.mark} ${styles[look.color]}`} aria-hidden="true">
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
            );
          })}
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
