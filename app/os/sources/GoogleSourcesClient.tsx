'use client';

import { useState } from 'react';
import { styles } from '../_components/OsPage';
import type { ConnectedGoogleAccount, GoogleKnowledgeGraph, GoogleServiceName } from '@/lib/google-integrations';

type Props = { accounts: ConnectedGoogleAccount[]; knowledgeGraph: GoogleKnowledgeGraph };
type SyncResult = { status: string; message: string; endpoint?: string; httpStatus?: number; errorCode?: string; missingScope?: string };
const serviceLabels: Record<GoogleServiceName, string> = { gmail: 'Gmail', calendar: 'Calendar', docs: 'Docs', sheets: 'Sheets' };

function formatDate(value: string | null) {
  if (!value) return 'এখনও sync হয়নি';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function GoogleSourcesClient({ accounts, knowledgeGraph }: Props) {
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
    if (!response.ok) setResults((current) => ({ ...current, [key]: { status: 'error', message: data.error ?? 'Sync failed', endpoint: data.diagnostic?.endpoint, httpStatus: data.diagnostic?.httpStatus, errorCode: data.diagnostic?.errorCode, missingScope: data.diagnostic?.missingScope } }));
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



  function renderDiagnostic(label: string, diagnostic: SyncResult) {
    return (
      <div className={styles.warning} key={label}>
        <strong>{label} failed</strong>
        <ul>
          {diagnostic.endpoint ? <li>Endpoint: <code>{diagnostic.endpoint}</code></li> : null}
          {diagnostic.httpStatus ? <li>HTTP status: {diagnostic.httpStatus}</li> : null}
          {diagnostic.errorCode ? <li>Error code: {diagnostic.errorCode}</li> : null}
          <li>Error message: {diagnostic.message}</li>
          {diagnostic.missingScope ? <li>Missing scope: <code>{diagnostic.missingScope}</code></li> : null}
        </ul>
      </div>
    );
  }

  function missingScopes(account: ConnectedGoogleAccount) {
    return [...new Set(account.services.flatMap((service) => service.missing_scopes ?? []))];
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
              {missingScopes(account).length ? <p className={styles.warning}>Missing scopes: {missingScopes(account).join(', ')}</p> : null}
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
              {['gmail', 'calendar', 'drive'].map((service) => { const result = results[`${account.id}-${service}`]; if (!result) return null; return result.status === 'success' ? <p className={styles.cardMeta} key={service}>{service}: {result.message}</p> : renderDiagnostic(service, result); })}
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
        <div className={styles.sectionHeader}><div><h2>Google থেকে পাওয়া গুরুত্বপূর্ণ সংকেত</h2><p>Only real imported Gmail, Drive, and Calendar data is linked into projects; unclear items stay in Needs Review.</p></div></div>
        <div className={styles.grid}>
          <article className={styles.card}><p className={styles.cardMeta}>Knowledge Graph v1</p><h3>Signals</h3><ul>{knowledgeGraph.signals.length ? knowledgeGraph.signals.slice(0, 5).map((signal) => <li key={signal.id}>{signal.title} — {signal.project}</li>) : <li>Real Google sync data না থাকলে signal দেখানো হবে না।</li>}</ul></article>
          <article className={styles.card}><p className={styles.cardMeta}>Extracted entities</p><h3>People / orgs / docs / leads</h3><p>{knowledgeGraph.entities.length}টি entity imported Google data থেকে detect হয়েছে। Fake metrics নয়—sync না হলে 0 দেখাবে।</p></article>
          <article className={`${styles.card} ${knowledgeGraph.needsReview.length ? styles.warning : ''}`}><p className={styles.cardMeta}>Needs Review</p><h3>Unclear items</h3><ul>{knowledgeGraph.needsReview.length ? knowledgeGraph.needsReview.slice(0, 5).map((signal) => <li key={signal.id}>{signal.detail}</li>) : <li>Review queue খালি।</li>}</ul></article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}><div><h2>Google Workspace diagnostics</h2><p>Recent failed sync details from Google APIs. Tokens are never displayed.</p></div></div>
        <div className={styles.grid}>{accounts.flatMap((account) => account.sync_logs.filter((log) => log.status === 'error').map((log) => <article className={styles.card} key={log.id}><p className={styles.cardMeta}>{account.account_email} · {log.sync_type} · {formatDate(log.created_at)}</p><h3>{log.error_code || 'Google API error'}</h3><ul><li>Endpoint: <code>{log.endpoint || 'not captured'}</code></li><li>HTTP status: {log.http_status || 'not captured'}</li><li>Error code: {log.error_code || 'not captured'}</li><li>Error message: {log.message || 'Sync failed'}</li>{log.missing_scope ? <li>Missing scope: <code>{log.missing_scope}</code></li> : null}</ul></article>))}</div>
        {accounts.every((account) => !account.sync_logs.some((log) => log.status === 'error')) ? <p className={styles.cardMeta}>No failed Google sync diagnostics yet.</p> : null}
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
