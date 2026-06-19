import type { Metadata } from 'next';
import OsPage from '../_components/OsPage';
import { listGoogleAccounts, listGoogleIntelligence } from '@/lib/google-integrations';
import GoogleSourcesClient from './GoogleSourcesClient';

export const metadata: Metadata = { title: 'সংযোগ | Shaikh OS' };
export const dynamic = 'force-dynamic';

export default async function SourcesPage() {
  const [accounts, google] = await Promise.all([listGoogleAccounts(), listGoogleIntelligence()]);

  return (
    <OsPage
      eyebrow="সংযোগ"
      title="Google সংযোগ"
      subtitle="Google, GitHub, Vercel, Supabase এবং OpenRouter সংযোগের অবস্থা সহজভাবে দেখুন।"
    >
      <GoogleSourcesClient accounts={accounts} knowledgeGraph={google.knowledgeGraph} />
    </OsPage>
  );
}
