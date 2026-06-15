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
  const diagnostics = 'diagnostics' in githubStatus ? githubStatus.diagnostics : null;

  return (
    <OsPage
      eyebrow="Self Improvement Center v2"
      title="System Brain Dashboard"
      subtitle="Evidence-based engineering loop. Detects weaknesses, generates evidence, creates human-approved GitHub issues, plans implementation, generates Codex prompts, and tracks progress/deployments without automatic execution."
      stats={snapshot.metrics.slice(0, 6).map((metric) => ({ label: metric.label, value: String(metric.value), detail: metric.detail }))}
    >

      <section className={styles.section} id="system-brain">
        <div className={styles.sectionHeader}><div><h2>System Brain Dashboard</h2><p>Human approval is required at every execution stage. No code, PR merge, deployment, database destruction, or environment change is automatic.</p></div></div>
        <div className={styles.grid}>
          {Object.entries(snapshot.statusBoard).map(([status, count]) => <article className={styles.card} key={status}><p className={styles.cardMeta}>Execution tracker</p><h3>{status}</h3><p>{count} proposal(s)</p></article>)}
        </div>
      </section>

      <section className={styles.section} id="deployment-intelligence">
        <div className={styles.sectionHeader}><div><h2>Deployment Status</h2><p>Vercel read-only intelligence. Shaikh OS never deploys from this dashboard.</p></div></div>
        <div className={styles.twoColumn}>
          <article className={styles.card}><p className={styles.cardMeta}>Latest build status</p><h3>{snapshot.vercel.latestStatus}</h3><p>{snapshot.vercel.productionUrl ?? (snapshot.vercel.configured ? 'No production URL found in recent deployments.' : 'Set VERCEL_TOKEN to enable read-only deployment intelligence.')}</p>{snapshot.vercel.error ? <p>{snapshot.vercel.error}</p> : null}</article>
          <article className={styles.card}><p className={styles.cardMeta}>Failed deployments</p><h3>{snapshot.vercel.failedDeployments.length}</h3><ul>{snapshot.vercel.failedDeployments.length ? snapshot.vercel.failedDeployments.map((deployment) => <li key={deployment.uid}>{deployment.name}: {deployment.state}</li>) : <li>No failed deployments found in the read-only deployment window.</li>}</ul></article>
        </div>
      </section>

      <section className={styles.section} id="audit">
        <div className={styles.sectionHeader}><div><h2>System Audit Snapshot</h2><p>Captured at {snapshot.capturedAt}. No mock data or fake metrics are generated.</p></div></div>
        <div className={styles.grid}>
          {snapshot.metrics.map((metric) => <article className={`${styles.card} ${metric.severity === 'warning' ? styles.warning : ''}`} key={metric.label}><p className={styles.cardMeta}>{metric.label}</p><h3>{metric.value}</h3><p>{metric.detail}</p></article>)}
        </div>
      </section>

      <section className={styles.section} id="weaknesses">
        <div className={styles.sectionHeader}><div><h2>Weakness Detection</h2><p>Sections with no data, failed sync, command confidence, clarification, cancellation, Google linking, and static metric risks.</p></div></div>
        <div className={styles.grid}>
          {snapshot.weaknesses.length ? snapshot.weaknesses.map((weakness) => <article className={`${styles.card} ${weakness.severity === 'high' ? styles.warning : ''}`} key={weakness.id}><p className={styles.cardMeta}>{weakness.severity} severity</p><h3>{weakness.title}</h3><p>{weakness.detail}</p><p><strong>Confidence:</strong> {weakness.confidenceScore}%</p><h4>Evidence</h4><ul>{weakness.evidence.map((item) => <li key={item}>{item}</li>)}</ul><h4>Metrics</h4><ul>{weakness.metrics.map((metric) => <li key={metric.label}>{metric.label}: {metric.value}{metric.total ? `/${metric.total}` : ''} — {metric.detail}</li>)}</ul><h4>Reasoning chain</h4><ol>{weakness.reasoningChain.map((item) => <li key={item}>{item}</li>)}</ol></article>) : <article className={styles.card}><h3>No weaknesses detected</h3><p>Current data did not trigger configured weakness rules.</p></article>}
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
          <article className={styles.card}>
            <p className={styles.cardMeta}>Diagnostics</p>
            <h3>GitHub capability checks</h3>
            <ul>
              <li>GitHub token valid: {diagnostics?.checks.tokenValid ? 'Yes' : 'No'}</li>
              <li>Repository accessible: {diagnostics?.checks.repositoryAccessible ? 'Yes' : 'No'}</li>
              <li>Organization access: {diagnostics?.checks.organizationAccessible ? 'Yes' : 'No'}</li>
              <li>Issue creation permissions available: {diagnostics?.checks.issueCreationPermissionsAvailable ? 'Yes' : 'No'}</li>
            </ul>
            {diagnostics?.error ? <p>{diagnostics.error}</p> : null}
          </article>
        </div>
        <div className={styles.sectionHeader}><div><h2>Latest GitHub Issues</h2><p>Only issues created from real GitHub API responses are shown.</p></div></div>
        <div className={styles.grid}>
          {latestIssues.length ? latestIssues.map((issue) => <article className={styles.card} key={issue.id || `${issue.github_issue_number}-${issue.source_id}`}>
            <p className={styles.cardMeta}>Issue #{issue.github_issue_number} · {issue.status} · {new Date(issue.created_at).toLocaleDateString('en-US')}</p>
            <h3>{issue.title}</h3>
            {issue.github_issue_url ? <p><a href={issue.github_issue_url} rel="noreferrer" target="_blank">Open issue</a></p> : null}
          </article>) : <article className={styles.card}><h3>No GitHub issues created yet</h3><p>Approved improvement proposals can create real GitHub issues in the configured repository.</p></article>}
        </div>
      </section>


      <section className={styles.section} id="github-intelligence">
        <div className={styles.sectionHeader}><div><h2>GitHub Intelligence</h2><p>Read-only repository context connects Proposal → Issue → Prompt → Commit → Deployment.</p></div></div>
        <div className={styles.twoColumn}>
          <article className={styles.card}><h3>Open issues</h3><ul>{snapshot.githubIntelligence.openIssues.slice(0, 8).map((issue) => <li key={issue.id}><a href={issue.html_url} rel="noreferrer" target="_blank">#{issue.number} {issue.title}</a></li>)}</ul></article>
          <article className={styles.card}><h3>Recent commits</h3><ul>{snapshot.githubIntelligence.recentCommits.slice(0, 8).map((commit) => <li key={commit.sha}><a href={commit.html_url} rel="noreferrer" target="_blank">{commit.sha.slice(0, 7)}</a> {commit.message.split('\n')[0]}</li>)}</ul></article>
        </div>
        <div className={styles.grid}>{snapshot.githubIntelligence.relationships.map((item) => <article className={styles.card} key={`${item.proposal}-${item.issue}`}><p className={styles.cardMeta}>Proposal → Issue → Prompt → Commit → Deployment</p><h3>{item.proposal}</h3><p>{item.issue} → {item.prompt} → {item.commit ? 'Commit linked' : 'No commit linked'} → {item.deployment ?? 'No deployment linked'}</p></article>)}</div>
      </section>

      <section className={styles.section} id="proposals">
        <div className={styles.sectionHeader}><div><h2>Improvement Proposals</h2><p>Premium-model proposals when available; deterministic proposal fallback otherwise. Prompts are generated only for user approval and are never executed automatically.</p></div></div>
        <div className={styles.grid}>
          {snapshot.proposals.map((proposal) => <article className={styles.card} key={proposal.id}>
            <p className={styles.cardMeta}>OS কী লক্ষ্য করেছে</p><h3>{proposal.observation}</h3>
            <p><strong>সমস্যা:</strong> {proposal.problem}</p>
            <p><strong>প্রস্তাবিত উন্নয়ন:</strong> {proposal.recommendation}</p>
            <p><strong>Evidence:</strong> {proposal.evidence.join('; ')}</p>
            <p><strong>Confidence:</strong> {proposal.confidenceScore}%</p>
            <p><strong>প্রভাব:</strong> {proposal.expectedImpact}</p>
            <p><strong>ঝুঁকি:</strong> {proposal.riskLevel} · <strong>Complexity:</strong> {proposal.complexity} · <strong>Status:</strong> {proposal.executionStatus}</p>
            <h4>Engineering Plan</h4><ul><li>Effort: {proposal.engineeringPlan.estimatedEffort}</li><li>Affected files: {proposal.engineeringPlan.affectedFiles.join(', ')}</li>{proposal.engineeringPlan.implementationSteps.map((step) => <li key={step}>{step}</li>)}</ul>
            <ProposalActions proposalKey={proposal.id} title={proposal.observation} weaknessSummary={proposal.problem} recommendation={proposal.recommendation} impact={proposal.expectedImpact} proposalSource={proposal.codexPrompt} generatedTimestamp={snapshot.capturedAt} codexPrompt={proposal.codexPrompt} initialStatus={proposal.status} evidence={proposal.evidence} metrics={proposal.metrics} reasoning={proposal.reasoningChain} engineeringPlan={proposal.engineeringPlan} />
          </article>)}
        </div>
      </section>
    </OsPage>
  );
}
