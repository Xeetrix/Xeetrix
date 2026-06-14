import type { Metadata } from 'next';
import OsPage from '../_components/OsPage';
import { listGoogleAccounts } from '@/lib/google-integrations';
import GoogleSourcesClient from './GoogleSourcesClient';

export const metadata: Metadata = { title: 'Sources | Shaikh OS' };
export const dynamic = 'force-dynamic';

export default async function SourcesPage() {
  const accounts = await listGoogleAccounts();

  return (
    <OsPage
      eyebrow="Connected Sources"
      title="Google Workspace read-only intelligence."
      subtitle="Connect Google accounts, verify service health, and sync read-only Gmail, Calendar, Docs, and Sheets metadata without modifying Google data."
    >
      <GoogleSourcesClient accounts={accounts} />
    </OsPage>
  );
}
