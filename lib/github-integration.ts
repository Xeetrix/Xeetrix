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
  repository_id: string;
  github_issue_number: number;
  github_issue_url?: string;
  title: string;
  body: string;
  status: string;
  source_type: string;
  source_id: string;
  created_at: string;
  updated_at: string;
};

type GitHubUser = { login: string };
type GitHubRepo = { full_name: string; html_url: string; default_branch: string };
type GitHubCreatedIssue = { number: number; html_url: string; state: string; title: string; body: string | null };

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
  if (!response.ok) throw new Error(`GitHub request failed: ${response.status} ${data?.message ?? text}`);
  return data as T;
}

export async function getGitHubStatus() {
  const configured = Boolean(githubToken());
  let connection = (await supabaseRequest<GitHubConnection[]>('github_connections?provider=eq.github&select=id,provider,github_username,installation_id,status,created_at,updated_at&order=updated_at.desc&limit=1'))?.[0] ?? null;

  if (configured) {
    const user = await githubRequest<GitHubUser>('/user').catch(() => null);
    if (user) {
      const payload = { provider: 'github', github_username: user.login, installation_id: null, access_token_encrypted: encryptToken(githubToken() ?? ''), status: 'connected', updated_at: new Date().toISOString() };
      connection = (await supabaseRequest<GitHubConnection[]>('github_connections?on_conflict=provider,github_username', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload) }))?.[0] ?? connection;
    }
  }

  return { configured, connected: configured && connection?.status === 'connected', connection };
}

export async function getGitHubRepository() {
  const repoFullName = configuredRepoFullName();
  const status = await getGitHubStatus();
  if (!status.configured) return { configured: false, repository: null };
  const repo = await githubRequest<GitHubRepo>(`/repos/${repoFullName}`);
  let stored: GitHubRepository | null = null;
  if (status.connection?.id) {
    const payload = { connection_id: status.connection.id, repo_full_name: repo.full_name, repo_url: repo.html_url, default_branch: repo.default_branch, status: 'connected', updated_at: new Date().toISOString() };
    stored = (await supabaseRequest<GitHubRepository[]>('github_repositories?on_conflict=connection_id,repo_full_name', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload) }))?.[0] ?? null;
  }
  return { configured: true, repository: stored ?? { id: '', connection_id: status.connection?.id ?? '', repo_full_name: repo.full_name, repo_url: repo.html_url, default_branch: repo.default_branch, status: 'connected', created_at: '', updated_at: '' } };
}

export async function listLatestGitHubIssues(limit = 5) {
  return (await supabaseRequest<GitHubIssue[]>(`github_issues?select=id,repository_id,github_issue_number,github_issue_url,title,body,status,source_type,source_id,created_at,updated_at&order=created_at.desc&limit=${limit}`)) ?? [];
}

export async function createGitHubIssue(input: { title: string; body: string; source_type: string; source_id: string }) {
  if (!input.title?.trim() || !input.body?.trim() || input.source_type !== 'improvement_proposal' || !input.source_id?.trim()) throw new Error('Invalid GitHub issue payload');
  const repoState = await getGitHubRepository();
  if (!repoState.repository) throw new Error('GitHub repository is not configured');
  const issue = await githubRequest<GitHubCreatedIssue>(`/repos/${repoState.repository.repo_full_name}/issues`, { method: 'POST', body: JSON.stringify({ title: input.title, body: input.body }) });
  const payload = { repository_id: repoState.repository.id || null, github_issue_number: issue.number, github_issue_url: issue.html_url, title: issue.title, body: issue.body ?? input.body, status: issue.state, source_type: input.source_type, source_id: input.source_id, updated_at: new Date().toISOString() };
  const stored = (await supabaseRequest<GitHubIssue[]>('github_issues', { method: 'POST', body: JSON.stringify(payload) }))?.[0] ?? { ...payload, id: '', created_at: new Date().toISOString() } as GitHubIssue;
  return { issue: stored, url: issue.html_url };
}
