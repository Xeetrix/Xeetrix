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
  created_at: string;
  updated_at: string;
};

export type GoogleServiceName = 'gmail' | 'calendar' | 'docs' | 'sheets';
export type GoogleWorkspaceItem = { id: string; title: string; detail: string; timestamp: string | null; status?: string | null };
export type ConnectedGoogleAccount = ConnectedSource & {
  last_sync: string | null;
  services: GoogleServiceConnection[];
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
  if (!response.ok) throw new Error(`Google refresh failed: ${response.status}`);
  const tokens = await response.json() as GoogleTokenResponse;
  return tokens.access_token;
}

export async function listGoogleAccounts(): Promise<ConnectedGoogleAccount[]> {
  if (!supabaseConfig()) return [];
  const accounts = await supabaseRequest<ConnectedSource[]>('connected_sources?provider=eq.google&select=id,provider,account_email,display_name,status,expires_at,created_at,updated_at&order=created_at.desc');
  if (!accounts.length) return [];
  const ids = accounts.map((account) => account.id);
  const logs = await supabaseRequest<SourceSyncLog[]>(`source_sync_logs?source_id=in.(${ids.join(',')})&select=id,source_id,sync_type,status,message,created_at&order=created_at.desc`);
  const services = await supabaseRequest<GoogleServiceConnection[]>(`google_service_connections?source_id=in.(${ids.join(',')})&select=id,source_id,service_name,status,scopes,last_sync_at,last_error,created_at,updated_at`);
  const gmail = await supabaseRequest<GoogleWorkspaceItem[]>(`gmail_messages?source_id=in.(${ids.join(',')})&select=id:source_id,title:subject,detail:snippet,timestamp:received_at,status&order=received_at.desc&limit=12`);
  const calendar = await supabaseRequest<GoogleWorkspaceItem[]>(`calendar_events?source_id=in.(${ids.join(',')})&select=id:source_id,title,detail:description,timestamp:start_at,status&order=start_at.asc&limit=12`);
  const docs = await supabaseRequest<GoogleWorkspaceItem[]>(`google_documents?source_id=in.(${ids.join(',')})&select=id:source_id,title:name,detail:mime_type,timestamp:updated_at,status&order=updated_at.desc&limit=12`);
  const sheets = await supabaseRequest<GoogleWorkspaceItem[]>(`google_sheets?source_id=in.(${ids.join(',')})&select=id:source_id,title:name,detail:web_url,timestamp:updated_at,status&order=updated_at.desc&limit=12`);
  return accounts.map((account) => ({
    ...account,
    last_sync: logs.find((log) => log.source_id === account.id)?.created_at ?? null,
    services: services.filter((service) => service.source_id === account.id),
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
function classifyEmail(subject: string, snippet: string) {
  const text = `${subject} ${snippet}`.toLowerCase();
  return { intent: text.includes('?') || text.includes('please') ? 'follow_up' : 'information', priority: /(urgent|asap|deadline|important)/.test(text) ? 'high' : 'normal', needs_follow_up: /\?|please|reply|confirm|follow up/.test(text) };
}
async function logSync(sourceId: string, syncType: string, status: string, message: string) {
  await supabaseRequest<SourceSyncLog[]>('source_sync_logs', { method: 'POST', body: JSON.stringify({ source_id: sourceId, sync_type: syncType, status, message }) });
}

export async function syncGmail(sourceId: string) {
  const source = await findSource(sourceId);
  try {
    const accessToken = await getAccessToken(source);
    const listRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=newer_than:30d', { headers: { ...googleJsonHeaders, Authorization: `Bearer ${accessToken}` } });
    if (!listRes.ok) throw new Error(`Gmail list failed: ${listRes.status}`);
    const list = await listRes.json() as { messages?: { id: string; threadId: string }[] };
    const rows = [];
    for (const message of list.messages ?? []) {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`, { headers: { ...googleJsonHeaders, Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) continue;
      const item = await res.json() as { id: string; threadId: string; snippet?: string; internalDate?: string; payload?: { headers?: { name: string; value: string }[] } };
      const headers = Object.fromEntries((item.payload?.headers ?? []).map((header) => [header.name.toLowerCase(), header.value]));
      const from = parseGmailAddress(headers.from);
      const classified = classifyEmail(headers.subject ?? '', item.snippet ?? '');
      rows.push({ source_id: sourceId, google_message_id: item.id, thread_id: item.threadId, from_email: from.email, from_name: from.name, to_emails: headers.to ? headers.to.split(',').map((email) => email.trim()) : [], subject: headers.subject ?? '(No subject)', snippet: item.snippet ?? '', received_at: item.internalDate ? new Date(Number(item.internalDate)).toISOString() : null, project_id: null, ...classified, status: 'imported', metadata: { classification: 'local_lightweight' }, updated_at: new Date().toISOString() });
    }
    if (rows.length) await supabaseRequest('gmail_messages?on_conflict=source_id,google_message_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(rows) });
    await ensureServiceConnection(sourceId, 'gmail', 'enabled', { last_sync_at: new Date().toISOString(), last_error: null });
    await logSync(sourceId, 'gmail', 'success', `${rows.length} Gmail messages imported.`);
    return { imported: rows.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gmail sync failed';
    await ensureServiceConnection(sourceId, 'gmail', 'error', { last_error: message });
    await logSync(sourceId, 'gmail', 'error', message);
    throw error;
  }
}

export async function syncCalendar(sourceId: string) {
  const source = await findSource(sourceId);
  try {
    const accessToken = await getAccessToken(source);
    const params = new URLSearchParams({ timeMin: new Date().toISOString(), timeMax: new Date(Date.now() + 14 * 86400000).toISOString(), singleEvents: 'true', orderBy: 'startTime', maxResults: '50' });
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, { headers: { ...googleJsonHeaders, Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) throw new Error(`Calendar sync failed: ${res.status}`);
    const data = await res.json() as { items?: { id: string; summary?: string; description?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string }; attendees?: unknown[]; status?: string }[] };
    const rows = (data.items ?? []).map((event) => ({ source_id: sourceId, google_event_id: event.id, title: event.summary ?? '(Untitled event)', description: event.description ?? null, start_at: event.start?.dateTime ?? event.start?.date ?? null, end_at: event.end?.dateTime ?? event.end?.date ?? null, attendees: event.attendees ?? [], project_id: null, status: event.status ?? 'confirmed', metadata: {}, updated_at: new Date().toISOString() }));
    if (rows.length) await supabaseRequest('calendar_events?on_conflict=source_id,google_event_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(rows) });
    await ensureServiceConnection(sourceId, 'calendar', 'enabled', { last_sync_at: new Date().toISOString(), last_error: null });
    await logSync(sourceId, 'calendar', 'success', `${rows.length} calendar events imported.`);
    return { imported: rows.length };
  } catch (error) { const message = error instanceof Error ? error.message : 'Calendar sync failed'; await ensureServiceConnection(sourceId, 'calendar', 'error', { last_error: message }); await logSync(sourceId, 'calendar', 'error', message); throw error; }
}

export async function syncDrive(sourceId: string) {
  const source = await findSource(sourceId);
  try {
    const accessToken = await getAccessToken(source);
    const q = "mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet'";
    const params = new URLSearchParams({ pageSize: '20', orderBy: 'modifiedTime desc', fields: 'files(id,name,mimeType,webViewLink,modifiedTime)', q });
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, { headers: { ...googleJsonHeaders, Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) throw new Error(`Drive sync failed: ${res.status}`);
    const data = await res.json() as { files?: { id: string; name: string; mimeType: string; webViewLink?: string; modifiedTime?: string }[] };
    const docs = (data.files ?? []).filter((file) => file.mimeType === 'application/vnd.google-apps.document').map((file) => ({ source_id: sourceId, google_file_id: file.id, name: file.name, mime_type: file.mimeType, web_url: file.webViewLink ?? null, project_id: null, summary: null, status: 'imported', metadata: { modified_time: file.modifiedTime }, updated_at: new Date().toISOString() }));
    const sheets = (data.files ?? []).filter((file) => file.mimeType === 'application/vnd.google-apps.spreadsheet').map((file) => ({ source_id: sourceId, google_file_id: file.id, name: file.name, web_url: file.webViewLink ?? null, project_id: null, summary: null, status: 'imported', metadata: { modified_time: file.modifiedTime, mime_type: file.mimeType }, updated_at: new Date().toISOString() }));
    if (docs.length) await supabaseRequest('google_documents?on_conflict=source_id,google_file_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(docs) });
    if (sheets.length) await supabaseRequest('google_sheets?on_conflict=source_id,google_file_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(sheets) });
    const now = new Date().toISOString(); await Promise.all([ensureServiceConnection(sourceId, 'docs', 'enabled', { last_sync_at: now, last_error: null }), ensureServiceConnection(sourceId, 'sheets', 'enabled', { last_sync_at: now, last_error: null })]);
    await logSync(sourceId, 'drive', 'success', `${docs.length + sheets.length} Drive files imported.`);
    return { imported: docs.length + sheets.length };
  } catch (error) { const message = error instanceof Error ? error.message : 'Drive sync failed'; await Promise.all([ensureServiceConnection(sourceId, 'docs', 'error', { last_error: message }), ensureServiceConnection(sourceId, 'sheets', 'error', { last_error: message })]); await logSync(sourceId, 'drive', 'error', message); throw error; }
}
