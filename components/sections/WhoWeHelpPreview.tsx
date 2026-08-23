import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { IndustryCard } from '@/components/IndustryCard';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { industries } from '@/lib/content/industries';

export function WhoWeHelpPreview() {
  return (
    <section className="relative border-y border-white/10 bg-white/[0.02] py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Who We Help"
            title="Built for the way you actually operate"
            description="Formation, banking, and payment needs vary by business model. Here's what a setup typically looks like for each."
          />
          <Link
            href="/who-we-help"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry) => (
            <IndustryCard key={industry.slug} industry={industry} />
          ))}
        </div>
      </Container>
    </section>
  );
}
