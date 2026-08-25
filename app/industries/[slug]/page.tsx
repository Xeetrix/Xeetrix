import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, Info } from 'lucide-react';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CTASection } from '@/components/sections/CTASection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { getIndustryBySlug, industries } from '@/lib/content/industries';
import { getServiceBySlug } from '@/lib/content/services';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) return {};

  return {
    title: industry.name,
    description: industry.summary,
    alternates: { canonical: `/industries/${industry.slug}` },
  };
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) notFound();

  const recommendedServices = industry.recommendedServices
    .map((serviceSlug) => getServiceBySlug(serviceSlug))
    .filter((service): service is NonNullable<typeof service> => Boolean(service));

  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'Who We Help', href: '/who-we-help' }, { label: industry.name }]} />
        <PageHero
          eyebrow="Who We Help"
          title={industry.headline}
          description={industry.summary}
          cta={{ label: 'Get Started', href: '/get-started' }}
        />

        <Container className="grid grid-cols-1 gap-16 pb-28 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">What You Typically Need</h2>
              <ul className="mt-5 space-y-3">
                {industry.needs.map((need) => (
                  <li key={need} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyber-blue" aria-hidden="true" />
                    <span>{need}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">Considerations</h2>
              <ul className="mt-5 space-y-3">
                {industry.considerations.map((consideration) => (
                  <li key={consideration} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyber-blue" aria-hidden="true" />
                    <span>{consideration}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-semibold text-white">Recommended Services</p>
            {recommendedServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="card-glass block rounded-2xl border border-white/10 p-4 transition-colors hover:border-white/25"
              >
                <p className="text-sm font-medium text-white">{service.title}</p>
                <p className="mt-1 text-xs text-muted">{service.summary}</p>
              </Link>
            ))}
          </aside>
        </Container>

        <CTASection
          title={`Ready to set up your ${industry.name.toLowerCase()} business?`}
          description="Start with our qualification tool and get a recommended setup in minutes."
          primary={{ label: 'Find Your Path', href: '/get-started' }}
        />
      </main>
      <Footer />
    </>
  );
}
