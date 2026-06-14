import crypto from 'crypto';

export type ConnectedSource = {
  id: string;
  provider: string;
  account_email: string;
  display_name: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SourceSyncLog = {
  id: string;
  source_id: string;
  sync_type: string;
  status: string;
  message: string | null;
  endpoint: string | null;
  http_status: number | null;
  error_code: string | null;
  missing_scope: string | null;
  raw_response: unknown;
  created_at: string;
};

export type GoogleServiceConnection = {
  id: string;
  source_id: string;
  service_name: GoogleServiceName;
  status: string;
  scopes: string[] | null;
  last_sync_at: string | null;
  last_error: string | null;
  granted_scopes: string[] | null;
  missing_scopes: string[] | null;
  diagnostic: GoogleSyncDiagnostic | null;
  created_at: string;
  updated_at: string;
};

export type GoogleServiceName = 'gmail' | 'calendar' | 'docs' | 'sheets';
export type GoogleSyncDiagnostic = { endpoint: string; httpStatus: number; errorCode: string | null; errorMessage: string; missingScope: string | null; rawResponse: unknown };
export type GoogleWorkspaceItem = { id: string; title: string; detail: string; timestamp: string | null; status?: string | null };
export type GmailSignal = {
  id: string;
  source_id: string;
  google_message_id: string;
  from_email: string | null;
  from_name: string | null;
  subject: string | null;
  snippet: string | null;
  received_at: string | null;
  project_id: string | null;
  contact_name: string | null;
  organization: string | null;
  intent: string | null;
  priority: string | null;
  needs_follow_up: boolean;
  is_unread: boolean;
  status: string;
  metadata: Record<string, unknown>;
};
export type DriveSignal = {
  id: string;
  source_id: string;
  google_file_id: string;
  name: string | null;
  web_url: string | null;
  project_id: string | null;
  organization: string | null;
  document_type: string | null;
  owner_email: string | null;
  owner_name: string | null;
  updated_at: string;
  status: string;
  metadata: Record<string, unknown>;
  workspace_type: 'doc' | 'sheet';
};
export type ContactCandidate = { id: string; name: string; email: string | null; organization: string | null; source: string; project: string | null; last_seen_at: string | null };
export type KnowledgeEntity = { id: string; type: 'person' | 'organization' | 'project' | 'document' | 'email' | 'lead' | 'follow_up'; name: string; project: string | null; source: string; confidence: 'high' | 'medium' | 'needs_review' };
export type KnowledgeSignal = { id: string; kind: 'email' | 'document' | 'calendar' | 'follow_up' | 'project' | 'security' | 'review'; title: string; detail: string; project: string; source: string; href: string; priority: 'high' | 'medium' | 'normal'; needsReview?: boolean };
export type GoogleKnowledgeGraph = { entities: KnowledgeEntity[]; signals: KnowledgeSignal[]; needsReview: KnowledgeSignal[]; projectLinks: Record<string, KnowledgeSignal[]> };
export type GoogleIntelligence = { gmailSignals: GmailSignal[]; driveSignals: DriveSignal[]; contactCandidates: ContactCandidate[]; knowledgeGraph: GoogleKnowledgeGraph };
export type ConnectedGoogleAccount = ConnectedSource & {
  last_sync: string | null;
  services: GoogleServiceConnection[];
  sync_logs: SourceSyncLog[];
  previews: { gmail: GoogleWorkspaceItem[]; calendar: GoogleWorkspaceItem[]; drive: GoogleWorkspaceItem[] };
};

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];
const SERVICE_SCOPES: Record<GoogleServiceName, string[]> = {
  gmail: ['https://www.googleapis.com/auth/gmail.readonly'],
  calendar: ['https://www.googleapis.com/auth/calendar.readonly'],
  docs: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
  sheets: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

const PRODUCTION_SITE_URL = 'https://xeetrix.com';
const googleJsonHeaders = { Accept: 'application/json' };

function normalizeBaseUrl(url: string) { return url.replace(/\/$/, ''); }
function getBaseUrl() {
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') return PRODUCTION_SITE_URL;
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configuredUrl) return normalizeBaseUrl(configuredUrl);
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
export function getGoogleRedirectUri() { return `${getBaseUrl()}/api/integrations/google/callback`; }
export function getGoogleReadOnlyScopes() { return [...GOOGLE_SCOPES]; }

export function createGoogleAuthorizationUrl() {
  const clientId = requiredEnv('GOOGLE_CLIENT_ID');
  const state = crypto.randomBytes(24).toString('hex');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent',
    state,
  });
  return { authUrl: `${GOOGLE_AUTH_URL}?${params.toString()}`, state };
}


