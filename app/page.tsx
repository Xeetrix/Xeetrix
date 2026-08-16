import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { BentoServices } from '@/components/sections/BentoServices';
import { ContactForm } from '@/components/sections/ContactForm';
import { Hero } from '@/components/sections/Hero';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { StatsSection } from '@/components/sections/StatsSection';
import { TechMarquee } from '@/components/sections/TechMarquee';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Hero />
        <TechMarquee />
        <BentoServices />
        <StatsSection />
        <ProcessTimeline />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
