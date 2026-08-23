import type { Metadata } from 'next';

import { LegalPage } from '@/components/LegalPage';
import { disclaimer } from '@/lib/content/legal';

export const metadata: Metadata = {
  title: disclaimer.title,
  description: disclaimer.description,
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return <LegalPage content={disclaimer} />;
}