function normalizeScopes(scopeText?: string | null) {
  return (scopeText ?? '').split(/\s+/).map((scope) => scope.trim()).filter(Boolean);
}

function missingScopesFor(serviceName: GoogleServiceName, grantedScopes: string[]) {
  const granted = new Set(grantedScopes);
  return SERVICE_SCOPES[serviceName].filter((scope) => !granted.has(scope));
}

async function getGrantedScopes(accessToken: string) {
  const endpoint = 'https://oauth2.googleapis.com/tokeninfo';
  const response = await fetch(`${endpoint}?access_token=${encodeURIComponent(accessToken)}`, { headers: googleJsonHeaders });
  const body = await readGoogleResponseBody(response);
  if (!response.ok) throw googleApiError('Google tokeninfo failed', endpoint, response.status, body);
  return normalizeScopes(typeof body === 'object' && body && 'scope' in body ? String((body as { scope?: unknown }).scope ?? '') : '');
}

async function readGoogleResponseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text) as unknown; } catch { return text; }
}

function googleErrorDetails(body: unknown) {
  if (body && typeof body === 'object') {
    const root = body as { error?: unknown; error_description?: unknown };
    const nested = root.error && typeof root.error === 'object' ? root.error as { code?: unknown; message?: unknown; status?: unknown; errors?: { reason?: unknown; message?: unknown }[] } : null;
    const first = nested?.errors?.[0];
    const code = String((nested?.status ?? first?.reason ?? (typeof root.error === 'string' ? root.error : '')) || '');
    const message = String((nested?.message ?? first?.message ?? root.error_description ?? (typeof root.error === 'string' ? root.error : '')) || 'Google API request failed');
    return { code: code || null, message };
  }
  return { code: null, message: typeof body === 'string' ? body : 'Google API request failed' };
}

function inferMissingScope(serviceName: GoogleServiceName, status: number, body: unknown, grantedScopes: string[]) {
  const missing = missingScopesFor(serviceName, grantedScopes);
  const text = JSON.stringify(body ?? '').toLowerCase();
  if (missing.length && (status === 401 || status === 403 || text.includes('scope') || text.includes('insufficient'))) return missing[0];
  return null;
}

function isApiDisabled(body: unknown) {
  const text = JSON.stringify(body ?? '').toLowerCase();
  return text.includes('api has not been used') || text.includes('disabled') || text.includes('accessnotconfigured');
}

function googleApiError(prefix: string, endpoint: string, status: number, body: unknown, missingScope: string | null = null) {
  const details = googleErrorDetails(body);
  const apiDisabled = isApiDisabled(body);
  const error = new Error(`${prefix}: ${status} ${details.code ?? 'google_error'} - ${details.message}${missingScope ? ` (missing scope: ${missingScope})` : ''}${apiDisabled ? ' (API may not be enabled)' : ''}`) as Error & { diagnostic: GoogleSyncDiagnostic & { apiDisabled?: boolean } };
  error.diagnostic = { endpoint, httpStatus: status, errorCode: details.code, errorMessage: details.message, missingScope, rawResponse: body, apiDisabled };
  return error;
}

async function fetchGoogleJson<T>(endpoint: string, accessToken: string, serviceName: GoogleServiceName, prefix: string, grantedScopes: string[]): Promise<T> {
  const response = await fetch(endpoint, { headers: { ...googleJsonHeaders, Authorization: `Bearer ${accessToken}` } });
  const body = await readGoogleResponseBody(response);
  if (!response.ok) throw googleApiError(prefix, endpoint, response.status, body, inferMissingScope(serviceName, response.status, body, grantedScopes));
  return body as T;
}

export function diagnosticFromError(error: unknown) {
  return error instanceof Error && 'diagnostic' in error ? (error as Error & { diagnostic?: GoogleSyncDiagnostic }).diagnostic ?? null : null;
}

