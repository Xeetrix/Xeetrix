'use client';

import { useState } from 'react';
import { styles } from '../_components/OsPage';
import type { EngineeringPlan, EvidenceMetric } from '@/lib/shaikh-os-improvement';

const actions = [
  { value: 'useful', label: 'Useful' },
  { value: 'not_useful', label: 'Not useful' },
  { value: 'later', label: 'Later' },
  { value: 'approved', label: 'Approve for Codex Prompt' },
] as const;

export default function ProposalActions({ proposalKey, title, weaknessSummary, recommendation, impact, proposalSource, generatedTimestamp, codexPrompt, initialStatus, evidence, metrics, reasoning, engineeringPlan }: { proposalKey: string; title: string; weaknessSummary: string; recommendation: string; impact: string; proposalSource: string; generatedTimestamp: string; codexPrompt: string; initialStatus: string; evidence: string[]; metrics: EvidenceMetric[]; reasoning: string[]; engineeringPlan: EngineeringPlan }) {
  const [status, setStatus] = useState<string>(initialStatus ?? '');
  const [issueUrl, setIssueUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [creatingIssue, setCreatingIssue] = useState(false);

  async function mark(feedbackType: string) {
    setSaving(true);
    const response = await fetch('/api/os/improve/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proposalKey, feedbackType }) });
    setStatus(response.ok ? feedbackType : 'error');
    setSaving(false);
  }

  async function createIssue() {
    setCreatingIssue(true);
    const response = await fetch('/api/integrations/github/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, weakness_summary: weaknessSummary, recommendation, impact, proposal_source: proposalSource, evidence, metrics, reasoning, acceptance_criteria: ['Evidence, reasoning, metrics, confidence, and expected impact are visible.', 'Engineering plan and Codex prompt are generated but not executed automatically.', 'Human approval is required before development, merge, or deployment.'], suggested_implementation: engineeringPlan.implementationSteps.join('\n'), generated_timestamp: generatedTimestamp, source_type: 'improvement_proposal', source_id: proposalKey }),
    });
    const data = await response.json().catch(() => null) as { url?: string; error?: string } | null;
    setIssueUrl(response.ok && data?.url ? data.url : `error:${data?.error ?? 'GitHub issue creation failed'}`);
    setCreatingIssue(false);
  }

  return (
    <div className={styles.badgeRow}>
      {actions.map((action) => <button className={styles.filterLink} disabled={saving || creatingIssue} key={action.value} onClick={() => mark(action.value)} type="button">{action.label}</button>)}
      <button className={styles.filterLink} disabled={creatingIssue || status !== 'approved'} onClick={createIssue} type="button">{creatingIssue ? 'Creating issue…' : 'Create GitHub Issue'}</button>
      {status !== 'approved' ? <span className={styles.badge}>Approval required before issue creation</span> : null}
      {status === 'approved' ? <pre style={{ whiteSpace: 'pre-wrap', width: '100%', color: '#e9edff' }}>{codexPrompt}</pre> : null}
      {issueUrl && !issueUrl.startsWith('error:') ? <a className={styles.badge} href={issueUrl} rel="noreferrer" target="_blank">GitHub issue created</a> : null}
      {issueUrl.startsWith('error:') ? <span className={styles.badge}>{issueUrl.replace('error:', '')}</span> : null}
      {status && status !== 'approved' ? <span className={styles.badge}>Saved: {status}</span> : null}
    </div>
  );
}
