import type { Metadata } from 'next';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { PricingCards } from '@/components/PricingCards';
import { PricingEstimator } from '@/components/PricingEstimator';
import { CTASection } from '@/components/sections/CTASection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Transparent pricing for US business formation and infrastructure: Starter, Business Launch, and Payment Ready packages, plus a setup estimator.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'Pricing' }]} />
        <PageHero
          eyebrow="Pricing"
          title="Clear pricing. No surprise line items."
          description="Three packages built around where you actually are — formation only, ready to bank, or ready to accept payments."
        />

        <Container className="pb-16">
          <PricingCards />
        </Container>

        <Container className="pb-28">
          <PricingEstimator />
        </Container>

        <CTASection eyebrow="Choose Your Setup" title="Not sure which package fits?" secondary={{ label: 'See How It Works', href: '/how-it-works' }} />
      </main>
      <Footer />
    </>
  );
}