function getEncryptionKey() { return crypto.createHash('sha256').update(requiredEnv('TOKEN_ENCRYPTION_KEY')).digest(); }
export function encryptToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
}
function decryptToken(token: string) {
  const [ivText, tagText, encryptedText] = token.split('.');
  if (!ivText || !tagText || !encryptedText) throw new Error('Stored Google token is invalid');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivText, 'base64'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64')), decipher.final()]).toString('utf8');
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
  const config = supabaseConfig();
  if (!config) throw new Error('Supabase service environment variables are not configured');
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

type StoredConnectedSource = ConnectedSource & { refresh_token_encrypted: string; access_token_encrypted: string | null };
async function findSource(sourceId: string) {
  const [source] = await supabaseRequest<StoredConnectedSource[]>(`connected_sources?id=eq.${encodeURIComponent(sourceId)}&provider=eq.google&select=id,provider,account_email,display_name,status,access_token_encrypted,refresh_token_encrypted,expires_at,created_at,updated_at&limit=1`);
  if (!source) throw new Error('Google account not found');
  return source;
}

async function ensureServiceConnection(sourceId: string, serviceName: GoogleServiceName, status: string, patch: Partial<GoogleServiceConnection> = {}) {
  const payload = { source_id: sourceId, service_name: serviceName, status, scopes: SERVICE_SCOPES[serviceName], updated_at: new Date().toISOString(), ...patch };
  const [row] = await supabaseRequest<GoogleServiceConnection[]>('google_service_connections?on_conflict=source_id,service_name', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload),
  });
  return row;
}

async function getAccessToken(source: StoredConnectedSource) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: requiredEnv('GOOGLE_CLIENT_ID'), client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'), refresh_token: decryptToken(source.refresh_token_encrypted), grant_type: 'refresh_token' }),
  });
  const body = await readGoogleResponseBody(response);
  if (!response.ok) {
    const err = googleApiError('Google refresh failed', GOOGLE_TOKEN_URL, response.status, body);
    if (err.diagnostic.errorCode === 'invalid_grant') {
      err.diagnostic.errorMessage = `${err.diagnostic.errorMessage} (refresh token expired or revoked)`;
      err.message = `${err.message} (refresh token expired or revoked)`;
    }
    throw err;
  }
  const tokens = body as GoogleTokenResponse;
  return tokens.access_token;
}

export async function listGoogleAccounts(): Promise<ConnectedGoogleAccount[]> {
  if (!supabaseConfig()) return [];
  const accounts = await supabaseRequest<ConnectedSource[]>('connected_sources?provider=eq.google&select=id,provider,account_email,display_name,status,expires_at,created_at,updated_at&order=created_at.desc');
  if (!accounts.length) return [];
  const ids = accounts.map((account) => account.id);
  const logs = await supabaseRequest<SourceSyncLog[]>(`source_sync_logs?source_id=in.(${ids.join(',')})&select=id,source_id,sync_type,status,message,endpoint,http_status,error_code,missing_scope,raw_response,created_at&order=created_at.desc`);
  const services = await supabaseRequest<GoogleServiceConnection[]>(`google_service_connections?source_id=in.(${ids.join(',')})&select=id,source_id,service_name,status,scopes,last_sync_at,last_error,granted_scopes,missing_scopes,diagnostic,created_at,updated_at`);
  const gmail = await supabaseRequest<GoogleWorkspaceItem[]>(`gmail_messages?source_id=in.(${ids.join(',')})&select=id:source_id,title:subject,detail:snippet,timestamp:received_at,status&order=received_at.desc&limit=12`);
  const calendar = await supabaseRequest<GoogleWorkspaceItem[]>(`calendar_events?source_id=in.(${ids.join(',')})&select=id:source_id,title,detail:description,timestamp:start_at,status&order=start_at.asc&limit=12`);
  const docs = await supabaseRequest<GoogleWorkspaceItem[]>(`google_documents?source_id=in.(${ids.join(',')})&select=id:source_id,title:name,detail:mime_type,timestamp:updated_at,status&order=updated_at.desc&limit=12`);
  const sheets = await supabaseRequest<GoogleWorkspaceItem[]>(`google_sheets?source_id=in.(${ids.join(',')})&select=id:source_id,title:name,detail:web_url,timestamp:updated_at,status&order=updated_at.desc&limit=12`);
  return accounts.map((account) => ({
    ...account,
    last_sync: logs.find((log) => log.source_id === account.id)?.created_at ?? null,
    services: services.filter((service) => service.source_id === account.id),
    sync_logs: logs.filter((log) => log.source_id === account.id).slice(0, 6),
    previews: {
      gmail: gmail.filter((item) => item.id === account.id).slice(0, 3),
      calendar: calendar.filter((item) => item.id === account.id).slice(0, 3),
      drive: [...docs.filter((item) => item.id === account.id), ...sheets.filter((item) => item.id === account.id)].slice(0, 3),
    },
  }));
}

export async function deleteGoogleAccount(id: string) { await supabaseRequest<null>(`connected_sources?id=eq.${encodeURIComponent(id)}&provider=eq.google`, { method: 'DELETE' }); }

