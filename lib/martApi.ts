// Standalone Xeetrix Mart API & Domain Utilities
// Zero dependencies on parent holding or travel modules so this folder
// can be extracted to a standalone e-commerce domain with zero code edits.

export const MART_BRAND_NAME = "Xeetrix Mart";
export const MART_CONTACT_EMAIL = "mart@xeetrix.com";
export const MART_CONTACT_PHONE = "+880 965 803 6631";
export const MART_CONTACT_TEL = "tel:+8809658036631";
export const MART_ADDRESS = "Dhaka, Bangladesh";
export const MART_CURRENCY = "৳";

export type MartSheetName =
  | "Mart_Products"
  | "Mart_Categories"
  | "Mart_Orders"
  | "Mart_Settings";

export interface MartProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  comparePrice: number;
  stock: number;
  variants: string; // Comma-separated sizes/colors, e.g. "Black, Silver" or "M, L, XL"
  imageUrl: string;
  description: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface MartCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  active: boolean;
  createdAt: string;
}

export type MartOrderStatus =
  | "Pending"
  | "Confirmed"
  | "Packaging"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type MartPaymentMethod = "Cash on Delivery" | "Mobile Banking";
export type MartDeliveryArea = "Inside Dhaka" | "Outside Dhaka";

export interface MartOrderItem {
  productId: string;
  sku: string;
  name: string;
  variant: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string;
}

export interface MartOrder {
  id: string;
  itemsJson: string;
  itemsSummary: string;
  totalItems: number;
  subtotal: number;
  deliveryArea: MartDeliveryArea | string;
  deliveryCharge: number;
  totalAmount: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: MartPaymentMethod | string;
  transactionId: string;
  notes: string;
  status: MartOrderStatus;
  createdAt: string;
}

export interface MartSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  promoText: string;
  insideDhakaCharge: string;
  outsideDhakaCharge: string;
  mobileBankingNumber: string;
}

export const DEFAULT_MART_SETTINGS: MartSettings = {
  heroTitle: "Everyday Essentials & Authentic Electronics",
  heroSubtitle:
    "Verified quality products delivered nationwide across Bangladesh with transparent BDT pricing and flexible Cash on Delivery.",
  heroCtaText: "Shop Collection",
  promoText: "Nationwide Delivery · Cash on Delivery & Mobile Banking Available",
  insideDhakaCharge: "70",
  outsideDhakaCharge: "130",
  mobileBankingNumber: "",
};

function mergeMartSettings(partial?: Partial<MartSettings>): MartSettings {
  return {
    heroTitle: partial?.heroTitle || DEFAULT_MART_SETTINGS.heroTitle,
    heroSubtitle: partial?.heroSubtitle || DEFAULT_MART_SETTINGS.heroSubtitle,
    heroCtaText: partial?.heroCtaText || DEFAULT_MART_SETTINGS.heroCtaText,
    promoText: partial?.promoText || DEFAULT_MART_SETTINGS.promoText,
    insideDhakaCharge: partial?.insideDhakaCharge || DEFAULT_MART_SETTINGS.insideDhakaCharge,
    outsideDhakaCharge: partial?.outsideDhakaCharge || DEFAULT_MART_SETTINGS.outsideDhakaCharge,
    mobileBankingNumber: partial?.mobileBankingNumber ?? DEFAULT_MART_SETTINGS.mobileBankingNumber,
  };
}

export interface MartPublicBundle {
  products: MartProduct[];
  categories: MartCategory[];
  settings: MartSettings;
  isLiveBackend: boolean;
}

export interface MartAdminBundle extends MartPublicBundle {
  orders: MartOrder[];
}

export function formatMartBDT(amount: number): string {
  return `${MART_CURRENCY}${new Intl.NumberFormat("en-US").format(Math.round(Number(amount) || 0))}`;
}

export function parseProductVariants(variants?: string): string[] {
  if (!variants) return [];
  return variants
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseOrderItems(itemsJson?: string): MartOrderItem[] {
  if (!itemsJson) return [];
  try {
    const parsed = JSON.parse(itemsJson);
    return Array.isArray(parsed) ? (parsed as MartOrderItem[]) : [];
  } catch {
    return [];
  }
}

export function slugifyCategory(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const MART_PUBLIC_CACHE_KEY = "xeetrix_mart_public_snapshot_v1";
const MART_ADMIN_PASS_KEY = "xeetrix_mart_admin_pass_v1";

export function getCachedMartPublicSnapshot(): MartPublicBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MART_PUBLIC_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MartPublicBundle>;
    if (!parsed || !Array.isArray(parsed.products) || !Array.isArray(parsed.categories)) {
      return null;
    }
    return {
      products: parsed.products,
      categories: parsed.categories,
      settings: mergeMartSettings(parsed.settings),
      isLiveBackend: Boolean(parsed.isLiveBackend),
    };
  } catch {
    return null;
  }
}

