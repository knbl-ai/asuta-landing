import Image from 'next/image';
import LeadForm from './LeadForm';
import LogoMark from './LogoMark';
import { LEGAL, PHONES, SOCIAL } from '@/lib/site';
import styles from './ContactFooter.module.css';

export default function ContactFooter() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={`frame ${styles.frame}`}>
        <div className={styles.panel} aria-hidden="true" />

        <h2 className={styles.title}>אנחנו כאן בשבילכם.</h2>
        <p className={styles.text}>
          הצוותים שלנו עומדים לרשותכם כדי לספק מידע, לכוון אתכם <br className="br-desktop" />
          לשירות או למומחה המתאימה לכם ולסייע לכם בתהליך בצורה פשוטה, <br className="br-desktop" />
          נגישה ומקצועית. <br className="br-mobile" />
          כשלא תמיד ברור מה הצעד הבא, חשוב לדעת <br className="br-desktop" />
          שיש מי שיכול לעזור לכם למצוא את הדרך.
        </p>

        <p className={styles.phones}>
          <span>
            מוקד המידע וזימון התורים:{' '}
            <a href={`tel:${PHONES.callCenter.tel}`}>
              8480<span className={styles.star}>*</span>
            </a>
          </span>
          <span className={styles.sep}>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
          <br className="br-mobile" />
          <span>
            טלפון בית החולים: <a href={`tel:${PHONES.hospital.tel}`}>{PHONES.hospital.label}</a>
          </span>
        </p>

        <ul className={styles.social}>
          {SOCIAL.map((s) => (
            <li key={s.id} className={styles[s.id]}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <Image src={`/icons/${s.id}.svg`} alt="" width={55} height={55} unoptimized />
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.brand}>
          <LogoMark className={styles.logo} primary="#fff" secondary="#fff" />
          <span className={styles.tagline}>
            <b>מומחיות</b> לכל אורך הדרך
          </span>
        </div>

        <LeadForm />

        <p className={styles.copyright}>
          © אסותא אשדוד - כל הזכויות שמורות<span className={styles.copySep}> | </span>
          <br className="br-mobile" />
          <a href={LEGAL.privacy}>מדיניות פרטיות</a>
          <span className={styles.legalSep}>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; </span>
          <span className={styles.legalJoin}> </span>
          <a href={LEGAL.terms}>ותנאי שימוש</a>
        </p>
      </div>
    </footer>
  );
}