type GoogleTokenResponse = { access_token: string; refresh_token?: string; expires_in?: number };
type GoogleProfile = { email: string; name?: string };

export async function registerGoogleAccount(code: string) {
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: requiredEnv('GOOGLE_CLIENT_ID'), client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'), redirect_uri: getGoogleRedirectUri(), grant_type: 'authorization_code' }) });
  if (!tokenResponse.ok) throw new Error(`Google token exchange failed: ${tokenResponse.status}`);
  const tokens = await tokenResponse.json() as GoogleTokenResponse;
  if (!tokens.refresh_token) throw new Error('Google did not return a refresh token. Reconnect with consent to register this account.');
  const profileResponse = await fetch(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (!profileResponse.ok) throw new Error(`Google profile lookup failed: ${profileResponse.status}`);
  const profile = await profileResponse.json() as GoogleProfile;
  if (!profile.email) throw new Error('Google profile did not include an email address');
  const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;
  const [account] = await supabaseRequest<ConnectedSource[]>('connected_sources?on_conflict=provider,account_email', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify({ provider: 'google', account_email: profile.email, display_name: profile.name ?? null, status: 'connected', access_token_encrypted: encryptToken(tokens.access_token), refresh_token_encrypted: encryptToken(tokens.refresh_token), expires_at: expiresAt, updated_at: new Date().toISOString() }) });
  await Promise.all((Object.keys(SERVICE_SCOPES) as GoogleServiceName[]).map((service) => ensureServiceConnection(account.id, service, 'enabled')));
  await supabaseRequest<SourceSyncLog[]>('source_sync_logs', { method: 'POST', body: JSON.stringify({ source_id: account.id, sync_type: 'oauth_connect', status: 'success', message: 'Google read-only Workspace access connected.' }) });
  return account;
}

function parseGmailAddress(value = '') {
  const match = value.match(/^(.*)<(.+)>$/);
  return match ? { name: match[1].trim().replace(/^"|"$/g, '') || null, email: match[2].trim() } : { name: null, email: value.trim() };
}

const PROJECT_RULES = [
  { project: 'KNLTC', organization: 'KNLTC', pattern: /knltc|lead|marketing|campaign|ad spend|budget|client|training|course|cohort/i },
  { project: 'Islamic School', organization: 'Islamic School', pattern: /islamic school|admission|school|student|teacher|guardian|parent|academic|madrasa|class|tuition/i },
  { project: 'Xeetrix', organization: 'Xeetrix', pattern: /xeetrix|agent|shaikh os|product|platform|website|app|software|dashboard/i },
  { project: 'Personal/Investment', organization: 'Personal', pattern: /investment|portfolio|stock|return|dividend|fund|personal|bank|invoice|receipt|payment|paid|due|expense|finance|billing|statement|tax/i },
] as const;

function classifyProject(text: string) {
  return PROJECT_RULES.find((rule) => rule.pattern.test(text)) ?? { project: 'Needs Review', organization: null };
}

function classifyIntent(text: string) {
  if (/security alert|new sign-in|password|2-step|verification|suspicious|login/i.test(text)) return 'security_alert';
  if (/meeting|schedule|calendar|invite|appointment|call/i.test(text)) return 'meeting_request';
  if (/invoice|receipt|payment|paid|due|billing|statement/i.test(text)) return 'finance';
  if (/report|update|status|summary/i.test(text)) return 'report';
  if (/approve|confirm|reply|respond|please|\?|follow up|follow-up/i.test(text)) return 'follow_up';
  return 'information';
}

function classifyEmail(subject: string, snippet: string, labels: string[] = [], fromName: string | null = null, fromEmail: string | null = null) {
  const text = `${subject} ${snippet}`;
  const project = classifyProject(text);
  const intent = classifyIntent(text);
  const isUnread = labels.includes('UNREAD');
  const priority = /(urgent|asap|deadline|important|overdue|immediate)/i.test(text) || labels.includes('IMPORTANT') ? 'high' : isUnread ? 'medium' : 'normal';
  const needs_follow_up = intent === 'follow_up' || intent === 'meeting_request' || /\?|please|reply|confirm|follow up|follow-up|respond/i.test(text);
  return { project_id: project.project, contact_name: fromName, organization: project.organization, intent, priority, needs_follow_up, is_unread: isUnread, metadata: { classification: 'google_knowledge_graph_v1', labels, contact: { name: fromName, email: fromEmail }, needs_review: project.project === 'Needs Review', possible_lead: /lead|proposal|quote|interested|pricing|client/i.test(text) } };
}

