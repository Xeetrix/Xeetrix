import type { Metadata } from 'next';

import { LegalPage } from '@/components/LegalPage';
import { accessibilityStatement } from '@/lib/content/legal';

export const metadata: Metadata = {
  title: accessibilityStatement.title,
  description: accessibilityStatement.description,
  alternates: { canonical: '/accessibility' },
};

export default function AccessibilityPage() {
  return <LegalPage content={accessibilityStatement} />;
}
