// Server-only helper for Xeetrix Mart API Proxy Routes (/api/mart/*)
// Isolates Google Apps Script 302 redirects and optional API tokens on the server,
// paired with in-memory TTL caching + instant invalidation for sub-100ms storefront loads.

export interface MartServerPublicPayload {
  products: unknown[];
  categories: unknown[];
  labels: unknown[];
  settings: Record<string, string>;
}

const SERVER_CACHE_TTL_MS = 60_000; // 60s hot server memory cache (busted immediately on writes)

let publicCache: {
  expiresAt: number;
  scriptUrl: string;
  data: MartServerPublicPayload;
} | null = null;

export function getMartScriptUrlServer(): string {
  return (
    process.env.MART_SCRIPT_URL ||
    process.env.NEXT_PUBLIC_MART_SCRIPT_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
    ""
  ).trim();
}

export function getMartApiTokenServer(): string {
  return (
    process.env.MART_API_TOKEN ||
    process.env.NEXT_PUBLIC_MART_API_TOKEN ||
    process.env.ADMIN_API_TOKEN ||
    process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ||
    ""
  ).trim();
}

export function getExpectedMartAdminPassword(): string {
  return (
    process.env.MART_ADMIN_PASSWORD ||
    process.env.NEXT_PUBLIC_MART_ADMIN_PASSWORD ||
    "mart2026"
  ).trim();
}

export function invalidateMartServerCache(): void {
  publicCache = null;
}

export async function fetchMartPublicFromScript(forceFresh = false): Promise<{
  isLiveBackend: boolean;
  data: MartServerPublicPayload | null;
  error?: string;
}> {
  const scriptUrl = getMartScriptUrlServer();
  if (!scriptUrl) {
    return { isLiveBackend: false, data: null };
  }

  const now = Date.now();
  if (
    !forceFresh &&
    publicCache &&
    publicCache.scriptUrl === scriptUrl &&
    publicCache.expiresAt > now
  ) {
    return { isLiveBackend: true, data: publicCache.data };
  }

  try {
    const query = forceFresh ? "action=martPublic&fresh=1" : "action=martPublic";
    const separator = scriptUrl.includes("?") ? "&" : "?";
    const res = await fetch(`${scriptUrl}${separator}${query}`, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`Apps Script HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      ok: boolean;
      error?: string;
      data?: MartServerPublicPayload;
    };

    if (!json.ok || !json.data) {
      throw new Error(json.error || "Invalid Mart script response");
    }

    publicCache = {
      expiresAt: now + SERVER_CACHE_TTL_MS,
      scriptUrl,
      data: json.data,
    };

    return { isLiveBackend: true, data: json.data };
  } catch (err) {
    return {
      isLiveBackend: false,
      data: null,
      error: err instanceof Error ? err.message : "Failed to reach Mart backend",
    };
  }
}

export async function callMartScriptPost<T = Record<string, unknown>>(
  payload: Record<string, unknown>,
  includeAdminToken = false
): Promise<{ ok: boolean; error?: string } & T> {
  const scriptUrl = getMartScriptUrlServer();
  if (!scriptUrl) {
    throw new Error("MART_BACKEND_NOT_CONFIGURED");
  }

  const token = includeAdminToken ? getMartApiTokenServer() : "";
  const finalPayload = token ? { ...payload, token } : payload;

  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(finalPayload),
    redirect: "follow",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Mart backend HTTP ${res.status}`);
  }

  const json = (await res.json()) as { ok: boolean; error?: string } & T;
  if (!json.ok) {
    throw new Error(json.error || "Mart backend rejected the request.");
  }

  // Bust server-side storefront cache whenever a mutation completes
  invalidateMartServerCache();
  return json;
}
