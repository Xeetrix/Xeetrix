'use client';

import { useState } from 'react';
import { styles } from '../_components/OsPage';
import type { ConnectedGoogleAccount } from '@/lib/google-integrations';

type Props = { accounts: ConnectedGoogleAccount[] };

function formatDate(value: string | null) {
  if (!value) return 'No sync yet';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function GoogleSourcesClient({ accounts }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setBusyId('connect');
    setError(null);
    const response = await fetch('/api/integrations/google/connect', { method: 'POST' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? 'Unable to start Google OAuth');
      setBusyId(null);
      return;
    }
    window.location.href = data.authUrl;
  }

  async function disconnect(id: string) {
    setBusyId(id);
    setError(null);
    const response = await fetch(`/api/integrations/google/account/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? 'Unable to disconnect account');
      setBusyId(null);
      return;
    }
    window.location.reload();
  }

  return (
    <>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Connected Accounts</h2>
            <p>Google identity registration only. Gmail, Calendar, Docs, and Sheets content is not imported in Phase 1.</p>
          </div>
          <button className={styles.filterLink} type="button" onClick={connect} disabled={busyId === 'connect'}>
            {busyId === 'connect' ? 'Connecting…' : 'Connect Google'}
          </button>
        </div>
        {error ? <p className={styles.warning}>{error}</p> : null}
        <div className={styles.grid}>
          {accounts.length ? accounts.map((account) => (
            <article className={styles.card} key={account.id}>
              <p className={styles.cardMeta}>{account.status}</p>
              <h3>{account.display_name || account.account_email}</h3>
              <p>Email: {account.account_email}</p>
              <p>Provider: {account.provider}</p>
              <p>Last sync: {formatDate(account.last_sync)}</p>
              <div className={styles.badgeRow}>
                <button className={styles.filterLink} type="button" onClick={connect}>Reconnect</button>
                <button className={styles.filterLink} type="button" onClick={() => disconnect(account.id)} disabled={busyId === account.id}>
                  {busyId === account.id ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
            </article>
          )) : (
            <article className={styles.card}>
              <p className={styles.cardMeta}>not connected</p>
              <h3>No Google accounts connected</h3>
              <p>Use Connect Google to register an account through OAuth. No placeholder accounts are shown.</p>
            </article>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Workspace Services</h2>
            <p>Prepared registry sections for future scopes. These services remain read-disabled in Phase 1.</p>
          </div>
        </div>
        <div className={styles.grid}>
          {['Google Accounts', 'Gmail', 'Calendar', 'Docs', 'Sheets'].map((service) => (
            <article className={styles.card} key={service}>
              <p className={styles.cardMeta}>foundation ready</p>
              <h3>{service}</h3>
              <p>OAuth identity only. No service data is imported or displayed.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
