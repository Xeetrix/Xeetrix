// Server-only helper for Xeetrix Mart API Proxy Routes (/api/mart/*) & SSR Pages
// Isolates Google Apps Script 302 redirects and optional API tokens on the server,
// paired with Stale-While-Revalidate (SWR) caching, in-flight deduplication, and
// instant invalidation on mutations for sub-10ms warm storefront & admin loads.

import {
  DEFAULT_MART_SETTINGS,
  MartAttribute,
  MartCategory,
  MartLabel,
  MartProduct,
  MartPublicBundle,
  MartSettings,
  normalizeCategoryRecord,
  normalizeLabelRecord,
  normalizeProductRecord,
} from "@/lib/martApi";

export interface MartServerPublicPayload {
  products: unknown[];
  categories: unknown[];
  labels: unknown[];
  attributes?: unknown[];
  settings: Record<string, string>;
}

export interface MartServerAdminPayload {
  products: unknown[];
  categories: unknown[];
  labels: unknown[];
  attributes: unknown[];
  suppliers: unknown[];
  coupons: unknown[];
  orders: unknown[];
  transactions: unknown[];
  crmProfiles: unknown[];
  crmLogs: unknown[];
  settings: Record<string, string>;
}

interface CacheEntry<T> {
  freshUntil: number;
  staleUntil: number;
  scriptUrl: string;
  data: T;
}

interface MartServerCacheStore {
  publicCache: CacheEntry<MartServerPublicPayload> | null;
  publicInFlight: Promise<{
    isLiveBackend: boolean;
    data: MartServerPublicPayload | null;
    error?: string;
  }> | null;
  adminCache: CacheEntry<MartServerAdminPayload> | null;
  adminInFlight: Promise<{
    isLiveBackend: boolean;
    data: MartServerAdminPayload | null;
    error?: string;
  }> | null;
}

const PUBLIC_FRESH_TTL_MS = 60_000; // 60s fresh window (zero network hits)
const PUBLIC_STALE_TTL_MS = 15 * 60_000; // 15m SWR window (serve instant, refresh silently)
const ADMIN_FRESH_TTL_MS = 45_000; // 45s fresh window (busted instantly on any admin mutation)
const ADMIN_STALE_TTL_MS = 10 * 60_000; // 10m SWR window for instant admin boot

const globalForMartCache = globalThis as typeof globalThis & {
  __xeetrixMartServerCache?: MartServerCacheStore;
};

function getServerCacheStore(): MartServerCacheStore {
  if (!globalForMartCache.__xeetrixMartServerCache) {
    globalForMartCache.__xeetrixMartServerCache = {
      publicCache: null,
      publicInFlight: null,
      adminCache: null,
      adminInFlight: null,
    };
  }
  return globalForMartCache.__xeetrixMartServerCache;
}

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
  const store = getServerCacheStore();
  store.publicCache = null;
  store.adminCache = null;
}

export function sanitizePublicProductsForClient(rawProducts: unknown): unknown[] {
  if (!Array.isArray(rawProducts)) return [];
  return rawProducts.map((raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const p = { ...(raw as Record<string, unknown>) };
    delete p.costPrice;
    delete p.supplierId;
    delete p.sourceName;
    delete p.collectionMode;
    if (typeof p.variationMatrixJson === "string" && p.variationMatrixJson.trim()) {
      try {
        const matrix = JSON.parse(p.variationMatrixJson);
        if (Array.isArray(matrix)) {
          p.variationMatrixJson = JSON.stringify(
            matrix.map((cell) => {
              if (!cell || typeof cell !== "object") return cell;
              const cleanCell = { ...(cell as Record<string, unknown>) };
              delete cleanCell.costOverride;
              return cleanCell;
            })
          );
        }
      } catch {
        // Keep existing value if unparseable
      }
    }
    return p;
  });
}

