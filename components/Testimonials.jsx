'use client';

import { useEffect, useRef } from 'react';
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

// On mobile every card uses the first card's arc, as in the design.
const MOBILE_ARC = TESTIMONIALS[0].arc;

export default function Testimonials() {
  const scroller = useRef(null);

  // Mobile carousel: start with the first testimonial centred, its neighbours peeking in.
  useEffect(() => {
    const el = scroller.current;
    if (!el || getComputedStyle(el).overflowX !== 'auto') return;
    // A scrollable region must be reachable by keyboard (arrow keys scroll it once focused).
    el.tabIndex = 0;
    const first = el.querySelector('li');
    const a = first.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    el.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: 'instant' });
  }, []);

  return (
    <section className={styles.section} id="testimonials" aria-labelledby="testimonials-title">
      <div className={`frame ${styles.frame}`}>
        <h2 id="testimonials-title" className={styles.title}>
          המטופלים שלנו אומרים תודה
        </h2>
        <ul className={styles.cards} ref={scroller} aria-label="המלצות מטופלים">
          {TESTIMONIALS.map((t) => (
            <li key={t.name} className={styles.card}>
              <figure>
                <svg className={`${styles.arc} ${styles.arcDesktop}`} viewBox="0 0 345.2 336.9" aria-hidden="true">
                  <path d={t.arc} />
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
      </div>
    </section>
  );
}
