export type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
  };
};

type AuthChangeCallback = (event: 'SIGNED_IN' | 'SIGNED_OUT', session: SupabaseSession | null) => void;

const storageKey = 'robokart-admin-supabase-session';

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return { url: url.replace(/\/$/, ''), anonKey };
}

function readSession(): SupabaseSession | null {
  if (typeof window === 'undefined') return null;

  const rawSession = window.localStorage.getItem(storageKey);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as SupabaseSession;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

function writeSession(session: SupabaseSession | null) {
  if (typeof window === 'undefined') return;

  if (!session) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

const authListeners = new Set<AuthChangeCallback>();

function notifyAuthListeners(event: 'SIGNED_IN' | 'SIGNED_OUT', session: SupabaseSession | null) {
  authListeners.forEach((listener) => listener(event, session));
}

export const supabase = {
  auth: {
    async signInWithPassword(credentials: { email: string; password: string }) {
      const { url, anonKey } = getSupabaseConfig();
      const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const payload = await response.json();

      if (!response.ok) {
        return {
          data: { session: null, user: null },
          error: new Error(payload.error_description || payload.msg || 'Unable to sign in.'),
        };
      }

      const session: SupabaseSession = {
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
        expires_at: payload.expires_at,
        user: payload.user,
      };

      writeSession(session);
      notifyAuthListeners('SIGNED_IN', session);

      return { data: { session, user: session.user }, error: null };
    },

    async getSession() {
      return { data: { session: readSession() }, error: null };
    },

    async signOut() {
      writeSession(null);
      notifyAuthListeners('SIGNED_OUT', null);
      return { error: null };
    },

    onAuthStateChange(callback: AuthChangeCallback) {
      authListeners.add(callback);

      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  },
};
