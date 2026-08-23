import { Check } from 'lucide-react';

import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Callout } from '@/components/ui/Callout';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { CTASection } from '@/components/sections/CTASection';
import { siteConfig } from '@/lib/content/site';
import type { Service } from '@/lib/content/services';

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyber-blue" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServiceDetail({ service }: { service: Service }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    provider: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.domain },
    areaServed: 'US',
    url: `${siteConfig.domain}/services/${service.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: 'Services', href: '/services' }, { label: service.title }]} />
      <PageHero
        eyebrow={service.category}
        title={service.title}
        description={service.heroDescription}
        cta={{ label: service.ctaLabel, href: '/get-started' }}
        secondaryCta={{ label: 'Talk to Xeetrix', href: '/contact' }}
      />

      <Container className="grid grid-cols-1 gap-16 pb-28 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">What It Is</h2>
            <div className="mt-5 space-y-4">
              {service.whatItIs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <ListBlock title="Who Needs It" items={service.whoNeedsIt} />
          <ListBlock title="What Xeetrix Does" items={service.whatWeDo} />
          <ListBlock title="What You Provide" items={service.whatClientProvides} />

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Typical Process</h2>
            <div className="mt-6 space-y-5">
              {service.process.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-bold text-cyber-blue">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Callout title="Important Limitations">
            <ul className="space-y-3">
              {service.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </Callout>
        </aside>
      </Container>

      <CTASection
        title={`Ready to move forward with ${service.title.toLowerCase()}?`}
        description="Tell us where your business is today. We'll confirm the next practical step."
        primary={{ label: service.ctaLabel, href: '/get-started' }}
      />
    </>
  );
}