export function setCachedMartPublicSnapshot(bundle: MartPublicBundle): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(MART_PUBLIC_CACHE_KEY, JSON.stringify(bundle));
  } catch {
    // Ignore storage quota restrictions
  }
}

export function clearMartPublicSnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(MART_PUBLIC_CACHE_KEY);
  } catch {
    // Ignore storage restrictions
  }
}

export function getStoredMartAdminPass(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(MART_ADMIN_PASS_KEY) || "";
  } catch {
    return "";
  }
}

export function clearStoredMartAdminPass(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(MART_ADMIN_PASS_KEY);
  } catch {
    // Ignore
  }
}

export async function verifyMartAdminPassword(password: string): Promise<void> {
  const clean = password.trim();
  if (!clean) {
    throw new Error("Please enter your store admin passcode.");
  }

  const res = await fetch("/api/mart/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "verifyAuth", password: clean }),
    cache: "no-store",
  });

  const json = (await res.json()) as { ok: boolean; error?: string };
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Invalid Mart Admin passcode. Please try again.");
  }

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(MART_ADMIN_PASS_KEY, clean);
    } catch {
      // Ignore storage access errors
    }
  }
}

/**
 * Normalizes Google Drive sharing links into direct embeddable image URLs.
 */
export function normalizeMartImageUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }
  const openMatch = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch && openMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${openMatch[1]}`;
  }
  const ucMatch = trimmed.match(/drive\.google\.com\/uc\?[^#]*id=([^&]+)/);
  if (ucMatch && ucMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  }
  return trimmed;
}

async function postToMartAdminApi<T = Record<string, unknown>>(
  payload: Record<string, unknown>
): Promise<{ ok: boolean; error?: string } & T> {
  const pass = getStoredMartAdminPass();
  const res = await fetch("/api/mart/admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mart-admin-pass": pass,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = (await res.json()) as { ok: boolean; error?: string } & T;
  if (!res.ok || !json.ok) {
    if (res.status === 401) {
      clearStoredMartAdminPass();
    }
    throw new Error(json.error || `Store backend HTTP ${res.status}`);
  }

  clearMartPublicSnapshot();
  return json;
}

/**
 * Fetches live public products, categories, and settings via Next.js server proxy + cache.
 * Strictly returns empty arrays (no dummy products or categories) when empty or unconfigured.
 */
export async function fetchMartPublicData(forceFresh = false): Promise<MartPublicBundle> {
  try {
    const endpoint = forceFresh ? "/api/mart/public?fresh=1" : "/api/mart/public";
    const res = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      ok: boolean;
      isLiveBackend?: boolean;
      data?: {
        products?: MartProduct[];
        categories?: MartCategory[];
        settings?: Partial<MartSettings>;
      };
    };

    if (!json.ok || !json.data) {
      throw new Error("Invalid store response");
    }

    const bundle: MartPublicBundle = {
      products: Array.isArray(json.data.products) ? json.data.products : [],
      categories: Array.isArray(json.data.categories) ? json.data.categories : [],
      settings: mergeMartSettings(json.data.settings),
      isLiveBackend: Boolean(json.isLiveBackend),
    };

    if (bundle.isLiveBackend) {
      setCachedMartPublicSnapshot(bundle);
    }

    return bundle;
  } catch {
    return {
      products: [],
      categories: [],
      settings: DEFAULT_MART_SETTINGS,
      isLiveBackend: false,
    };
  }
}

export async function trackMartOrder(orderId: string, phone: string): Promise<MartOrder> {
  const url = `/api/mart/track?orderId=${encodeURIComponent(
    orderId.trim()
  )}&phone=${encodeURIComponent(phone.trim())}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const json = (await res.json()) as {
    ok: boolean;
    error?: string;
    order?: MartOrder;
  };

  if (!res.ok || !json.ok || !json.order) {
    throw new Error(
      json.error || "No matching order found. Check your Order ID and phone number."
    );
  }
  return json.order;
}