function classifyDriveFile(name: string, mimeType: string, owners: { emailAddress?: string; displayName?: string }[] = []) {
  const project = classifyProject(name);
  const document_type = /spreadsheet/i.test(mimeType) ? (/budget|invoice|finance|expense/i.test(name) ? 'financial_sheet' : 'spreadsheet') : /report|proposal|plan|notes|minutes|admission/i.test(name) ? (name.match(/report/i) ? 'report' : 'document') : 'document';
  const owner = owners[0];
  return { project_id: project.project, organization: project.organization, document_type, owner_email: owner?.emailAddress ?? null, owner_name: owner?.displayName ?? null };
}

async function logSync(sourceId: string, syncType: string, status: string, message: string, diagnostic: GoogleSyncDiagnostic | null = null) {
  await supabaseRequest<SourceSyncLog[]>('source_sync_logs', { method: 'POST', body: JSON.stringify({ source_id: sourceId, sync_type: syncType, status, message, endpoint: diagnostic?.endpoint ?? null, http_status: diagnostic?.httpStatus ?? null, error_code: diagnostic?.errorCode ?? null, missing_scope: diagnostic?.missingScope ?? null, raw_response: diagnostic?.rawResponse ?? null }) });
}

export async function syncGmail(sourceId: string) {
  const source = await findSource(sourceId);
  try {
    const accessToken = await getAccessToken(source);
    const grantedScopes = await getGrantedScopes(accessToken);
    const missingScopes = missingScopesFor('gmail', grantedScopes);
    await ensureServiceConnection(sourceId, 'gmail', missingScopes.length ? 'missing_scope' : 'enabled', { granted_scopes: grantedScopes, missing_scopes: missingScopes });
    const list = await fetchGoogleJson<{ messages?: { id: string; threadId: string }[] }>('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=newer_than:30d', accessToken, 'gmail', 'Gmail list failed', grantedScopes);
    const rows = [];
    for (const message of list.messages ?? []) {
      const item = await fetchGoogleJson<{ id: string; threadId: string; snippet?: string; internalDate?: string; labelIds?: string[]; payload?: { headers?: { name: string; value: string }[] } }>(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`, accessToken, 'gmail', 'Gmail message lookup failed', grantedScopes);
      const headers = Object.fromEntries((item.payload?.headers ?? []).map((header) => [header.name.toLowerCase(), header.value]));
      const from = parseGmailAddress(headers.from);
      const classified = classifyEmail(headers.subject ?? '', item.snippet ?? '', item.labelIds ?? [], from.name, from.email);
      rows.push({ source_id: sourceId, google_message_id: item.id, thread_id: item.threadId, from_email: from.email, from_name: from.name, to_emails: headers.to ? headers.to.split(',').map((email) => email.trim()) : [], subject: headers.subject ?? '(No subject)', snippet: item.snippet ?? '', received_at: item.internalDate ? new Date(Number(item.internalDate)).toISOString() : null, ...classified, status: 'imported', updated_at: new Date().toISOString() });
    }
    if (rows.length) await supabaseRequest('gmail_messages?on_conflict=source_id,google_message_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(rows) });
    await ensureServiceConnection(sourceId, 'gmail', 'enabled', { last_sync_at: new Date().toISOString(), last_error: null });
    await logSync(sourceId, 'gmail', 'success', `${rows.length} Gmail messages imported.`);
    return { imported: rows.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gmail sync failed';
    const diagnostic = diagnosticFromError(error);
    await ensureServiceConnection(sourceId, 'gmail', diagnostic?.missingScope ? 'missing_scope' : 'error', { last_error: message, diagnostic, missing_scopes: diagnostic?.missingScope ? [diagnostic.missingScope] : undefined });
    await logSync(sourceId, 'gmail', 'error', message, diagnostic);
    throw error;
  }
}

export async function syncCalendar(sourceId: string) {
  const source = await findSource(sourceId);
  try {
    const accessToken = await getAccessToken(source);
    const grantedScopes = await getGrantedScopes(accessToken);
    const missingScopes = missingScopesFor('calendar', grantedScopes);
    await ensureServiceConnection(sourceId, 'calendar', missingScopes.length ? 'missing_scope' : 'enabled', { granted_scopes: grantedScopes, missing_scopes: missingScopes });
    const params = new URLSearchParams({ timeMin: new Date().toISOString(), timeMax: new Date(Date.now() + 14 * 86400000).toISOString(), singleEvents: 'true', orderBy: 'startTime', maxResults: '50' });
    const data = await fetchGoogleJson<{ items?: { id: string; summary?: string; description?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string }; attendees?: unknown[]; status?: string }[] }>(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, accessToken, 'calendar', 'Calendar sync failed', grantedScopes);
    const rows = (data.items ?? []).map((event) => ({ source_id: sourceId, google_event_id: event.id, title: event.summary ?? '(Untitled event)', description: event.description ?? null, start_at: event.start?.dateTime ?? event.start?.date ?? null, end_at: event.end?.dateTime ?? event.end?.date ?? null, attendees: event.attendees ?? [], project_id: classifyProject(`${event.summary ?? ''} ${event.description ?? ''}`).project, status: event.status ?? 'confirmed', metadata: { classification: 'google_knowledge_graph_v1', needs_review: classifyProject(`${event.summary ?? ''} ${event.description ?? ''}`).project === 'Needs Review' }, updated_at: new Date().toISOString() }));
    if (rows.length) await supabaseRequest('calendar_events?on_conflict=source_id,google_event_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(rows) });
    await ensureServiceConnection(sourceId, 'calendar', 'enabled', { last_sync_at: new Date().toISOString(), last_error: null });
    await logSync(sourceId, 'calendar', 'success', `${rows.length} calendar events imported.`);
    return { imported: rows.length };
  } catch (error) { const message = error instanceof Error ? error.message : 'Calendar sync failed'; const diagnostic = diagnosticFromError(error); await ensureServiceConnection(sourceId, 'calendar', diagnostic?.missingScope ? 'missing_scope' : 'error', { last_error: message, diagnostic, missing_scopes: diagnostic?.missingScope ? [diagnostic.missingScope] : undefined }); await logSync(sourceId, 'calendar', 'error', message, diagnostic); throw error; }
}

export async function syncDrive(sourceId: string) {
  const source = await findSource(sourceId);
  try {
    const accessToken = await getAccessToken(source);
    const grantedScopes = await getGrantedScopes(accessToken);
    const missingScopes = [...new Set([...missingScopesFor('docs', grantedScopes), ...missingScopesFor('sheets', grantedScopes)])];
    const q = "mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet'";
    const params = new URLSearchParams({ pageSize: '20', orderBy: 'modifiedTime desc', fields: 'files(id,name,mimeType,webViewLink,modifiedTime,owners(displayName,emailAddress))', q });
    const data = await fetchGoogleJson<{ files?: { id: string; name: string; mimeType: string; webViewLink?: string; modifiedTime?: string; owners?: { displayName?: string; emailAddress?: string }[] }[] }>(`https://www.googleapis.com/drive/v3/files?${params}`, accessToken, 'docs', 'Drive sync failed', grantedScopes);
    const docs = (data.files ?? []).filter((file) => file.mimeType === 'application/vnd.google-apps.document').map((file) => ({ source_id: sourceId, google_file_id: file.id, name: file.name, mime_type: file.mimeType, web_url: file.webViewLink ?? null, ...classifyDriveFile(file.name, file.mimeType, file.owners ?? []), summary: null, status: 'imported', metadata: { classification: 'google_knowledge_graph_v1', modified_time: file.modifiedTime, owners: file.owners ?? [] }, updated_at: new Date().toISOString() }));
    const sheets = (data.files ?? []).filter((file) => file.mimeType === 'application/vnd.google-apps.spreadsheet').map((file) => ({ source_id: sourceId, google_file_id: file.id, name: file.name, web_url: file.webViewLink ?? null, ...classifyDriveFile(file.name, file.mimeType, file.owners ?? []), summary: null, status: 'imported', metadata: { classification: 'google_knowledge_graph_v1', modified_time: file.modifiedTime, mime_type: file.mimeType, owners: file.owners ?? [] }, updated_at: new Date().toISOString() }));
    if (docs.length) await supabaseRequest('google_documents?on_conflict=source_id,google_file_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(docs) });
    if (sheets.length) await supabaseRequest('google_sheets?on_conflict=source_id,google_file_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(sheets) });
    const now = new Date().toISOString(); await Promise.all([ensureServiceConnection(sourceId, 'docs', missingScopes.length ? 'missing_scope' : 'enabled', { last_sync_at: now, last_error: null, granted_scopes: grantedScopes, missing_scopes: missingScopes }), ensureServiceConnection(sourceId, 'sheets', missingScopes.length ? 'missing_scope' : 'enabled', { last_sync_at: now, last_error: null, granted_scopes: grantedScopes, missing_scopes: missingScopes })]);
    await logSync(sourceId, 'drive', 'success', `${docs.length + sheets.length} Drive files imported.`);
    return { imported: docs.length + sheets.length };
  } catch (error) { const message = error instanceof Error ? error.message : 'Drive sync failed'; const diagnostic = diagnosticFromError(error); await Promise.all([ensureServiceConnection(sourceId, 'docs', diagnostic?.missingScope ? 'missing_scope' : 'error', { last_error: message, diagnostic, missing_scopes: diagnostic?.missingScope ? [diagnostic.missingScope] : undefined }), ensureServiceConnection(sourceId, 'sheets', diagnostic?.missingScope ? 'missing_scope' : 'error', { last_error: message, diagnostic, missing_scopes: diagnostic?.missingScope ? [diagnostic.missingScope] : undefined })]); await logSync(sourceId, 'drive', 'error', message, diagnostic); throw error; }
}


export async function listGoogleIntelligence() {
  if (!supabaseConfig()) return emptyGoogleIntelligence();
  const accounts = await supabaseRequest<ConnectedSource[]>('connected_sources?provider=eq.google&select=id,provider,account_email,display_name,status,expires_at,created_at,updated_at&order=created_at.desc');
  if (!accounts.length) return emptyGoogleIntelligence();
  const ids = accounts.map((account) => account.id).join(',');
  const [gmailSignals, documents, sheets, events] = await Promise.all([
    supabaseRequest<GmailSignal[]>(`gmail_messages?source_id=in.(${ids})&select=id,source_id,google_message_id,from_email,from_name,subject,snippet,received_at,project_id,contact_name,organization,intent,priority,needs_follow_up,is_unread,status,metadata&order=received_at.desc&limit=30`),
    supabaseRequest<Omit<DriveSignal, 'workspace_type'>[]>(`google_documents?source_id=in.(${ids})&select=id,source_id,google_file_id,name,web_url,project_id,organization,document_type,owner_email,owner_name,updated_at,status,metadata&order=updated_at.desc&limit=20`),
    supabaseRequest<Omit<DriveSignal, 'workspace_type'>[]>(`google_sheets?source_id=in.(${ids})&select=id,source_id,google_file_id,name,web_url,project_id,organization,document_type,owner_email,owner_name,updated_at,status,metadata&order=updated_at.desc&limit=20`),
    supabaseRequest<{ id: string; title: string | null; start_at: string | null; project_id: string | null; attendees: unknown }[]>(`calendar_events?source_id=in.(${ids})&select=id,title,start_at,project_id,attendees&order=start_at.asc&limit=20`),
  ]);
  const driveSignals: DriveSignal[] = [
    ...documents.map((item) => ({ ...item, workspace_type: 'doc' as const })),
    ...sheets.map((item) => ({ ...item, workspace_type: 'sheet' as const })),
  ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const contacts = new Map<string, ContactCandidate>();
  for (const message of gmailSignals) {
    const key = message.from_email || message.from_name;
    if (!key) continue;
    contacts.set(`gmail-${key}`, { id: `gmail-${message.id}`, name: message.from_name || message.from_email || 'Unknown sender', email: message.from_email, organization: message.organization, source: 'Gmail sender', project: message.project_id, last_seen_at: message.received_at });
  }
  for (const doc of driveSignals) {
    const key = doc.owner_email || doc.owner_name;
    if (!key) continue;
    contacts.set(`drive-${key}`, { id: `drive-${doc.id}`, name: doc.owner_name || doc.owner_email || 'Unknown owner', email: doc.owner_email, organization: doc.organization, source: `${doc.workspace_type === 'doc' ? 'Document' : 'Sheet'} owner`, project: doc.project_id, last_seen_at: doc.updated_at });
  }
  for (const event of events) {
    const attendees = Array.isArray(event.attendees) ? event.attendees as { email?: string; displayName?: string; responseStatus?: string }[] : [];
    for (const attendee of attendees) {
      const key = attendee.email || attendee.displayName;
      if (!key) continue;
      contacts.set(`calendar-${key}`, { id: `calendar-${event.id}-${key}`, name: attendee.displayName || attendee.email || 'Unknown attendee', email: attendee.email ?? null, organization: null, source: 'Calendar attendee', project: event.project_id, last_seen_at: event.start_at });
    }
  }
  const contactCandidates = [...contacts.values()].sort((a, b) => new Date(b.last_seen_at ?? 0).getTime() - new Date(a.last_seen_at ?? 0).getTime());
  return { gmailSignals, driveSignals, contactCandidates, knowledgeGraph: buildKnowledgeGraph(gmailSignals, driveSignals, contactCandidates, events) };
}

function emptyGoogleIntelligence(): GoogleIntelligence {
  return { gmailSignals: [], driveSignals: [], contactCandidates: [], knowledgeGraph: { entities: [], signals: [], needsReview: [], projectLinks: {} } };
}

function signalProject(project: string | null) { return project && project !== 'General' ? project : 'Needs Review'; }

function buildKnowledgeGraph(gmail: GmailSignal[], drive: DriveSignal[], contacts: ContactCandidate[], events: { id: string; title: string | null; start_at: string | null; project_id: string | null; attendees: unknown }[]): GoogleKnowledgeGraph {
  const entities = new Map<string, KnowledgeEntity>();
  const signals: KnowledgeSignal[] = [];
  for (const contact of contacts) {
    entities.set(`person-${contact.id}`, { id: `person-${contact.id}`, type: 'person', name: contact.name, project: signalProject(contact.project), source: contact.source, confidence: contact.project === 'Needs Review' || !contact.project ? 'needs_review' : 'medium' });
    if (contact.organization) entities.set(`org-${contact.organization}`, { id: `org-${contact.organization}`, type: 'organization', name: contact.organization, project: signalProject(contact.project), source: contact.source, confidence: 'medium' });
  }
  for (const rule of PROJECT_RULES) entities.set(`project-${rule.project}`, { id: `project-${rule.project}`, type: 'project', name: rule.project, project: rule.project, source: 'Project linking rules', confidence: 'high' });
  for (const message of gmail) {
    const project = signalProject(message.project_id);
    const needsReview = project === 'Needs Review';
    entities.set(`email-${message.id}`, { id: `email-${message.id}`, type: 'email', name: message.subject || 'Untitled email', project, source: 'Gmail', confidence: needsReview ? 'needs_review' : 'medium' });
    if (message.needs_follow_up) entities.set(`follow-${message.id}`, { id: `follow-${message.id}`, type: 'follow_up', name: message.subject || 'Email follow-up', project, source: 'Gmail', confidence: needsReview ? 'needs_review' : 'medium' });
    if (message.metadata?.possible_lead) entities.set(`lead-${message.id}`, { id: `lead-${message.id}`, type: 'lead', name: message.subject || 'Possible lead', project, source: 'Gmail', confidence: needsReview ? 'needs_review' : 'medium' });
    signals.push({ id: `gmail-${message.id}`, kind: message.intent === 'security_alert' ? 'security' : message.needs_follow_up ? 'follow_up' : 'email', title: message.intent === 'security_alert' ? 'Security alert পাওয়া গেছে' : message.needs_follow_up ? '১টি email follow-up দরকার হতে পারে' : `Important email signal: ${message.subject || 'Untitled email'}`, detail: `${message.contact_name || message.from_email || 'Unknown sender'} · ${message.subject || 'No subject'}`, project, source: 'Gmail', href: '/os/sources', priority: message.priority === 'high' ? 'high' : message.needs_follow_up || message.is_unread ? 'medium' : 'normal', needsReview });
  }
  for (const doc of drive) {
    const project = signalProject(doc.project_id);
    const needsReview = project === 'Needs Review';
    entities.set(`document-${doc.id}`, { id: `document-${doc.id}`, type: 'document', name: doc.name || 'Untitled document', project, source: doc.workspace_type === 'sheet' ? 'Google Sheets' : 'Google Docs', confidence: needsReview ? 'needs_review' : 'medium' });
    signals.push({ id: `drive-${doc.workspace_type}-${doc.id}`, kind: 'document', title: `${project} সম্পর্কিত নতুন document পাওয়া গেছে`, detail: `${doc.name || 'Untitled'} · ${doc.document_type || 'document'}`, project, source: doc.workspace_type === 'sheet' ? 'Google Sheets' : 'Google Docs', href: doc.web_url || '/os/sources', priority: needsReview ? 'normal' : 'medium', needsReview });
  }
  for (const event of events) {
    const project = signalProject(event.project_id);
    const needsReview = project === 'Needs Review';
    signals.push({ id: `calendar-${event.id}`, kind: 'calendar', title: `${project} calendar signal`, detail: `${event.title || 'Untitled event'}${event.start_at ? ` · ${event.start_at}` : ''}`, project, source: 'Google Calendar', href: '/os/sources', priority: 'normal', needsReview });
  }
  const deduped = signals.sort((a, b) => Number(a.needsReview) - Number(b.needsReview));
  return { entities: [...entities.values()], signals: deduped, needsReview: deduped.filter((signal) => signal.needsReview), projectLinks: deduped.reduce<Record<string, KnowledgeSignal[]>>((acc, signal) => { (acc[signal.project] ??= []).push(signal); return acc; }, {}) };
}

