import Link from 'next/link';
import { Mail, Zap } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { footerLinks } from '@/lib/content/nav';
import { complianceNote, siteConfig } from '@/lib/content/site';

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/40">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-blue to-electric-purple">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-base font-bold tracking-tight text-white">Xeetrix</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{siteConfig.tagline}</p>

          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="mt-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {siteConfig.contactEmail}
          </a>
        </div>

        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-sm font-semibold text-white">{heading}</h4>
            <ul className="mt-4 space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/5 py-6">
        <Container>
          <p className="max-w-4xl text-xs leading-relaxed text-white/40">{complianceNote}</p>
          <p className="mt-4 text-sm text-muted">© {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.</p>
        </Container>
      </div>
    </footer>
  );
}
