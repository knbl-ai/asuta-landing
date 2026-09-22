import Link from 'next/link';
import Header from '@/components/Header';
import { PHONES } from '@/lib/site';
import styles from './page.module.css';

export const metadata = {
  title: 'תודה! | בית החולים הציבורי אסותא אשדוד',
  robots: { index: false, follow: false },
};

export default function ThankYou() {
  return (
    <>
      <Header showNav={false} />
      <main className={`frame ${styles.frame}`}>
        <section className={styles.panel} aria-labelledby="thanks-title">
          <svg className={styles.dot} viewBox="0 0 40 40" aria-hidden="true">
            <defs>
              <radialGradient id="ty-dot">
                <stop offset="3%" stopColor="#99EDE0" />
                <stop offset="97%" stopColor="#1A94B2" />
              </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="17" fill="none" stroke="#fff" strokeWidth="4" />
            <circle cx="20" cy="20" r="11" fill="url(#ty-dot)" />
          </svg>
          <h1 id="thanks-title" className={styles.title}>
            תודה!
          </h1>
          <p className={styles.subtitle}>
            <b>הפרטים שלכם</b> התקבלו בהצלחה
          </p>
          <p className={styles.text}>
            נציג/ה מטעמנו יחזרו אליכם בהקדם.
            <br />
            לכל שאלה, מוקד המידע וזימון התורים זמין עבורכם:{' '}
            <a href={`tel:${PHONES.callCenter.tel}`}>8480*</a>
            <br />
            טלפון בית החולים: <a href={`tel:${PHONES.hospital.tel}`}>{PHONES.hospital.label}</a>
          </p>
          <Link href="/" className={styles.cta}>
            חזרה לעמוד הראשי
          </Link>
        </section>
        <p className={styles.copyright}>© אסותא אשדוד - כל הזכויות שמורות</p>
      </main>
    </>
  );
}
