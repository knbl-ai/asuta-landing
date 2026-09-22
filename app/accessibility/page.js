import Link from 'next/link';
import Header from '@/components/Header';
import { statement as s } from '@/lib/accessibility';
import { PHONES } from '@/lib/site';
import styles from './page.module.css';

export const metadata = {
  title: `${s.title} | בית החולים הציבורי אסותא אשדוד`,
  description: s.intro[0],
  alternates: { canonical: '/accessibility' },
};

/*
 * A plain, readable document rather than part of the designed page. The statement
 * exists to be read, by visitors and by anyone checking compliance, so it uses
 * real headings, real lists and generous type.
 */
export default function AccessibilityPage() {
  const section = (title, children) => (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );

  const list = (items) => (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );

  return (
    <>
      <a href="#content" className="skip-link">
        דילוג לתוכן העמוד
      </a>
      <Header showNav={false} />
      <main id="content" tabIndex={-1} className={styles.main}>
        <Link href="/" className={styles.back}>
          → {s.backHome}
        </Link>

        <h1 className={styles.title}>{s.title}</h1>
        <p className={styles.updated}>
          {s.updatedLabel}: {s.updated}
        </p>

        {s.intro.map((p) => (
          <p key={p} className={styles.para}>
            {p}
          </p>
        ))}

        {section(s.conformanceTitle, list(s.conformance))}
        {section(s.doneTitle, list(s.done))}
        {section(
          s.exceptionsTitle,
          <>
            <p className={styles.para}>{s.exceptionsIntro}</p>
            {list(s.exceptions)}
          </>,
        )}
        {section(
          s.contactTitle,
          <>
            <p className={styles.para}>{s.contactIntro}</p>
            {/* A definition list conveys the label/value pairing structurally. */}
            <dl className={styles.contact}>
              <dt>{s.callCenterLabel}</dt>
              <dd>
                <a href={`tel:${PHONES.callCenter.tel}`}>{PHONES.callCenter.label}</a>
              </dd>
              <dt>{s.hospitalLabel}</dt>
              <dd>
                <a href={`tel:${PHONES.hospital.tel}`}>{PHONES.hospital.label}</a>
              </dd>
            </dl>
          </>,
        )}
      </main>
    </>
  );
}
