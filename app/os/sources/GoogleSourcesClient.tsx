'use client';

import { useState } from 'react';
import { styles } from '../_components/OsPage';
import type { ConnectedGoogleAccount, GoogleServiceName } from '@/lib/google-integrations';

type Props = { accounts: ConnectedGoogleAccount[] };
type SyncResult = { status: string; message: string };
const serviceLabels: Record<GoogleServiceName, string> = { gmail: 'Gmail', calendar: 'Calendar', docs: 'Docs', sheets: 'Sheets' };

function formatDate(value: string | null) {
  if (!value) return 'এখনও sync হয়নি';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function GoogleSourcesClient({ accounts }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, SyncResult>>({});

  async function connect() {
    setBusyId('connect');
    setError(null);
    const response = await fetch('/api/integrations/google/connect', { method: 'POST' });
    const data = await response.json();
    if (!response.ok) { setError(data.error ?? 'Unable to start Google OAuth'); setBusyId(null); return; }
    window.location.href = data.authUrl;
  }

  async function disconnect(id: string) {
    setBusyId(id);
    setError(null);
    const response = await fetch(`/api/integrations/google/account/${id}`, { method: 'DELETE' });
    if (!response.ok) { const data = await response.json(); setError(data.error ?? 'Unable to disconnect account'); setBusyId(null); return; }
    window.location.reload();
  }

  async function sync(sourceId: string, service: 'gmail' | 'calendar' | 'drive') {
    const key = `${sourceId}-${service}`;
    setBusyId(key);
    setError(null);
    const response = await fetch(`/api/integrations/google/${service}/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceId }) });
    const data = await response.json();
    if (!response.ok) setResults((current) => ({ ...current, [key]: { status: 'error', message: data.error ?? 'Sync failed' } }));
    else setResults((current) => ({ ...current, [key]: { status: 'success', message: `${data.imported ?? 0} items imported` } }));
    setBusyId(null);
  }

  function serviceStatus(account: ConnectedGoogleAccount, serviceName: GoogleServiceName) {
    const service = account.services.find((item) => item.service_name === serviceName);
    if (!service) return 'Not enabled';
    if (service.status === 'error') return `Error${service.last_error ? `: ${service.last_error}` : ''}`;
    if (service.last_sync_at) return `Last sync: ${formatDate(service.last_sync_at)}`;
    return service.status === 'enabled' ? 'Enabled' : 'Not enabled';
  }

  return (
    <>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Connected Google Accounts</h2>
            <p>Read-only access only. Shaikh OS will not send, edit, delete, or modify anything.</p>
          </div>
          <button className={styles.filterLink} type="button" onClick={connect} disabled={busyId === 'connect'}>
            {busyId === 'connect' ? 'Connecting…' : 'Connect Google read-only'}
          </button>
        </div>
        {error ? <p className={styles.warning}>{error}</p> : null}
        <div className={styles.grid}>
          {accounts.length ? accounts.map((account) => (
            <article className={styles.card} key={account.id}>
              <p className={styles.cardMeta}>{account.provider} · {account.status}</p>
              <h3>{account.display_name || account.account_email}</h3>
              <p>Email: {account.account_email}</p>
              <p>Connected since: {formatDate(account.created_at)}</p>
              <p>Last sync: {formatDate(account.last_sync)}</p>
              <div className={styles.badgeRow}>
                {(Object.keys(serviceLabels) as GoogleServiceName[]).map((service) => <span key={service}>{serviceLabels[service]}: {serviceStatus(account, service)}</span>)}
              </div>
              <div className={styles.badgeRow}>
                <button className={styles.filterLink} type="button" onClick={() => sync(account.id, 'gmail')} disabled={busyId === `${account.id}-gmail`}>{busyId === `${account.id}-gmail` ? 'Syncing…' : 'Sync Gmail'}</button>
                <button className={styles.filterLink} type="button" onClick={() => sync(account.id, 'calendar')} disabled={busyId === `${account.id}-calendar`}>{busyId === `${account.id}-calendar` ? 'Syncing…' : 'Sync Calendar'}</button>
                <button className={styles.filterLink} type="button" onClick={() => sync(account.id, 'drive')} disabled={busyId === `${account.id}-drive`}>{busyId === `${account.id}-drive` ? 'Syncing…' : 'Sync Docs/Sheets'}</button>
                <button className={styles.filterLink} type="button" onClick={connect}>Reconnect with read-only access</button>
                <button className={styles.filterLink} type="button" onClick={() => disconnect(account.id)} disabled={busyId === account.id}>{busyId === account.id ? 'Disconnecting…' : 'Disconnect'}</button>
              </div>
              {['gmail', 'calendar', 'drive'].map((service) => results[`${account.id}-${service}`] ? <p className={results[`${account.id}-${service}`].status === 'success' ? styles.cardMeta : styles.warning} key={service}>{service}: {results[`${account.id}-${service}`].message}</p> : null)}
            </article>
          )) : (
            <article className={styles.card}>
              <p className={styles.cardMeta}>not connected</p>
              <h3>কোনো Google account connected নেই</h3>
              <p>Read-only Google OAuth দিয়ে account connect করুন। Real data না থাকলে Shaikh OS কোনো fake data দেখাবে না।</p>
            </article>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><div><h2>Recent Gmail signals</h2><p>Synced Gmail snippets only; full body is not stored.</p></div></div>
        <div className={styles.grid}>{accounts.flatMap((account) => account.previews.gmail.map((item, index) => <article className={styles.card} key={`${account.id}-gmail-${index}`}><p className={styles.cardMeta}>{account.account_email} · {formatDate(item.timestamp)}</p><h3>{item.title}</h3><p>{item.detail || 'কোনো Gmail signal sync হয়নি।'}</p></article>))}</div>
        {accounts.every((account) => !account.previews.gmail.length) ? <p className={styles.warning}>কোনো Gmail signal sync হয়নি।</p> : null}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><div><h2>Upcoming Calendar events</h2><p>Upcoming 14-day events from read-only Calendar sync.</p></div></div>
        <div className={styles.grid}>{accounts.flatMap((account) => account.previews.calendar.map((item, index) => <article className={styles.card} key={`${account.id}-calendar-${index}`}><p className={styles.cardMeta}>{account.account_email} · {formatDate(item.timestamp)}</p><h3>{item.title}</h3><p>{item.detail || 'কোনো event description নেই।'}</p></article>))}</div>
        {accounts.every((account) => !account.previews.calendar.length) ? <p className={styles.warning}>কোনো upcoming Calendar event sync হয়নি।</p> : null}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><div><h2>Recent Docs/Sheets</h2><p>Drive metadata only. Document and spreadsheet bodies are not read.</p></div></div>
        <div className={styles.grid}>{accounts.flatMap((account) => account.previews.drive.map((item, index) => <article className={styles.card} key={`${account.id}-drive-${index}`}><p className={styles.cardMeta}>{account.account_email} · {formatDate(item.timestamp)}</p><h3>{item.title}</h3><p>{item.detail || 'Metadata only'}</p></article>))}</div>
        {accounts.every((account) => !account.previews.drive.length) ? <p className={styles.warning}>কোনো Docs/Sheets metadata sync হয়নি।</p> : null}
      </section>
    </>
  );
}
