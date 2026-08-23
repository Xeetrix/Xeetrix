import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CTASection } from '@/components/sections/CTASection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { articles, getArticleBySlug } from '@/lib/content/resources';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/resources/${article.slug}` },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'Resources', href: '/resources' }, { label: article.title }]} />
        <PageHero eyebrow={article.category} title={article.title} description={article.summary} />

        <Container className="max-w-3xl pb-28">
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">{article.readTime}</p>
          <div className="mt-8 space-y-10">
            {article.body.map((section) => (
              <div key={section.heading}>
                <h2 className="text-xl font-semibold text-white">{section.heading}</h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-relaxed text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
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
