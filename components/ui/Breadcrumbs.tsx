import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/lib/content/site';

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ label: 'Home', href: '/' }, ...items].map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteConfig.domain}${item.href}` : undefined,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="relative pt-28 sm:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-white/20" aria-hidden="true" />
          </li>
          {items.map((item, index) => (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && index < items.length - 1 ? (
                <>
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                  <ChevronRight className="h-3 w-3 text-white/20" aria-hidden="true" />
                </>
              ) : (
                <span className="text-white/70" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </nav>
  );
}
