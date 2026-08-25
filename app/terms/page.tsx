import type { Metadata } from 'next';

import { LegalPage } from '@/components/LegalPage';
import { termsOfService } from '@/lib/content/legal';

export const metadata: Metadata = {
  title: termsOfService.title,
  description: termsOfService.description,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return <LegalPage content={termsOfService} />;
}
