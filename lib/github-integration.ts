import crypto from 'crypto';

export type GitHubConnection = {
  id: string;
  provider: string;
  github_username: string | null;
  installation_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type GitHubRepository = {
  id: string;
  connection_id: string;
  repo_full_name: string;
  repo_url: string;
  default_branch: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type GitHubIssue = {
  id: string;
  repository_id: string | null;
  github_issue_number: number;
  github_issue_url?: string;
  title: string;
  body: string;
  status: string;
  source_type: string;
  source_id: string;
  weakness_summary?: string | null;
  recommendation?: string | null;
  impact?: string | null;
  proposal_source?: string | null;
  generated_timestamp?: string | null;
  github_api_response?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type GitHubUser = { login: string; html_url?: string };
type GitHubRepo = { full_name: string; html_url: string; default_branch: string; has_issues?: boolean; permissions?: { admin?: boolean; maintain?: boolean; push?: boolean; triage?: boolean; pull?: boolean } };
type GitHubCreatedIssue = { number: number; html_url: string; state: string; title: string; body: string | null; id: number; node_id: string; created_at: string; updated_at: string; user?: { login: string } };
export type GitHubRepositoryIssue = { id: number; number: number; html_url: string; title: string; state: string; created_at: string; updated_at: string; closed_at?: string | null; body?: string | null; user?: { login: string } };
export type GitHubCommitSummary = { sha: string; html_url: string; message: string; author: string | null; date: string | null };
type GitHubOrg = { login: string; id: number; url: string; repos_url: string };

type GitHubIssueInput = {
  title: string;
  weakness_summary: string;
  recommendation: string;
  impact: string;
  proposal_source: string;
  evidence?: string[];
  metrics?: unknown[];
  reasoning?: string[];
  acceptance_criteria?: string[];
  suggested_implementation?: string;
  generated_timestamp?: string;
  source_type: 'improvement_proposal';
  source_id: string;
};

export class GitHubRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'GitHubRequestError';
    this.status = status;
  }
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
  const config = supabaseConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  if (response.status === 204) return null;
  return response.json() as Promise<T>;
}

function githubToken() {
  return process.env.GITHUB_TOKEN;
}

export function configuredRepoFullName() {
  return process.env.GITHUB_REPO_FULL_NAME ?? 'Xeetrix/Xeetrix';
}

function configuredOrgLogin() {
  return configuredRepoFullName().split('/')[0] ?? 'Xeetrix';
}

function encryptToken(token: string) {
  const secret = process.env.GITHUB_TOKEN_ENCRYPTION_SECRET || process.env.GOOGLE_TOKEN_ENCRYPTION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'shaikh-os-github-development-key';
  return crypto.createHash('sha256').update(secret).update(token).digest('hex');
}

async function githubRequest<T>(path: string, init: RequestInit = {}) {
  const token = githubToken();
  if (!token) throw new Error('GITHUB_TOKEN is not configured');
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new GitHubRequestError(response.status, data?.message ?? text ?? 'GitHub request failed');
  return data as T;
}

function canCreateIssues(repo: GitHubRepo | null) {
  if (!repo?.has_issues) return false;
  const permissions = repo.permissions;
  return Boolean(permissions?.admin || permissions?.maintain || permissions?.push || permissions?.triage);
}

function formatIssueTitle(title: string) {
  const trimmed = title.trim();
  return trimmed.startsWith('[SHAIKH-OS]') ? trimmed : `[SHAIKH-OS] ${trimmed}`;
}

function buildIssueBody(input: GitHubIssueInput) {
  return [
    '## Evidence',
    (input.evidence?.length ? input.evidence.map((item) => `- ${item}`).join('\n') : `- ${input.weakness_summary.trim()}`),
    '',
    '## Reasoning',
    (input.reasoning?.length ? input.reasoning.map((item) => `- ${item}`).join('\n') : '- Human approval is required before implementation.'),
    '',
    '## Metrics',
    (input.metrics?.length ? input.metrics.map((item) => `- ${JSON.stringify(item)}`).join('\n') : '- Metrics unavailable beyond proposal summary.'),
    '',
    '## Acceptance criteria',
    (input.acceptance_criteria?.length ? input.acceptance_criteria.map((item) => `- ${item}`).join('\n') : '- Evidence, reasoning, metrics, and human approval controls are visible.\n- No automatic merge or deployment.'),
    '',
    '## Weakness summary',
    input.weakness_summary.trim(),
    '',
    '## Recommendation',
    input.recommendation.trim(),
    '',
    '## Impact',
    input.impact.trim(),
    '',
    '## Suggested implementation',
    (input.suggested_implementation || input.recommendation).trim(),
    '',
    '## Proposal source',
    input.proposal_source.trim(),
    '',
    '## Generated timestamp',
    (input.generated_timestamp || new Date().toISOString()).trim(),
  ].join('\n');
}

export async function getGitHubDiagnostics() {
  const configured = Boolean(githubToken());
  const repoFullName = configuredRepoFullName();
  const orgLogin = configuredOrgLogin();
  let authenticatedUser: GitHubUser | null = null;
  let repository: GitHubRepo | null = null;
  let organization: GitHubOrg | null = null;
  let error: string | null = null;

  if (configured) {
    try {
      [authenticatedUser, repository, organization] = await Promise.all([
        githubRequest<GitHubUser>('/user'),
        githubRequest<GitHubRepo>(`/repos/${repoFullName}`),
        githubRequest<GitHubOrg>(`/orgs/${orgLogin}`),
      ]);
    } catch (issue) {
      error = issue instanceof Error ? issue.message : 'GitHub diagnostics failed';
    }
  }

  return {
    configured,
    repositoryFullName: repoFullName,
    organizationLogin: orgLogin,
    authenticatedUser,
    repository,
    organization,
    checks: {
      tokenValid: Boolean(authenticatedUser),
      repositoryAccessible: Boolean(repository),
      organizationAccessible: Boolean(organization),
      issueCreationPermissionsAvailable: canCreateIssues(repository),
    },
    error,
  };
}

export async function getGitHubStatus() {
  const diagnostics = await getGitHubDiagnostics();
  let connection = (await supabaseRequest<GitHubConnection[]>('github_connections?provider=eq.github&select=id,provider,github_username,installation_id,status,created_at,updated_at&order=updated_at.desc&limit=1'))?.[0] ?? null;

  if (diagnostics.authenticatedUser) {
    const payload = { provider: 'github', github_username: diagnostics.authenticatedUser.login, installation_id: null, access_token_encrypted: encryptToken(githubToken() ?? ''), status: 'connected', updated_at: new Date().toISOString() };
    connection = (await supabaseRequest<GitHubConnection[]>('github_connections?on_conflict=provider,github_username', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload) }))?.[0] ?? connection;
  }

  return { configured: diagnostics.configured, connected: diagnostics.checks.tokenValid, connection, diagnostics };
}

