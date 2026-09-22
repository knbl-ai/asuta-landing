import localFont from 'next/font/local';
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
      <body>{children}</body>
    </html>
  );
}
