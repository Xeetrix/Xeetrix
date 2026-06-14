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

export type ConnectedGoogleAccount = ConnectedSource & { last_sync: string | null };

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const GOOGLE_SCOPES = ['openid', 'email', 'profile'];

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

const PRODUCTION_SITE_URL = 'https://xeetrix.com';

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '');
}

function getBaseUrl() {
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    return PRODUCTION_SITE_URL;
  }

  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL;

  if (configuredUrl) return normalizeBaseUrl(configuredUrl);
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export function getGoogleRedirectUri() {
  return `${getBaseUrl()}/api/integrations/google/callback`;
}

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

function getEncryptionKey() {
  const secret = requiredEnv('TOKEN_ENCRYPTION_KEY');
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
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
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${detail}`);
  }

  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

export async function listGoogleAccounts(): Promise<ConnectedGoogleAccount[]> {
  if (!supabaseConfig()) return [];
  const accounts = await supabaseRequest<ConnectedSource[]>('connected_sources?provider=eq.google&select=id,provider,account_email,display_name,status,expires_at,created_at,updated_at&order=created_at.desc');
  if (!accounts.length) return [];

  const ids = accounts.map((account) => account.id);
  const logs = await supabaseRequest<SourceSyncLog[]>(`source_sync_logs?source_id=in.(${ids.join(',')})&select=id,source_id,sync_type,status,message,created_at&order=created_at.desc`);
  return accounts.map((account) => ({
    ...account,
    last_sync: logs.find((log) => log.source_id === account.id)?.created_at ?? null,
  }));
}

export async function deleteGoogleAccount(id: string) {
  await supabaseRequest<null>(`connected_sources?id=eq.${encodeURIComponent(id)}&provider=eq.google`, { method: 'DELETE' });
}

type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

type GoogleProfile = {
  email: string;
  name?: string;
};

export async function registerGoogleAccount(code: string) {
  const clientId = requiredEnv('GOOGLE_CLIENT_ID');
  const clientSecret = requiredEnv('GOOGLE_CLIENT_SECRET');
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) throw new Error(`Google token exchange failed: ${tokenResponse.status}`);
  const tokens = await tokenResponse.json() as GoogleTokenResponse;
  if (!tokens.refresh_token) throw new Error('Google did not return a refresh token. Reconnect with consent to register this account.');

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (!profileResponse.ok) throw new Error(`Google profile lookup failed: ${profileResponse.status}`);
  const profile = await profileResponse.json() as GoogleProfile;
  if (!profile.email) throw new Error('Google profile did not include an email address');

  const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;
  const payload = {
    provider: 'google',
    account_email: profile.email,
    display_name: profile.name ?? null,
    status: 'connected',
    access_token_encrypted: encryptToken(tokens.access_token),
    refresh_token_encrypted: encryptToken(tokens.refresh_token),
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  };

  const [account] = await supabaseRequest<ConnectedSource[]>('connected_sources?on_conflict=provider,account_email', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(payload),
  });

  await supabaseRequest<SourceSyncLog[]>('source_sync_logs', {
    method: 'POST',
    body: JSON.stringify({ source_id: account.id, sync_type: 'oauth_connect', status: 'success', message: 'Google account registered. No Workspace data imported.' }),
  });

  return account;
}