export function buildClientPublicBundleFromServerPayload(
  data: MartServerPublicPayload | null | undefined,
  isLiveBackend: boolean
): MartPublicBundle {
  if (!isLiveBackend || !data) {
    return {
      products: [],
      categories: [],
      labels: [],
      attributes: [],
      settings: { ...DEFAULT_MART_SETTINGS },
      isLiveBackend: false,
    };
  }

  const sanitizedProducts = sanitizePublicProductsForClient(data.products);
  const mergedSettings: MartSettings = {
    ...DEFAULT_MART_SETTINGS,
    ...(data.settings || {}),
  };

  let resolvedAttributes: MartAttribute[] = [];
  if (Array.isArray(data.attributes) && data.attributes.length > 0) {
    resolvedAttributes = data.attributes as MartAttribute[];
  } else if (mergedSettings.attributes_catalog_json) {
    try {
      const parsed = JSON.parse(mergedSettings.attributes_catalog_json);
      if (Array.isArray(parsed)) {
        resolvedAttributes = parsed as MartAttribute[];
      }
    } catch {
      // Ignore parse error
    }
  }

  return {
    products: sanitizedProducts.map((item) =>
      normalizeProductRecord(item as Partial<MartProduct>)
    ),
    categories: Array.isArray(data.categories)
      ? data.categories.map((c) => normalizeCategoryRecord(c as Partial<MartCategory>))
      : [],
    labels: Array.isArray(data.labels)
      ? data.labels.map((l) => normalizeLabelRecord(l as Partial<MartLabel>))
      : [],
    attributes: resolvedAttributes,
    settings: mergedSettings,
    isLiveBackend: true,
  };
}

async function fetchMartPublicNetwork(
  scriptUrl: string,
  forceFresh: boolean
): Promise<{
  isLiveBackend: boolean;
  data: MartServerPublicPayload | null;
  error?: string;
}> {
  const store = getServerCacheStore();
  if (!forceFresh && store.publicInFlight) {
    return store.publicInFlight;
  }

  const requestPromise = (async () => {
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

      const completedAt = Date.now();
      store.publicCache = {
        freshUntil: completedAt + PUBLIC_FRESH_TTL_MS,
        staleUntil: completedAt + PUBLIC_STALE_TTL_MS,
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
  })();

  if (!forceFresh) {
    store.publicInFlight = requestPromise;
    void requestPromise.finally(() => {
      if (store.publicInFlight === requestPromise) {
        store.publicInFlight = null;
      }
    });
  }
  return requestPromise;
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

  const store = getServerCacheStore();
  const now = Date.now();
  const cached = store.publicCache;

  if (!forceFresh && cached && cached.scriptUrl === scriptUrl) {
    // 1. Fresh cache hit — instant return
    if (cached.freshUntil > now) {
      return { isLiveBackend: true, data: cached.data };
    }
    // 2. Stale-While-Revalidate — serve instantly and refresh silently in background
    if (cached.staleUntil > now) {
      if (!store.publicInFlight) {
        void fetchMartPublicNetwork(scriptUrl, false).catch(() => undefined);
      }
      return { isLiveBackend: true, data: cached.data };
    }
  }

  const liveRes = await fetchMartPublicNetwork(scriptUrl, forceFresh);
  // Graceful fallback to last known snapshot if upstream transiently fails
  if (!liveRes.isLiveBackend && cached && cached.scriptUrl === scriptUrl) {
    return { isLiveBackend: true, data: cached.data };
  }
  return liveRes;
}

async function fetchMartAdminNetwork(
  scriptUrl: string,
  forceFresh: boolean
): Promise<{
  isLiveBackend: boolean;
  data: MartServerAdminPayload | null;
  error?: string;
}> {
  const store = getServerCacheStore();
  if (!forceFresh && store.adminInFlight) {
    return store.adminInFlight;
  }

  const requestPromise = (async () => {
    try {
      const token = getMartApiTokenServer();
      const separator = scriptUrl.includes("?") ? "&" : "?";
      const tokenQuery = token ? `&token=${encodeURIComponent(token)}` : "";
      const freshQuery = forceFresh ? "&fresh=1" : "";
      const res = await fetch(
        `${scriptUrl}${separator}action=martAdmin${tokenQuery}${freshQuery}`,
        {
          method: "GET",
          cache: "no-store",
          redirect: "follow",
        }
      );

      if (!res.ok) {
        throw new Error(`Store admin HTTP ${res.status}`);
      }

      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: Partial<MartServerAdminPayload>;
      };

      if (!json.ok || !json.data) {
        throw new Error(json.error || "Failed to load Mart Admin data from Google Sheets.");
      }

      const normalized: MartServerAdminPayload = {
        products: Array.isArray(json.data.products) ? json.data.products : [],
        categories: Array.isArray(json.data.categories) ? json.data.categories : [],
        labels: Array.isArray(json.data.labels) ? json.data.labels : [],
        attributes: Array.isArray(json.data.attributes) ? json.data.attributes : [],
        suppliers: Array.isArray(json.data.suppliers) ? json.data.suppliers : [],
        coupons: Array.isArray(json.data.coupons) ? json.data.coupons : [],
        orders: Array.isArray(json.data.orders) ? json.data.orders : [],
        transactions: Array.isArray(json.data.transactions) ? json.data.transactions : [],
        crmProfiles: Array.isArray(json.data.crmProfiles) ? json.data.crmProfiles : [],
        crmLogs: Array.isArray(json.data.crmLogs) ? json.data.crmLogs : [],
        settings: json.data.settings || {},
      };

      const completedAt = Date.now();
      store.adminCache = {
        freshUntil: completedAt + ADMIN_FRESH_TTL_MS,
        staleUntil: completedAt + ADMIN_STALE_TTL_MS,
        scriptUrl,
        data: normalized,
      };

      return { isLiveBackend: true, data: normalized };
    } catch (err) {
      return {
        isLiveBackend: false,
        data: null,
        error:
          err instanceof Error
            ? err.message
            : "Failed to sync store data from Google Sheets.",
      };
    }
  })();

  if (!forceFresh) {
    store.adminInFlight = requestPromise;
    void requestPromise.finally(() => {
      if (store.adminInFlight === requestPromise) {
        store.adminInFlight = null;
      }
    });
  }
  return requestPromise;
}

