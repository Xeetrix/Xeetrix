import type { Metadata } from 'next';

import { LegalPage } from '@/components/LegalPage';
import { privacyPolicy } from '@/lib/content/legal';

export const metadata: Metadata = {
  title: privacyPolicy.title,
  description: privacyPolicy.description,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <LegalPage content={privacyPolicy} />;
}
