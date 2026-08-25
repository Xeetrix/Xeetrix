import type { Metadata } from 'next';
import { Mail, MessageCircle } from 'lucide-react';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { ContactForm } from '@/components/sections/ContactForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { siteConfig } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Xeetrix about US business formation, banking, and payment infrastructure.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <Breadcrumbs items={[{ label: 'Contact' }]} />
        <PageHero
          eyebrow="Contact"
          title="Have a question before you start?"
          description="Reach out directly, or use our Get Started flow if you're ready to move forward."
          secondaryCta={{ label: 'Get Started Instead', href: '/get-started' }}
        />

        <Container className="pb-4">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="card-glass flex items-center gap-3 rounded-2xl border border-white/10 p-5 transition-colors hover:border-white/25"
            >
              <Mail className="h-5 w-5 text-cyber-blue" />
              <div>
                <p className="text-sm font-semibold text-white">Email us</p>
                <p className="text-sm text-muted">{siteConfig.contactEmail}</p>
              </div>
            </a>
            <div className="card-glass flex items-center gap-3 rounded-2xl border border-white/10 p-5">
              <MessageCircle className="h-5 w-5 text-cyber-blue" />
              <div>
                <p className="text-sm font-semibold text-white">Response time</p>
                <p className="text-sm text-muted">{siteConfig.responseTime}</p>
              </div>
            </div>
          </div>
        </Container>

        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
