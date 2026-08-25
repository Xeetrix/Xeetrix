import type { Metadata } from 'next';

import { IndustryCard } from '@/components/IndustryCard';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CTASection } from '@/components/sections/CTASection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { industries } from '@/lib/content/industries';

export const metadata: Metadata = {
  title: 'Who We Help',
  description:
    'Xeetrix supports SaaS founders, agencies, e-commerce entrepreneurs, and digital businesses with US business formation and infrastructure.',
  alternates: { canonical: '/who-we-help' },
};

export default function WhoWeHelpPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'Who We Help' }]} />
        <PageHero
          eyebrow="Who We Help"
          title="Different businesses. Different infrastructure needs."
          description="The right formation, banking, and payment setup depends on how you actually operate. Find your business model below."
        />

        <Container className="pb-28">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {industries.map((industry) => (
              <IndustryCard key={industry.slug} industry={industry} />
            ))}
          </div>
        </Container>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
