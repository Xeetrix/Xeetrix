import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CTASection } from '@/components/sections/CTASection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { serviceCategories, services } from '@/lib/content/services';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'US business formation and infrastructure services: LLC formation, EIN assistance, registered agent coordination, business banking, payment infrastructure, website launch, and compliance support.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'Services' }]} />
        <PageHero
          eyebrow="Services"
          title="Every piece of business infrastructure, in one guided process"
          description="From your first filing to payment-processor readiness, each service is built to hand off cleanly into the next."
        />

        <Container className="pb-28">
          {serviceCategories.map((category) => (
            <div key={category.key} className="mb-20 last:mb-0">
              <SectionHeader eyebrow={category.label} title={category.description} />
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {services
                  .filter((service) => service.category === category.key)
                  .map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      className="card-glass group flex h-full flex-col justify-between rounded-3xl border border-white/10 p-6 transition-colors hover:border-white/25"
                    >
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition-colors group-hover:border-cyber-blue/40">
                          <service.icon className="h-5 w-5 text-cyber-blue" strokeWidth={1.7} />
                        </div>
                        <h3 className="mt-5 text-base font-semibold text-white">{service.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{service.summary}</p>
                      </div>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-white/70 transition-colors group-hover:text-white">
                        Learn more
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </Container>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
