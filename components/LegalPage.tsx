import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Callout } from '@/components/ui/Callout';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { generalDisclaimer } from '@/lib/content/site';
import type { LegalPageContent } from '@/lib/content/legal';

export function LegalPage({ content }: { content: LegalPageContent }) {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: content.title }]} />
        <PageHero eyebrow="Legal" title={content.title} description={content.description} />

        <Container className="max-w-3xl pb-28">
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">Last updated: {content.lastUpdated}</p>

          <div className="mt-6">
            <Callout title="Please note">{generalDisclaimer}</Callout>
          </div>

          <div className="mt-12 space-y-10">
            {content.sections.map((section) => (
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
      </main>
      <Footer />
    </>
  );
}
