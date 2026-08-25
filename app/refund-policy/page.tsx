import type { Metadata } from 'next';

import { LegalPage } from '@/components/LegalPage';
import { refundPolicy } from '@/lib/content/legal';

export const metadata: Metadata = {
  title: refundPolicy.title,
  description: refundPolicy.description,
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicyPage() {
  return <LegalPage content={refundPolicy} />;
}
