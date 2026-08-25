import type { Metadata } from 'next';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { QualificationWizard } from '@/components/QualificationWizard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Callout } from '@/components/ui/Callout';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';

export const metadata: Metadata = {
  title: 'Get Started',
  description:
    'Answer a few questions about your business and get a recommended US business formation and infrastructure setup.',
  alternates: { canonical: '/get-started' },
};

export default function GetStartedPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'Get Started' }]} />
        <PageHero
          eyebrow="Find Your Path"
          title="Let's figure out what your business actually needs"
          description="Twelve quick questions, then a recommended setup. This is a lead qualification and recommendation tool, not a legal or tax eligibility determination."
        />

        <Container className="max-w-2xl pb-10">
          <Callout>
            We never ask for passports, SSNs, bank credentials, or payment card numbers here. Sensitive identity
            documents are only ever collected later, through a secure channel, if a specific filing requires them.
          </Callout>
        </Container>

        <Container className="max-w-2xl pb-28">
          <QualificationWizard />
        </Container>
      </main>
      <Footer />
    </>
  );
}