export async function getGitHubRepository() {
  const status = await getGitHubStatus();
  if (!status.configured) return { configured: false, repository: null, diagnostics: status.diagnostics };
  if (!status.diagnostics.repository) throw new Error(status.diagnostics.error ?? 'GitHub repository unavailable');
  const repo = status.diagnostics.repository;
  let stored: GitHubRepository | null = null;
  if (status.connection?.id) {
    const payload = { connection_id: status.connection.id, repo_full_name: repo.full_name, repo_url: repo.html_url, default_branch: repo.default_branch, status: 'connected', updated_at: new Date().toISOString() };
    stored = (await supabaseRequest<GitHubRepository[]>('github_repositories?on_conflict=connection_id,repo_full_name', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload) }))?.[0] ?? null;
  }
  return { configured: true, repository: stored ?? { id: '', connection_id: status.connection?.id ?? '', repo_full_name: repo.full_name, repo_url: repo.html_url, default_branch: repo.default_branch, status: 'connected', created_at: '', updated_at: '' }, diagnostics: status.diagnostics };
}

export async function listLatestGitHubIssues(limit = 5) {
  return (await supabaseRequest<GitHubIssue[]>(`github_issues?select=id,repository_id,github_issue_number,github_issue_url,title,body,status,source_type,source_id,weakness_summary,recommendation,impact,proposal_source,generated_timestamp,github_api_response,created_at,updated_at&order=created_at.desc&limit=${limit}`)) ?? [];
}

