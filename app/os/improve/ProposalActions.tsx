'use client';

import { useState } from 'react';
import { styles } from '../_components/OsPage';

const actions = [
  { value: 'useful', label: 'Useful' },
  { value: 'not_useful', label: 'Not useful' },
  { value: 'later', label: 'Later' },
  { value: 'approved', label: 'Approve for Codex Prompt' },
] as const;

export default function ProposalActions({ proposalKey, codexPrompt }: { proposalKey: string; codexPrompt: string }) {
  const [status, setStatus] = useState<string>('');
  const [saving, setSaving] = useState(false);

  async function mark(feedbackType: string) {
    setSaving(true);
    const response = await fetch('/api/os/improve/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proposalKey, feedbackType }) });
    setStatus(response.ok ? feedbackType : 'error');
    setSaving(false);
  }

  return (
    <div className={styles.badgeRow}>
      {actions.map((action) => <button className={styles.filterLink} disabled={saving} key={action.value} onClick={() => mark(action.value)} type="button">{action.label}</button>)}
      {status === 'approved' ? <pre style={{ whiteSpace: 'pre-wrap', width: '100%', color: '#e9edff' }}>{codexPrompt}</pre> : null}
      {status && status !== 'approved' ? <span className={styles.badge}>Saved: {status}</span> : null}
    </div>
  );
}
