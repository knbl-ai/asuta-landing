import ArtImage from './ArtImage';
import styles from './Expertise.module.css';
import teamD from '@/assets/images/card-team-d.jpg';
import teamM from '@/assets/images/card-team-m.jpg';
import techD from '@/assets/images/card-tech-d.jpg';
import techM from '@/assets/images/card-tech-m.jpg';
import multiD from '@/assets/images/card-multi-d.jpg';
import multiM from '@/assets/images/card-multi-m.jpg';
import patientD from '@/assets/images/card-patient-d.jpg';
import patientM from '@/assets/images/card-patient-m.jpg';

const CARDS = [
  {
    desktop: teamD,
    mobile: teamM,
    alt: 'צוות רפואי של רופאים ואחיות',
    text: 'צוותים רפואיים מנוסים שכוללים רופאים, רופאות, אחים ואחיות, ואנשי מקצוע נוספים ממגוון תחומי הרפואה.',
  },
  {
    desktop: techD,
    mobile: techM,
    alt: 'רופא בוחן נתונים רפואיים על גבי טאבלט',
    text: 'טכנולוגיה רפואית מתקדמת, כלים וטכנולוגיות שמסייעות באבחון ובטיפול.',
  },
  {
    desktop: multiD,
    mobile: multiM,
    alt: 'צוות מנתחים בחדר ניתוח',
    text: (
      <>
        רפואה רב תחומית ושיתוף פעולה <br className="br-desktop" />
        בין מומחים ותחומים רפואיים.
      </>
    ),
  },
  {
    desktop: patientD,
    mobile: patientM,
    alt: 'רופאה משוחחת עם מטופלת',
    text: 'גישת "המטופל במרכז" שנותנת התייחסות לא רק למחלה, אלא גם לאדם שמתמודד איתה.',
  },
];

export default function Expertise() {
  return (
    <section className={styles.section} id="why" aria-labelledby="why-title">
      <div className={`frame ${styles.frame}`}>
        <h2 id="why-title" className={styles.title}>
          מה הופך אותנו למומחים?
        </h2>
        <ul className={styles.cards}>
          {CARDS.map((card) => (
            <li key={card.alt} className={styles.card}>
              <ArtImage
                desktop={card.desktop}
                mobile={card.mobile}
                alt={card.alt}
                className={styles.img}
                desktopSizes="(min-width: 1600px) 351px, 22vw"
                mobileSizes="(min-width: 480px) 453px, 95vw"
              />
              <div className={styles.panel}>
                <p className={styles.text}>{card.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
