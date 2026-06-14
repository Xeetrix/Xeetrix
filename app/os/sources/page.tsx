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
      title="Google Workspace integration foundation."
      subtitle="Connect and manage multiple Google accounts from one registry. Phase 1 stores only OAuth identity and encrypted tokens; Gmail, Calendar, Docs, and Sheets data access is intentionally disabled."
    >
      <GoogleSourcesClient accounts={accounts} />
    </OsPage>
  );
}
