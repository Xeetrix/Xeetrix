/**
 * Meta (Facebook) Pixel helper library for Xeetrix Mart
 * Pixel ID: 1737437691431259
 * Scoped strictly to customer-facing Mart routes (/mart and /mart/p/[slug]),
 * explicitly excluding /mart/admin.
 */

export const MART_META_PIXEL_ID = "1737437691431259";

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

function canFireMartPixel(): boolean {
  if (typeof window === "undefined") return false;
  if (isMartAdminRoute(window.location.pathname)) return false;
  return typeof window.fbq === "function";
}

export function trackMartPixelEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!canFireMartPixel()) return;
  try {
    if (params) {
      window.fbq?.("track", eventName, params);
    } else {
      window.fbq?.("track", eventName);
    }
  } catch {
    // Prevent ad-blocker or third-party script exceptions from affecting checkout UX
  }
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
  const contentName =
    String(product.nameEn || product.nameBn || contentId).trim();
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

  trackMartPixelEvent("InitiateCheckout", {
    content_ids: contentIds,
    contents,
    content_type: "product",
    num_items: numItems,
    value: Math.max(0, Number(payload.value) || 0),
    currency: "BDT",
  });
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

  trackMartPixelEvent("Purchase", {
    content_ids: contentIds,
    contents,
    content_type: "product",
    num_items: numItems,
    value: Math.max(0, Number(payload.totalAmount) || 0),
    currency: "BDT",
    order_id: String(payload.orderId || "").trim(),
  });
}
