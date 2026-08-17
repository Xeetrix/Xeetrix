import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { ContactForm } from '@/components/sections/ContactForm';
import { Hero } from '@/components/sections/Hero';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { TechMarquee } from '@/components/sections/TechMarquee';
import { ImpactStats } from '@/components/ImpactStats';
import { PremiumBento } from '@/components/PremiumBento';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Hero />
        <TechMarquee />
        <PremiumBento />
        <ImpactStats />
        <ProcessTimeline />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
