import type { Metadata } from 'next';
import { Globe2, ShieldCheck, Users, Workflow } from 'lucide-react';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CTASection } from '@/components/sections/CTASection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'About',
  description: 'Xeetrix helps global entrepreneurs build US business infrastructure with transparency and human support.',
  alternates: { canonical: '/about' },
};

const values = [
  {
    icon: Globe2,
    title: 'Built for global entrepreneurs',
    description:
      'We designed our process around the realities of building a US business from outside the US — different documentation, different timelines, different questions.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparency over promises',
    description:
      'We tell you what a bank or payment provider is likely to ask for, and we are equally clear about what we cannot guarantee.',
  },
  {
    icon: Workflow,
    title: 'A process, not just a filing',
    description:
      'Formation is one step. We built Xeetrix around the full sequence — entity, infrastructure, banking, payments, launch, and ongoing compliance.',
  },
  {
    icon: Users,
    title: 'Human support',
    description: 'Every engagement is guided by a person who can answer your specific questions — not a script.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'About' }]} />
        <PageHero
          eyebrow="About Xeetrix"
          title="A clearer path to US business infrastructure"
          description="Xeetrix exists because founders outside the US kept running into the same gap: formation services that stop at the filing, leaving banking, payments, and compliance to figure out alone."
        />

        <Container className="pb-20">
          <div className="max-w-3xl space-y-5 text-sm leading-relaxed text-muted">
            <p>
              We built Xeetrix around a simple observation: forming a US LLC is rarely the hard part. The hard part
              is everything that comes after — understanding what a bank actually wants to see, preparing a
              payment-processor application that survives review, and keeping a business in good standing once
              it&rsquo;s running.
            </p>
            <p>
              Xeetrix brings formation, business infrastructure, banking-application assistance, and
              payment-readiness work into a single guided process. We coordinate with independent third-party
              providers and licensed professionals where the work requires it, and we are direct about the fact that
              final decisions on banking and payments always rest with those providers — never with us.
            </p>
            <p>
              We are a working business, still early, still building out our track record. We would rather tell you
              that plainly than manufacture statistics or testimonials we don&apos;t have yet.
            </p>
          </div>
        </Container>

        <Container className="pb-28">
          <SectionHeader eyebrow="How We Operate" title="What guides the way we work" />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="card-glass rounded-3xl border border-white/10 p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <value.icon className="h-5 w-5 text-cyber-blue" strokeWidth={1.7} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
