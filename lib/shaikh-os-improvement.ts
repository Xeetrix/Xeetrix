import { financeEntries, healthEntries, memoryItems } from './shaikh-os-memory';
import { listGoogleAccounts, listGoogleIntelligence } from './google-integrations';

export type AuditMetric = { label: string; value: number | string; detail: string; severity?: 'good' | 'warning' | 'bad' };
export type SystemWeakness = { id: string; title: string; detail: string; evidence: string[]; severity: 'low' | 'medium' | 'high' };
export type ImprovementProposal = { id: string; observation: string; problem: string; recommendation: string; expectedImpact: string; riskLevel: 'low' | 'medium' | 'high'; complexity: 'low' | 'medium' | 'high'; codexPrompt: string; status: 'later' | 'useful' | 'not_useful' | 'approved' };
export type SystemAuditSnapshot = { capturedAt: string; metrics: AuditMetric[]; emptySections: string[]; stalePages: string[]; failedSyncDiagnostics: string[]; commandParsingConfidenceAverage: number | null; clarificationCount: number; cancelledPlansCount: number; weaknesses: SystemWeakness[]; proposals: ImprovementProposal[] };

type UnknownRecord = Record<string, unknown>;

const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL ?? 'https://api.xeetrix.com';
const AGENT_API_SECRET = process.env.AGENT_API_SECRET;

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
  const config = supabaseConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/rest/v1/${path}`, { ...init, headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) }, cache: 'no-store' });
  if (!response.ok) return null;
  if (response.status === 204) return null;
  return response.json() as Promise<T>;
}

export async function buildSystemAuditSnapshot(): Promise<SystemAuditSnapshot> {
  const [googleAccounts, google, persistedFeedback, actionPlans, reasoningLogs] = await Promise.all([
    listGoogleAccounts().catch(() => []),
    listGoogleIntelligence().catch(() => ({ gmailSignals: [], driveSignals: [], contactCandidates: [], knowledgeGraph: { entities: [], signals: [], needsReview: [], projectLinks: {} } })),
    supabaseRequest<UnknownRecord[]>('agent_feedback?select=feedback_type,raw_feedback,created_at&order=created_at.desc&limit=200'),
    supabaseRequest<UnknownRecord[]>('agent_action_plans?select=status,confidence,action_type,created_at&order=created_at.desc&limit=200'),
    supabaseRequest<UnknownRecord[]>('agent_reasoning_logs?select=confidence,created_at&order=created_at.desc&limit=200'),
  ]);

  const projects = new Set(memoryItems.map((item) => item.project).filter((project) => project !== 'General'));
  const openTasks = memoryItems.filter((item) => item.intent === 'task');
  const notes = memoryItems.filter((item) => item.intent === 'note' || item.intent === 'idea' || item.intent === 'decision');
  const failedLogs = googleAccounts.flatMap((account) => account.sync_logs.filter((log) => log.status !== 'success'));
  const failedSyncDiagnostics = failedLogs.map((log) => `${log.sync_type}: ${log.message ?? log.error_code ?? 'failed'}${log.missing_scope ? ` (missing ${log.missing_scope})` : ''}`).slice(0, 8);
  const confidenceValues = [...(reasoningLogs ?? []), ...(actionPlans ?? [])].map((row) => typeof row.confidence === 'number' ? row.confidence : null).filter((value): value is number => value !== null);
  const commandParsingConfidenceAverage = confidenceValues.length ? Number((confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length).toFixed(3)) : null;
  const clarificationCount = (actionPlans ?? []).filter((row) => row.action_type === 'ask_clarification' || row.status === 'clarification').length;
  const cancelledPlansCount = (actionPlans ?? []).filter((row) => String(row.status ?? '').match(/cancel/)).length + (persistedFeedback ?? []).filter((row) => String(row.feedback_type ?? row.raw_feedback ?? '').match(/cancel|not_useful/)).length;
  const emptySections = [
    openTasks.length ? null : 'Open tasks',
    notes.length ? null : 'Notes/decisions',
    healthEntries.length ? null : 'Health logs',
    financeEntries.length ? null : 'Finance logs',
    googleAccounts.length ? null : 'Connected Google accounts',
    google.knowledgeGraph.signals.length ? null : 'Google knowledge signals',
  ].filter(Boolean) as string[];
  const stalePages = memoryItems.filter((item) => (Date.now() - new Date(item.createdAt).getTime()) / 86400000 > 14).map((item) => `${item.project}: ${item.title}`).slice(0, 8);
  const weaknesses = detectWeaknesses({ emptySections, failedSyncDiagnostics, commandParsingConfidenceAverage, clarificationCount, cancelledPlansCount, googleSignals: google.knowledgeGraph.signals.length, linkedGoogleSignals: Object.values(google.knowledgeGraph.projectLinks).flat().filter((signal) => signal.project !== 'Needs Review').length, healthStructuredFields: healthEntries, memoryCount: memoryItems.length });
  const proposals = await generateImprovementProposals(weaknesses);

  return { capturedAt: new Date().toISOString(), metrics: [
    { label: 'Total projects', value: projects.size, detail: 'From current Shaikh OS memory items' },
    { label: 'Open tasks', value: openTasks.length, detail: 'Real task intent records' },
    { label: 'Notes', value: notes.length, detail: 'Notes, ideas, decisions' },
    { label: 'Health logs', value: healthEntries.length, detail: 'Structured health entries available' },
    { label: 'Finance logs', value: financeEntries.length, detail: 'Structured finance entries available' },
    { label: 'Connected Google accounts', value: googleAccounts.length, detail: 'Read-only accounts registered in Supabase' },
    { label: 'Latest sync status', value: googleAccounts[0]?.last_sync ?? 'No sync', detail: failedLogs.length ? `${failedLogs.length} failed sync log(s)` : 'No failed sync logs detected', severity: failedLogs.length ? 'warning' : 'good' },
    { label: 'Avg parse confidence', value: commandParsingConfidenceAverage ?? 'Unavailable', detail: confidenceValues.length ? `${confidenceValues.length} reasoning/action records` : 'No persisted confidence history yet' },
    { label: 'Clarifications', value: clarificationCount, detail: 'Ask-clarification action plans' },
    { label: 'Cancelled plans', value: cancelledPlansCount, detail: 'Cancelled or not-useful feedback signals' },
  ], emptySections, stalePages, failedSyncDiagnostics, commandParsingConfidenceAverage, clarificationCount, cancelledPlansCount, weaknesses, proposals };
}

function detectWeaknesses(input: { emptySections: string[]; failedSyncDiagnostics: string[]; commandParsingConfidenceAverage: number | null; clarificationCount: number; cancelledPlansCount: number; googleSignals: number; linkedGoogleSignals: number; healthStructuredFields: unknown[]; memoryCount: number }): SystemWeakness[] {
  const weaknesses: SystemWeakness[] = [];
  if (input.emptySections.length) weaknesses.push({ id: 'empty-sections', title: 'Sections with no real data', detail: 'Some OS sections are empty and should say so plainly instead of showing filler.', evidence: input.emptySections, severity: 'medium' });
  if (input.failedSyncDiagnostics.length >= 2) weaknesses.push({ id: 'repeated-sync-failures', title: 'Repeated failed sync', detail: 'Google sync errors need grouped diagnostics and recovery guidance.', evidence: input.failedSyncDiagnostics, severity: 'high' });
  if (input.commandParsingConfidenceAverage !== null && input.commandParsingConfidenceAverage < 0.72) weaknesses.push({ id: 'low-command-confidence', title: 'Low confidence command parses', detail: 'Average parser confidence is below the safe execution threshold.', evidence: [`Average: ${input.commandParsingConfidenceAverage}`], severity: 'high' });
  if (input.clarificationCount > 5) weaknesses.push({ id: 'too-many-clarifications', title: 'Too many clarifications', detail: 'The agent is asking too many follow-up questions before producing useful plans.', evidence: [`Clarifications: ${input.clarificationCount}`], severity: 'medium' });
  if (input.cancelledPlansCount > 3) weaknesses.push({ id: 'too-many-cancellations', title: 'Too many cancelled confirmations', detail: 'Users are rejecting proposed plans often enough to tune proposal quality.', evidence: [`Cancelled: ${input.cancelledPlansCount}`], severity: 'medium' });
  if (input.healthStructuredFields.length && !JSON.stringify(input.healthStructuredFields).match(/severity|duration|trigger|medication/i)) weaknesses.push({ id: 'health-structure', title: 'Health logs not structured enough', detail: 'Health records track basics but miss severity, duration, trigger, and medication fields.', evidence: ['Current health entries only expose sleep, mood, energy, symptoms'], severity: 'medium' });
  if (input.googleSignals && input.linkedGoogleSignals < input.googleSignals) weaknesses.push({ id: 'google-project-links', title: 'Google signals not linked to projects', detail: 'Some Google signals remain unlinked or in review, reducing project context.', evidence: [`Linked ${input.linkedGoogleSignals} of ${input.googleSignals}`], severity: 'medium' });
  if (input.memoryCount > 0) weaknesses.push({ id: 'static-memory-risk', title: 'Static metrics still present', detail: 'Some snapshot data comes from local memory arrays, so the UI should label it as current stored memory instead of live database totals.', evidence: ['memoryItems, healthEntries, financeEntries are local records'], severity: 'low' });
  return weaknesses;
}

async function generateImprovementProposals(weaknesses: SystemWeakness[]): Promise<ImprovementProposal[]> {
  if (AGENT_API_SECRET && weaknesses.length) {
    const generated = await callPremiumModel(weaknesses).catch(() => null);
    if (generated?.length) return generated;
  }
  return weaknesses.map((weakness) => ({ id: weakness.id, observation: weakness.title, problem: weakness.detail, recommendation: recommendationFor(weakness.id), expectedImpact: impactFor(weakness.severity), riskLevel: weakness.severity === 'high' ? 'medium' : 'low', complexity: weakness.id.includes('sync') || weakness.id.includes('google') ? 'medium' : 'low', status: 'later', codexPrompt: buildCodexPrompt(weakness) }));
}

async function callPremiumModel(weaknesses: SystemWeakness[]) {
  const response = await fetch(new URL('/chat', AGENT_API_URL), { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-key': AGENT_API_SECRET ?? '' }, body: JSON.stringify({ taskType: 'premium', message: `Generate Shaikh OS improvement proposals as JSON array with id, observation, problem, recommendation, expectedImpact, riskLevel, complexity, codexPrompt. Weaknesses: ${JSON.stringify(weaknesses)}` }), cache: 'no-store' });
  const data = await response.json().catch(() => null) as UnknownRecord | null;
  const text = typeof data?.reply === 'string' ? data.reply : '';
  const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '')) as Partial<ImprovementProposal>[];
  return parsed.map((item, index) => ({ id: item.id ?? `premium-${index}`, observation: item.observation ?? '', problem: item.problem ?? '', recommendation: item.recommendation ?? '', expectedImpact: item.expectedImpact ?? '', riskLevel: item.riskLevel ?? 'low', complexity: item.complexity ?? 'medium', codexPrompt: item.codexPrompt ?? '', status: 'later' as const }));
}

function recommendationFor(id: string) { return ({ 'empty-sections': 'Add explicit empty-state components that explain what real data is missing and how to add it.', 'repeated-sync-failures': 'Group failed sync diagnostics by account/service and show the next recovery action.', 'low-command-confidence': 'Add parse confidence history, examples, and safer clarification thresholds.', 'too-many-clarifications': 'Improve intent prompts with recent accepted commands and allow partial draft plans.', 'too-many-cancellations': 'Capture cancellation reasons and surface plan-quality trends.', 'health-structure': 'Expand health log schema/UI with severity, duration, trigger, medication, and follow-up fields.', 'google-project-links': 'Add a review queue for Google signals and project-link correction actions.', 'static-memory-risk': 'Replace static memory counts with persisted database/API counts or label them clearly as stored seed memory.' } as Record<string, string>)[id] ?? 'Improve the related system area using only real stored data.'; }
function impactFor(severity: SystemWeakness['severity']) { return severity === 'high' ? 'High: safer decisions and fewer failed workflows.' : severity === 'medium' ? 'Medium: better trust and less manual review.' : 'Low: clearer expectations and less confusion.'; }
function buildCodexPrompt(weakness: SystemWeakness) { return `Improve Shaikh OS ${weakness.title}. Requirements: analysis/proposal only unless explicitly approved; use real data only; no mock metrics; no auto-deploy; no GitHub modifications. Evidence: ${weakness.evidence.join('; ')}. Implement UI/storage changes needed to address: ${weakness.detail}`; }

export async function persistAudit(snapshot: SystemAuditSnapshot) {
  await supabaseRequest('agent_system_audits', { method: 'POST', body: JSON.stringify({ snapshot, metrics: snapshot.metrics, weaknesses: snapshot.weaknesses, captured_at: snapshot.capturedAt }) });
  if (snapshot.proposals.length) await supabaseRequest('agent_improvement_proposals?on_conflict=proposal_key', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(snapshot.proposals.map((proposal) => ({ proposal_key: proposal.id, observation: proposal.observation, problem: proposal.problem, recommendation: proposal.recommendation, expected_impact: proposal.expectedImpact, risk_level: proposal.riskLevel, implementation_complexity: proposal.complexity, codex_prompt: proposal.codexPrompt, status: proposal.status }))) });
}

export async function saveProposalFeedback(proposalKey: string, feedbackType: ImprovementProposal['status']) {
  await supabaseRequest('agent_feedback', { method: 'POST', body: JSON.stringify({ proposal_key: proposalKey, feedback_type: feedbackType, raw_feedback: `Improvement proposal marked ${feedbackType}`, correction: { proposal_key: proposalKey, feedback_type: feedbackType } }) });
  await supabaseRequest(`agent_improvement_proposals?proposal_key=eq.${encodeURIComponent(proposalKey)}`, { method: 'PATCH', body: JSON.stringify({ status: feedbackType, updated_at: new Date().toISOString() }) });
}
