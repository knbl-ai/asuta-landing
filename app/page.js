import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Expertise from '@/components/Expertise';
import Departments from '@/components/Departments';
import Testimonials from '@/components/Testimonials';
import ContactFooter from '@/components/ContactFooter';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Expertise />
        <Departments />
        <Testimonials />
      </main>
      <ContactFooter />
    </>
  );
}
