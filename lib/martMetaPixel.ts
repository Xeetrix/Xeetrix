/**
 * Hybrid Meta (Facebook) Browser Pixel + Server-Side Conversions API (CAPI)
 * for Xeetrix Mart
 * Pixel / Dataset ID: 1737437691431259
 * Scoped strictly to customer-facing Mart routes (/mart and /mart/p/[slug]),
 * explicitly excluding /mart/admin.
 */

export const MART_META_PIXEL_ID = "1737437691431259";

const FBC_STORAGE_KEY = "xeetrix_mart_meta_fbc_v1";
const LEAD_ID_STORAGE_KEY = "xeetrix_mart_meta_lead_id_v1";
const CUSTOMER_PREF_STORAGE_KEY = "xeetrix_mart_customer_pref_v1";

export interface MartMetaCustomerContext {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  deliveryArea?: string;
  externalId?: string;
  leadId?: string;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function isMartAdminRoute(pathname?: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/mart/admin");
}

function isBrowserCustomerMartRoute(): boolean {
  if (typeof window === "undefined") return false;
  return !isMartAdminRoute(window.location.pathname);
}

export function generateMartEventId(eventName: string): string {
  const prefix = String(eventName || "evt")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const rand = Math.random().toString(36).slice(2, 10);
  return `xm_${prefix}_${Date.now()}_${rand}`;
}

function readCookieValue(cookieName: string): string {
  if (typeof document === "undefined" || !document.cookie) return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${cookieName}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

/**
 * Captures `fbclid` from URL query parameters on landing and formats it
 * per Meta specification: `fb.1.<timestamp_ms>.<fbclid>`
 */
export function captureMartMetaClickIdFromUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid")?.trim();
    if (fbclid) {
      const formattedFbc = `fb.1.${Date.now()}.${fbclid}`;
      try {
        window.localStorage.setItem(FBC_STORAGE_KEY, formattedFbc);
      } catch {
        // Ignore storage quota errors
      }
      return formattedFbc;
    }
    const cookieFbc = readCookieValue("_fbc");
    if (cookieFbc) return cookieFbc;
    return window.localStorage.getItem(FBC_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * Captures a 15- to 17-digit Meta `lead_id` from landing URL query parameters
 * (if coming from a Meta Instant Form / Lead Ad redirect) and persists it locally.
 */
export function captureMartMetaLeadIdFromUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const params = new URLSearchParams(window.location.search);
    const rawLeadId = (
      params.get("lead_id") ||
      params.get("meta_lead_id") ||
      params.get("leadId") ||
      ""
    )
      .trim()
      .replace(/\D/g, "");
    if (/^\d{15,17}$/.test(rawLeadId)) {
      try {
        window.localStorage.setItem(LEAD_ID_STORAGE_KEY, rawLeadId);
      } catch {
        // Ignore storage quota errors
      }
      return rawLeadId;
    }
    const stored = (window.localStorage.getItem(LEAD_ID_STORAGE_KEY) || "")
      .trim()
      .replace(/\D/g, "");
    return /^\d{15,17}$/.test(stored) ? stored : "";
  } catch {
    return "";
  }
}

function resolveSavedCustomerContext(
  explicit?: MartMetaCustomerContext
): MartMetaCustomerContext {
  const merged: MartMetaCustomerContext = { ...(explicit || {}) };
  if (typeof window === "undefined") return merged;

  try {
    const raw = window.localStorage.getItem(CUSTOMER_PREF_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        customerName?: string;
        phone?: string;
        email?: string;
        address?: string;
        deliveryArea?: string;
        leadId?: string;
      };
      if (!merged.name && parsed.customerName) {
        merged.name = parsed.customerName;
      }
      if (!merged.phone && parsed.phone) {
        merged.phone = parsed.phone;
      }
      if (!merged.email && parsed.email) {
        merged.email = parsed.email;
      }
      if (!merged.address && parsed.address) {
        merged.address = parsed.address;
      }
      if (!merged.deliveryArea && parsed.deliveryArea) {
        merged.deliveryArea = parsed.deliveryArea;
      }
      if (!merged.leadId && parsed.leadId) {
        merged.leadId = parsed.leadId;
      }
    }
  } catch {
    // Ignore storage read errors
  }

  if (!merged.leadId) {
    const capturedLeadId = captureMartMetaLeadIdFromUrl();
    if (capturedLeadId) {
      merged.leadId = capturedLeadId;
    }
  }

  return merged;
}

/**
 * Fires an event to BOTH Browser Meta Pixel (`window.fbq`) AND
 * Server-Side Conversions API (`/api/mart/meta-capi`) with a shared `eventID`
 * so Meta Events Manager deduplicates them automatically.
 */
