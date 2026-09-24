import Script from 'next/script';
import localFont from 'next/font/local';
import A11yPanel from '@/components/A11yPanel';
import './globals.css';

const googleSans = localFont({
  src: './fonts/GoogleSans-Hebrew.woff2',
  weight: '400 700',
  display: 'swap',
  variable: '--font-sans',
  // Metrics match the InDesign source (ascent .966 / descent .286), so no fallback adjustment.
  adjustFontFallback: false,
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
});

// Only the " glyph is used, for the large testimonial quote marks.
const practica = localFont({
  src: './fonts/FbPracticaNarrow-Quote.woff2',
  weight: '400',
  display: 'block',
  variable: '--font-quote',
  preload: false,
});

/*
 * Applies saved accessibility preferences before first paint, so the page does
 * not render at default size/contrast and then visibly snap to the visitor's
 * settings. Kept in sync by hand with `applyPrefs` in components/A11yPanel.jsx.
 */
const A11Y_BOOTSTRAP = `(function(){try{
var p=JSON.parse(localStorage.getItem('asuta-a11y')||'{}'),e=document.documentElement;
function s(n,v){if(v)e.setAttribute('data-a11y-'+n,v)}
if(p.zoom&&p.zoom!==100)s('zoom',String(p.zoom));
if(p.contrast==='invert')s('contrast','invert');
if(p.grayscale)s('grayscale','on');
if(p.links)s('links','on');
if(p.motion)s('motion','off');
if(p.readableFont)s('font','readable');
if(p.bigCursor)s('cursor','big');
}catch(_){}})();`;

// Assuta's Google Tag Manager container. Not a secret: it ships in the page.
const GTM_ID = 'GTM-TD2ZS74';

const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'בית החולים הציבורי אסותא אשדוד | מומחיות לכל אורך הדרך',
  description:
    'בבית החולים הציבורי אסותא אשדוד תמצאו מגוון רחב של תחומי רפואה, מחלקות, יחידות ומומחים, המאפשרים לנו להעניק מענה רפואי מקיף תחת קורת גג אחת.',
  openGraph: {
    title: 'בית החולים הציבורי אסותא אשדוד',
    description: 'מומחיות לכל אורך הדרך',
    locale: 'he_IL',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A94B2',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className={`${googleSans.variable} ${practica.variable}`}>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        <Script id="gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: GTM_SNIPPET }} />
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOTSTRAP }} />
        {children}
        <A11yPanel />
      </body>
    </html>
  );
}
