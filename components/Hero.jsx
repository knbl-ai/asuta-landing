import ArtImage from './ArtImage';
import styles from './Hero.module.css';
import usDesktop from '@/assets/images/hero-ultrasound-d.jpg';
import usMobile from '@/assets/images/hero-ultrasound-m.jpg';
import babyDesktop from '@/assets/images/hero-baby-d.jpg';
import babyMobile from '@/assets/images/hero-baby-m.jpg';

const D_SIZES = '(min-width: 1600px) 360px, 22.5vw';
const M_SIZES = '(min-width: 480px) 455px, 95vw';

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`frame ${styles.frame}`}>
        <figure className={`${styles.photo} ${styles.photoUs}`}>
          <ArtImage
            desktop={usDesktop}
            mobile={usMobile}
            alt="בדיקת אולטרסאונד לאישה בהריון"
            className={styles.img}
            desktopSizes={D_SIZES}
            mobileSizes={M_SIZES}
            priority
          />
          <figcaption className={`${styles.caption} ${styles.captionUs}`}>
            מהאולטרסאונד
            <br />
            הראשון
          </figcaption>
        </figure>

        <figure className={`${styles.photo} ${styles.photoBaby}`}>
          <ArtImage
            desktop={babyDesktop}
            mobile={babyMobile}
            alt="אם מחבקת את התינוק שנולד זה עתה"
            className={styles.img}
            desktopSizes={D_SIZES}
            mobileSizes={M_SIZES}
            priority
          />
          <figcaption className={`${styles.caption} ${styles.captionBaby}`}>
            ועד שסוף-סוף
            <br />
            נפגשים
          </figcaption>
        </figure>

        <div className={styles.panel}>
          <h1 id="hero-title" className={styles.title}>
            בית-החולים הציבורי
            <br />
            אסותא אשדוד
          </h1>
          <p className={styles.tagline}>
            <b>מומחיות</b> לכל אורך הדרך
          </p>
          <p className={`${styles.body} ${styles.p1}`}>
            בבית החולים הציבורי אסותא אשדוד תמצאו מגוון רחב של תחומי רפואה, מחלקות,
            <br />
            יחידות ומומחים, המאפשרים לנו להעניק מענה רפואי מקיף תחת קורת גג אחת.
            <br />
            אצלנו תמצאו רפואה מקצועית ומתקדמת שרואה אותך.
          </p>
          <p className={`${styles.body} ${styles.p2}`}>
            צוותים רפואיים ממגוון תחומים פועלים יחד כדי להעניק לכם טיפול מקצועי,
            <br className="br-desktop" /> מתקדם ואישי, תוך הקשבה לצרכים שלכם וליווי לאורך הדרך:
            <br />
            מהבדיקה הראשונה, דרך האבחון, הטיפול והמעקב ועד יום השחרור.
          </p>
          <p className={`${styles.body} ${styles.p3}`}>
            כי מומחיות רפואית היא לא רק לדעת מה נכון לעשות.
            <br className="br-desktop" /> היא גם להיות שם עבורכם, להסביר, להקשיב וללוות אתכם בכל שלב.
          </p>
          <a href="#contact" className={styles.cta}>
            צרו איתנו קשר
          </a>
        </div>

        {/* The white "journey" line joining the two photo captions. */}
        <svg className={`${styles.curve} ${styles.curveDesktop}`} viewBox="0 260.4 1600 824.8" aria-hidden="true">
          <defs>
            <filter id="glow-d" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="dot-d">
              <stop offset="3%" stopColor="#99EDE0" />
              <stop offset="97%" stopColor="#1A94B2" />
            </radialGradient>
          </defs>
          <path
            filter="url(#glow-d)"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            d="M1235.0 1030.0 C1197.0 1044.6 1180.0 1053.4 1086.0 1055.4 C944.6 1053.4 812.8 967.4 738.0 963.7 C676.4 960.8 634.2 1046.6 568.0 1045.7 C481.1 1044.6 492.5 784.8 416.5 784.9 C371.0 783.9 365.5 843.7 324.0 912.6"
          />
          <circle cx="1244.1" cy="1026.3" r="10.1" fill="none" stroke="#fff" strokeWidth="2.43" filter="url(#glow-d)" />
          <circle cx="1244.1" cy="1026.3" r="6.5" fill="url(#dot-d)" />
          <circle cx="314.15" cy="926.45" r="13.45" fill="none" stroke="#fff" strokeWidth="3.24" />
          <circle cx="314.15" cy="926.45" r="8.6" fill="url(#dot-d)" />
        </svg>

        <svg className={`${styles.curve} ${styles.curveMobile}`} viewBox="0 159.3 375 1210.7" aria-hidden="true">
          <defs>
            <filter id="glow-m" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="dot-m">
              <stop offset="3%" stopColor="#99EDE0" />
              <stop offset="97%" stopColor="#1A94B2" />
            </radialGradient>
          </defs>
          <path
            filter="url(#glow-m)"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            d="M283.2 363.7 C265.1 394.1 207.0 383.6 184.5 378.4 C125.7 361.4 96.5 323.4 67.5 340.4 C43.5 353.4 67.5 396.4 64.5 438.4 C63.5 455.4 44.6 472.6 33.2 489.9 C9.8 526.4 58.1 543.3 88.0 580.0"
          />
          <circle cx="285.65" cy="359.55" r="4.25" fill="none" stroke="#fff" strokeWidth="1.02" />
          <circle cx="285.65" cy="359.55" r="2.7" fill="url(#dot-m)" />
          <circle cx="90.25" cy="583.25" r="4.25" fill="none" stroke="#fff" strokeWidth="1.02" />
          <circle cx="90.25" cy="583.25" r="2.7" fill="url(#dot-m)" />
        </svg>
      </div>
    </section>
  );
}
