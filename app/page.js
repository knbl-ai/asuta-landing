import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Expertise from '@/components/Expertise';
import Departments from '@/components/Departments';
import Testimonials from '@/components/Testimonials';
import ContactFooter from '@/components/ContactFooter';

export default function Home() {
  return (
    <>
      <a href="#content" className="skip-link">
        דילוג לתוכן העמוד
      </a>
      <Header />
      <main id="content" tabIndex={-1}>
        <Hero />
        <Expertise />
        <Departments />
        <Testimonials />
      </main>
      <ContactFooter />
    </>
  );
}
