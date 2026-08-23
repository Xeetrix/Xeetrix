import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CapabilityMarquee } from '@/components/sections/CapabilityMarquee';
import { CTASection } from '@/components/sections/CTASection';
import { Differentiator } from '@/components/sections/Differentiator';
import { Hero } from '@/components/sections/Hero';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { ServiceEcosystem } from '@/components/sections/ServiceEcosystem';
import { TrustStrip } from '@/components/sections/TrustStrip';
import { WhoWeHelpPreview } from '@/components/sections/WhoWeHelpPreview';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Hero />
        <CapabilityMarquee />
        <TrustStrip />
        <ServiceEcosystem />
        <Differentiator />
        <ProcessTimeline />
        <WhoWeHelpPreview />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
