import type { Metadata } from 'next';
import OsPage, { styles } from '../_components/OsPage';
import { buildSystemAuditSnapshot, persistAudit } from '@/lib/shaikh-os-improvement';
import { getGitHubRepository, getGitHubStatus, listLatestGitHubIssues } from '@/lib/github-integration';
import ProposalActions from './ProposalActions';

export const metadata: Metadata = { title: 'Self Improvement | Shaikh OS' };
export const dynamic = 'force-dynamic';

export default async function ImprovePage() {
  const snapshot = await buildSystemAuditSnapshot();
  await persistAudit(snapshot).catch(() => null);
  const [githubStatus, githubRepo, latestIssues] = await Promise.all([
    getGitHubStatus().catch((error) => ({ configured: Boolean(process.env.GITHUB_TOKEN), connected: false, connection: null, error: error instanceof Error ? error.message : 'GitHub status unavailable' })),
    getGitHubRepository().catch((error) => ({ configured: Boolean(process.env.GITHUB_TOKEN), repository: null, error: error instanceof Error ? error.message : 'GitHub repository unavailable' })),
    listLatestGitHubIssues().catch(() => []),
  ]);

  return (
    <OsPage
      eyebrow="Self Improvement Center v1"
      title="Shaikh OS নিজেকে কীভাবে উন্নত করবে"
      subtitle="Analysis and proposal only. এই পেজ real system state পড়ে weakness detect করে, কিন্তু automatic code change, deploy, বা GitHub modification করে না।"
      stats={snapshot.metrics.slice(0, 6).map((metric) => ({ label: metric.label, value: String(metric.value), detail: metric.detail }))}
    >
      <section className={styles.section} id="audit">
        <div className={styles.sectionHeader}><div><h2>System Audit Snapshot</h2><p>Captured at {snapshot.capturedAt}. No mock data or fake metrics are generated.</p></div></div>
        <div className={styles.grid}>
          {snapshot.metrics.map((metric) => <article className={`${styles.card} ${metric.severity === 'warning' ? styles.warning : ''}`} key={metric.label}><p className={styles.cardMeta}>{metric.label}</p><h3>{metric.value}</h3><p>{metric.detail}</p></article>)}
        </div>
      </section>

      <section className={styles.section} id="weaknesses">
        <div className={styles.sectionHeader}><div><h2>Weakness Detection</h2><p>Sections with no data, failed sync, command confidence, clarification, cancellation, Google linking, and static metric risks.</p></div></div>
        <div className={styles.grid}>
          {snapshot.weaknesses.length ? snapshot.weaknesses.map((weakness) => <article className={`${styles.card} ${weakness.severity === 'high' ? styles.warning : ''}`} key={weakness.id}><p className={styles.cardMeta}>{weakness.severity} severity</p><h3>{weakness.title}</h3><p>{weakness.detail}</p><ul>{weakness.evidence.map((item) => <li key={item}>{item}</li>)}</ul></article>) : <article className={styles.card}><h3>No weaknesses detected</h3><p>Current data did not trigger configured weakness rules.</p></article>}
        </div>
      </section>

      <section className={styles.section} id="empty-stale">
        <div className={styles.sectionHeader}><div><h2>Empty sections & stale pages</h2><p>Explicitly listed so the OS does not hide gaps behind fake cards.</p></div></div>
        <div className={styles.twoColumn}>
          <article className={styles.card}><h3>Empty sections</h3><ul>{snapshot.emptySections.length ? snapshot.emptySections.map((item) => <li key={item}>{item}</li>) : <li>No empty sections detected.</li>}</ul></article>
          <article className={styles.card}><h3>Stale pages/items</h3><ul>{snapshot.stalePages.length ? snapshot.stalePages.map((item) => <li key={item}>{item}</li>) : <li>No stale memory items older than threshold.</li>}</ul></article>
          <article className={styles.card}><h3>Failed sync diagnostics</h3><ul>{snapshot.failedSyncDiagnostics.length ? snapshot.failedSyncDiagnostics.map((item) => <li key={item}>{item}</li>) : <li>No failed Google sync diagnostics found.</li>}</ul></article>
        </div>
      </section>


      <section className={styles.section} id="development-agency">
        <div className={styles.sectionHeader}><div><h2>Development Agency</h2><p>Safe GitHub foundation for approved self-improvement proposals. Issue creation only; no code changes, PR creation, or deployment is triggered here.</p></div></div>
        <div className={styles.twoColumn}>
          <article className={styles.card}>
            <p className={styles.cardMeta}>GitHub connection status</p>
            <h3>{githubStatus.connected ? 'Connected' : githubStatus.configured ? 'Token configured, connection pending' : 'Not configured'}</h3>
            <p>{githubStatus.connection?.github_username ? `Connected as ${githubStatus.connection.github_username}` : 'Set GITHUB_TOKEN server-side to connect GitHub without exposing credentials to the browser.'}</p>
          </article>
          <article className={styles.card}>
            <p className={styles.cardMeta}>Connected repository</p>
            <h3>{githubRepo.repository?.repo_full_name ?? process.env.GITHUB_REPO_FULL_NAME ?? 'Xeetrix/Xeetrix'}</h3>
            <p>{githubRepo.repository?.repo_url ? <a href={githubRepo.repository.repo_url} rel="noreferrer" target="_blank">{githubRepo.repository.repo_url}</a> : 'Repository will be verified server-side when GitHub is configured.'}</p>
            {githubRepo.repository?.default_branch ? <p>Default branch: {githubRepo.repository.default_branch}</p> : null}
          </article>
        </div>
        <div className={styles.grid}>
          {latestIssues.length ? latestIssues.map((issue) => <article className={styles.card} key={issue.id || `${issue.github_issue_number}-${issue.source_id}`}>
            <p className={styles.cardMeta}>Issue #{issue.github_issue_number} · {issue.status}</p>
            <h3>{issue.title}</h3>
            {issue.github_issue_url ? <p><a href={issue.github_issue_url} rel="noreferrer" target="_blank">Open issue</a></p> : null}
          </article>) : <article className={styles.card}><h3>No GitHub issues created yet</h3><p>Approved improvement proposals can create real GitHub issues in the configured repository.</p></article>}
        </div>
      </section>

      <section className={styles.section} id="proposals">
        <div className={styles.sectionHeader}><div><h2>Improvement Proposals</h2><p>Premium-model proposals when available; deterministic proposal fallback otherwise. Prompts are generated only for user approval and are never executed automatically.</p></div></div>
        <div className={styles.grid}>
          {snapshot.proposals.map((proposal) => <article className={styles.card} key={proposal.id}>
            <p className={styles.cardMeta}>OS কী লক্ষ্য করেছে</p><h3>{proposal.observation}</h3>
            <p><strong>সমস্যা:</strong> {proposal.problem}</p>
            <p><strong>প্রস্তাবিত উন্নয়ন:</strong> {proposal.recommendation}</p>
            <p><strong>প্রভাব:</strong> {proposal.expectedImpact}</p>
            <p><strong>ঝুঁকি:</strong> {proposal.riskLevel} · <strong>Complexity:</strong> {proposal.complexity}</p>
            <ProposalActions proposalKey={proposal.id} title={proposal.observation} body={proposal.codexPrompt} codexPrompt={proposal.codexPrompt} initialStatus={proposal.status} />
          </article>)}
        </div>
      </section>
    </OsPage>
  );
}
