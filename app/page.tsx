import { AgentPlatformSection } from '@/components/AgentPlatformSection';
import { CTASection } from '@/components/CTASection';
import { EcosystemSection } from '@/components/EcosystemSection';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';
import { ProblemSection } from '@/components/ProblemSection';
import { ServicesSection } from '@/components/ServicesSection';
import { SolutionSection } from '@/components/SolutionSection';
import { UseCaseSection } from '@/components/UseCaseSection';

export default function Home() {
  return (
    <div className="site-shell">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <AgentPlatformSection />
        <UseCaseSection />
        <ServicesSection />
        <EcosystemSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
