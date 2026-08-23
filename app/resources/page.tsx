import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { articles } from '@/lib/content/resources';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Practical guides on US business formation, EIN applications, banking, payment-processor readiness, e-commerce, SaaS, and compliance.',
  alternates: { canonical: '/resources' },
};

export default function ResourcesPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'Resources' }]} />
        <PageHero
          eyebrow="Resources"
          title="Practical guides, not filler"
          description="What we tell clients directly, written down — formation-state considerations, documentation checklists, and payment-readiness detail."
        />

        <Container className="pb-28">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/resources/${article.slug}`}
                className="card-glass group flex h-full flex-col justify-between rounded-3xl border border-white/10 p-6 transition-colors hover:border-white/25"
              >
                <div>
                  <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyber-blue">
                    {article.category}
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-white">{article.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{article.summary}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-white/50">
                  <span>{article.readTime}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