export async function createGitHubIssue(input: GitHubIssueInput) {
  if (!input.title?.trim() || !input.weakness_summary?.trim() || !input.recommendation?.trim() || !input.impact?.trim() || !input.proposal_source?.trim() || input.source_type !== 'improvement_proposal' || !input.source_id?.trim()) throw new Error('Invalid GitHub issue payload');
  const repoState = await getGitHubRepository();
  if (!repoState.repository) throw new Error('GitHub repository is not configured');
  if (!repoState.diagnostics.checks.issueCreationPermissionsAvailable) throw new GitHubRequestError(403, 'GitHub token does not have issue write access to the Xeetrix organization repository.');
  const generatedTimestamp = input.generated_timestamp || new Date().toISOString();
  const title = formatIssueTitle(input.title);
  const body = buildIssueBody({ ...input, generated_timestamp: generatedTimestamp });
  try {
    const issue = await githubRequest<GitHubCreatedIssue>(`/repos/${repoState.repository.repo_full_name}/issues`, { method: 'POST', body: JSON.stringify({ title, body }) });
    const payload = { repository_id: repoState.repository.id || null, github_issue_number: issue.number, github_issue_url: issue.html_url, title: issue.title, body: issue.body ?? body, status: issue.state, source_type: input.source_type, source_id: input.source_id, weakness_summary: input.weakness_summary, recommendation: input.recommendation, impact: input.impact, proposal_source: input.proposal_source, evidence: input.evidence ?? [], metrics: input.metrics ?? [], reasoning: input.reasoning ?? [], acceptance_criteria: input.acceptance_criteria ?? [], suggested_implementation: input.suggested_implementation ?? input.recommendation, generated_timestamp: generatedTimestamp, github_api_response: issue as unknown as Record<string, unknown>, updated_at: new Date().toISOString() };
    const stored = (await supabaseRequest<GitHubIssue[]>('github_issues', { method: 'POST', body: JSON.stringify(payload) }))?.[0] ?? { ...payload, id: '', created_at: issue.created_at } as GitHubIssue;
    await supabaseRequest(`agent_improvement_proposals?proposal_key=eq.${encodeURIComponent(input.source_id)}`, { method: 'PATCH', body: JSON.stringify({ execution_status: 'Issue Created', github_issue_number: issue.number, github_issue_url: issue.html_url, updated_at: new Date().toISOString() }) }).catch(() => null);
    await supabaseRequest('agent_execution_events', { method: 'POST', body: JSON.stringify({ proposal_key: input.source_id, status: 'Issue Created', github_issue_number: issue.number, github_issue_url: issue.html_url, notes: 'GitHub issue created after human approval.' }) }).catch(() => null);
    await supabaseRequest('agent_codex_prompt_history', { method: 'POST', body: JSON.stringify({ proposal_key: input.source_id, github_issue_number: issue.number, prompt: input.proposal_source, metadata: { evidence: input.evidence ?? [], metrics: input.metrics ?? [], reasoning: input.reasoning ?? [] } }) }).catch(() => null);
    return { issue: stored, url: issue.html_url };
  } catch (error) {
    if (error instanceof GitHubRequestError && error.status === 403) throw new GitHubRequestError(403, 'GitHub token does not have issue write access to the Xeetrix organization repository.');
    throw error;
  }
}


export async function listRepositoryIssues(state: 'open' | 'closed' = 'open', limit = 20) {
  if (!githubToken()) return [];
  const repoFullName = configuredRepoFullName();
  return githubRequest<GitHubRepositoryIssue[]>(`/repos/${repoFullName}/issues?state=${state}&per_page=${limit}`);
}

export async function listRepositoryCommits(limit = 20) {
  if (!githubToken()) return [];
  const repoFullName = configuredRepoFullName();
  const commits = await githubRequest<Array<{ sha: string; html_url: string; commit: { message: string; author?: { name?: string; date?: string } } }>>(`/repos/${repoFullName}/commits?per_page=${limit}`);
  return commits.map((item) => ({ sha: item.sha, html_url: item.html_url, message: item.commit.message, author: item.commit.author?.name ?? null, date: item.commit.author?.date ?? null }));
}