export async function placeMartOrder(payload: {
  items: MartOrderItem[];
  subtotal: number;
  deliveryArea: MartDeliveryArea;
  deliveryCharge: number;
  totalAmount: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: MartPaymentMethod;
  transactionId?: string;
  notes?: string;
}): Promise<{ id: string; record?: MartOrder }> {
  const res = await fetch("/api/mart/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = (await res.json()) as {
    ok: boolean;
    error?: string;
    id?: string;
    record?: MartOrder;
  };

  if (!res.ok || !json.ok || !json.id) {
    throw new Error(
      json.error ||
        "Store checkout is currently being connected. Please call +880 965 803 6631 or email mart@xeetrix.com to complete your order."
    );
  }

  clearMartPublicSnapshot();
  return { id: json.id, record: json.record };
}

export async function fetchMartAdminData(): Promise<MartAdminBundle> {
  const pass = getStoredMartAdminPass();
  const res = await fetch("/api/mart/admin", {
    method: "GET",
    headers: {
      "x-mart-admin-pass": pass,
    },
    cache: "no-store",
  });

  const json = (await res.json()) as {
    ok: boolean;
    isLiveBackend?: boolean;
    error?: string;
    data?: {
      products?: MartProduct[];
      categories?: MartCategory[];
      orders?: MartOrder[];
      settings?: Partial<MartSettings>;
    };
  };

  if (!res.ok || !json.ok || !json.data) {
    if (res.status === 401) {
      clearStoredMartAdminPass();
    }
    throw new Error(json.error || "Failed to load Mart Admin data from Google Sheets.");
  }

  return {
    products: Array.isArray(json.data.products) ? json.data.products : [],
    categories: Array.isArray(json.data.categories) ? json.data.categories : [],
    orders: Array.isArray(json.data.orders) ? json.data.orders : [],
    settings: mergeMartSettings(json.data.settings),
    isLiveBackend: Boolean(json.isLiveBackend),
  };
}

export async function createMartRecord<T extends Record<string, unknown>>(
  sheet: Exclude<MartSheetName, "Mart_Settings">,
  data: T
): Promise<{ id: string; record?: Record<string, unknown> }> {
  const res = await postToMartAdminApi<{ id: string; record?: Record<string, unknown> }>({
    action: "createRecord",
    sheet,
    data,
  });
  return { id: res.id, record: res.record };
}

export async function updateMartRecord(
  sheet: Exclude<MartSheetName, "Mart_Settings">,
  id: string,
  updates: Record<string, unknown>
): Promise<void> {
  await postToMartAdminApi({
    action: "updateRecord",
    sheet,
    id,
    updates,
  });
}

export async function deleteMartRecord(
  sheet: Exclude<MartSheetName, "Mart_Settings">,
  id: string
): Promise<void> {
  await postToMartAdminApi({
    action: "deleteRecord",
    sheet,
    id,
  });
}

export async function updateMartStoreSettings(
  settings: Partial<MartSettings>
): Promise<MartSettings> {
  const res = await postToMartAdminApi<{ settings: Partial<MartSettings> }>({
    action: "updateMartSettings",
    settings,
  });
  return mergeMartSettings(res.settings || settings);
}

export async function uploadMartImageToDrive(params: {
  fileName: string;
  mimeType: string;
  base64Data: string;
  folderType: "products" | "categories";
}): Promise<{ fileId: string; url: string; driveViewUrl?: string }> {
  const res = await postToMartAdminApi<{
    fileId: string;
    url: string;
    driveViewUrl?: string;
  }>({
    action: "uploadFile",
    ...params,
  });

  return {
    fileId: res.fileId,
    url: res.url,
    driveViewUrl: res.driveViewUrl,
  };
}

export function fileToMartBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const commaIdx = result.indexOf(",");
      resolve(commaIdx !== -1 ? result.substring(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export function exportMartOrdersToCsv(orders: MartOrder[]): void {
  const headers = [
    "Order ID",
    "Date",
    "Customer Name",
    "Phone",
    "Delivery Area",
    "Address",
    "Items",
    "Total Items",
    "Subtotal (BDT)",
    "Delivery Charge (BDT)",
    "Total Amount (BDT)",
    "Payment Method",
    "Transaction ID",
    "Notes",
    "Status",
  ];

  const escapeCsv = (val: unknown) => {
    const str = String(val ?? "").replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = orders.map((o) => [
    o.id,
    o.createdAt,
    o.customerName,
    o.phone,
    o.deliveryArea,
    o.address,
    o.itemsSummary,
    o.totalItems,
    o.subtotal,
    o.deliveryCharge,
    o.totalAmount,
    o.paymentMethod,
    o.transactionId,
    o.notes,
    o.status,
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.map(escapeCsv).join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `xeetrix-mart-sales-${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
