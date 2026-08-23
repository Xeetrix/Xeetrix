import type { Metadata } from 'next';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CTASection } from '@/components/sections/CTASection';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageHero } from '@/components/ui/PageHero';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'A six-step, transparent process for building your US business infrastructure — from first conversation to launch and ongoing support.',
  alternates: { canonical: '/how-it-works' },
};

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'How It Works' }]} />
        <PageHero
          eyebrow="How It Works"
          title="A guided process, start to finish"
          description="Every engagement follows the same six steps. You always know what happens next and why."
          cta={{ label: 'Get Started', href: '/get-started' }}
        />

        <ProcessTimeline eyebrow="The Process" title="From idea to launch" />

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