export function trackMartPixelEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  customer?: MartMetaCustomerContext
): string {
  if (!isBrowserCustomerMartRoute()) return "";

  const eventId = generateMartEventId(eventName);
  const payloadData = customData || {};

  // 1. Fire Browser Meta Pixel with shared eventID
  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", eventName, payloadData, { eventID: eventId });
    }
  } catch {
    // Prevent ad-blocker or third-party script errors from affecting storefront UX
  }

  // 2. Fire Server-Side Meta Conversions API (CAPI) with the exact same eventId
  try {
    const fbp = readCookieValue("_fbp");
    const fbc = captureMartMetaClickIdFromUrl();
    const resolvedCustomer = resolveSavedCustomerContext(customer);

    void fetch("/api/mart/meta-capi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        customData: payloadData,
        customer: resolvedCustomer,
        fbp,
        fbc,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignore network errors on background analytics dispatch
  }

  return eventId;
}

export function trackMartPageView(): void {
  trackMartPixelEvent("PageView");
}

export function trackMartViewContent(product: {
  id?: string;
  sku?: string;
  nameEn?: string;
  nameBn?: string;
  price?: number;
  categories?: string;
}): void {
  const contentId = String(product.sku || product.id || "").trim();
  if (!contentId) return;
  const contentName = String(
    product.nameEn || product.nameBn || contentId
  ).trim();
  const unitPrice = Math.max(0, Number(product.price) || 0);

  trackMartPixelEvent("ViewContent", {
    content_ids: [contentId],
    content_name: contentName,
    content_category: String(product.categories || "Xeetrix Mart").trim(),
    content_type: "product",
    contents: [
      {
        id: contentId,
        quantity: 1,
        item_price: unitPrice,
      },
    ],
    value: unitPrice,
    currency: "BDT",
  });
}

export function trackMartSearch(query: string, resultCount?: number): void {
  const cleanQuery = String(query || "").trim();
  if (cleanQuery.length < 2) return;

  trackMartPixelEvent("Search", {
    search_string: cleanQuery,
    content_category: "Xeetrix Mart",
    ...(typeof resultCount === "number" ? { num_items: resultCount } : {}),
  });
}

export function trackMartAddToCart(payload: {
  id?: string;
  sku?: string;
  nameEn?: string;
  nameBn?: string;
  unitPrice: number;
  quantity: number;
  variant?: string;
}): void {
  const contentId = String(payload.sku || payload.id || "").trim();
  if (!contentId) return;
  const qty = Math.max(1, Number(payload.quantity) || 1);
  const unitPrice = Math.max(0, Number(payload.unitPrice) || 0);
  const contentName = String(
    payload.nameEn || payload.nameBn || contentId
  ).trim();

  trackMartPixelEvent("AddToCart", {
    content_ids: [contentId],
    content_name: payload.variant
      ? `${contentName} (${payload.variant})`
      : contentName,
    content_type: "product",
    contents: [
      {
        id: contentId,
        quantity: qty,
        item_price: unitPrice,
      },
    ],
    num_items: qty,
    value: unitPrice * qty,
    currency: "BDT",
  });
}

export function trackMartInitiateCheckout(payload: {
  items: Array<{
    sku?: string;
    productId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  value: number;
  customer?: MartMetaCustomerContext;
}): void {
  if (!payload.items || payload.items.length === 0) return;

  const contentIds = payload.items
    .map((item) => String(item.sku || item.productId || "").trim())
    .filter(Boolean);
  const contents = payload.items.map((item) => ({
    id: String(item.sku || item.productId || "").trim(),
    quantity: Math.max(1, Number(item.quantity) || 1),
    item_price: Math.max(0, Number(item.unitPrice) || 0),
  }));
  const numItems = payload.items.reduce(
    (sum, item) => sum + Math.max(1, Number(item.quantity) || 1),
    0
  );

  trackMartPixelEvent(
    "InitiateCheckout",
    {
      content_ids: contentIds,
      contents,
      content_type: "product",
      num_items: numItems,
      value: Math.max(0, Number(payload.value) || 0),
      currency: "BDT",
    },
    payload.customer
  );
}

export function trackMartPurchase(payload: {
  orderId: string;
  items: Array<{
    sku?: string;
    productId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  customer?: MartMetaCustomerContext;
}): void {
  const contentIds = payload.items
    .map((item) => String(item.sku || item.productId || "").trim())
    .filter(Boolean);
  const contents = payload.items.map((item) => ({
    id: String(item.sku || item.productId || "").trim(),
    quantity: Math.max(1, Number(item.quantity) || 1),
    item_price: Math.max(0, Number(item.unitPrice) || 0),
  }));
  const numItems = payload.items.reduce(
    (sum, item) => sum + Math.max(1, Number(item.quantity) || 1),
    0
  );

  trackMartPixelEvent(
    "Purchase",
    {
      content_ids: contentIds,
      contents,
      content_type: "product",
      num_items: numItems,
      value: Math.max(0, Number(payload.totalAmount) || 0),
      currency: "BDT",
      order_id: String(payload.orderId || "").trim(),
    },
    {
      ...payload.customer,
      externalId: payload.customer?.phone || payload.orderId,
    }
  );
}