export async function fetchMartAdminFromScript(forceFresh = false): Promise<{
  isLiveBackend: boolean;
  data: MartServerAdminPayload | null;
  error?: string;
}> {
  const scriptUrl = getMartScriptUrlServer();
  if (!scriptUrl) {
    return { isLiveBackend: false, data: null };
  }

  const store = getServerCacheStore();
  const now = Date.now();
  const cached = store.adminCache;

  if (!forceFresh && cached && cached.scriptUrl === scriptUrl) {
    if (cached.freshUntil > now) {
      return { isLiveBackend: true, data: cached.data };
    }
    if (cached.staleUntil > now) {
      if (!store.adminInFlight) {
        void fetchMartAdminNetwork(scriptUrl, false).catch(() => undefined);
      }
      return { isLiveBackend: true, data: cached.data };
    }
  }

  return fetchMartAdminNetwork(scriptUrl, forceFresh);
}

export class MartScriptError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "MartScriptError";
    this.code = code;
    this.status = status;
  }
}

export async function callMartScriptPost<T = Record<string, unknown>>(
  payload: Record<string, unknown>,
  includeAdminToken = false
): Promise<{ ok: boolean; error?: string; code?: string } & T> {
  const scriptUrl = getMartScriptUrlServer();
  if (!scriptUrl) {
    throw new MartScriptError("MART_BACKEND_NOT_CONFIGURED", "BACKEND_UNCONFIGURED", 503);
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
    throw new MartScriptError(`Mart backend HTTP ${res.status}`, "GENERIC_NETWORK", 502);
  }

  const json = (await res.json()) as { ok: boolean; error?: string; code?: string } & T;
  if (!json.ok) {
    throw new MartScriptError(
      json.error || "Mart backend rejected the request.",
      json.code,
      json.code === "OUT_OF_STOCK" ||
        json.code === "VARIANT_UNAVAILABLE" ||
        json.code === "DUPLICATE_SKU"
        ? 409
        : 400
    );
  }

  // Bust server-side storefront & admin caches whenever a mutation completes
  invalidateMartServerCache();
  return json;
}
