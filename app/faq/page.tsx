import type { Metadata } from 'next';

import { FAQAccordion } from '@/components/FAQAccordion';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CTASection } from '@/components/sections/CTASection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers about US LLC formation for non-residents, EIN applications, business banking, payment processing, and ongoing compliance.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'FAQ' }]} />
        <PageHero
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Straight answers on formation, banking, payments, and compliance — including what we can and cannot guarantee."
        />

        <Container className="pb-28">
          <FAQAccordion />
        </Container>

        <CTASection secondary={{ label: 'Still have questions? Contact us', href: '/contact' }} />
      </main>
      <Footer />
    </>
  );
}
