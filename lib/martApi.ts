// Standalone Xeetrix Mart API & Domain Utilities
// Zero dependencies on parent holding or travel modules so this folder
// can be extracted to a standalone e-commerce domain with zero code edits.

import { MART_DICTIONARY, MartLang, slugifyTaxonomy } from "./martI18n";

export const MART_CONTACT_EMAIL = "mart@xeetrix.com";
export const MART_CONTACT_PHONE = "+880 965 803 6631";
export const MART_CONTACT_TEL = "tel:+8809658036631";
export const MART_CURRENCY = "৳";

export type MartSheetName =
  | "Mart_Products"
  | "Mart_Categories"
  | "Mart_Labels"
  | "Mart_Suppliers"
  | "Mart_Coupons"
  | "Mart_Orders"
  | "Mart_Transactions"
  | "Mart_CRM_Profiles"
  | "Mart_CRM_Logs"
  | "Mart_Settings";

export type MartFulfillmentType = "own_stock" | "dropship";
export type MartCollectionMode = "store_collects" | "supplier_collects";
export type MartSupplierType = "dropship" | "wholesale" | "manufacturer";
export type MartSupplierPayoutMode = "we_pay_supplier" | "supplier_pays_us";

export type MartItemStatus =
  | "Pending"
  | "Forwarded to Supplier"
  | "Packaging"
  | "Shipped"
  | "Delivered"
  | "Returned"
  | "Cancelled";

export type MartTransactionType =
  | "marketing_expense"
  | "operating_expense"
  | "inventory_purchase"
  | "return_shipping_loss"
  | "supplier_payout"
  | "dropship_receipt"
  | "other_income"
  | "other_expense";

export type MartPaymentAccount = "Cash" | "bKash" | "Nagad" | "Bank";
export type MartCrmEntityType = "customer" | "supplier";
export type MartCrmTier = "auto" | "vip" | "regular" | "new" | "high_risk" | "blocked";
export type MartCrmChannel =
  | "call"
  | "sms"
  | "email"
  | "meeting"
  | "order_followup"
  | "settlement_followup"
  | "note";
export type MartCrmOutcome =
  | "connected"
  | "no_answer"
  | "promised_payment"
  | "confirmed"
  | "resolved"
  | "escalated";

export interface MartProductColor {
  id: string;
  nameEn: string;
  nameBn: string;
  hex: string;
  imageUrl?: string;
}

export interface MartVariationVariant {
  key: string;
  colorNameEn: string;
  size: string;
  sku: string;
  priceOverride: number;
  costOverride?: number;
  stock: number;
  active: boolean;
}

export type MartCouponDiscountType = "percent" | "fixed";

export interface MartCoupon {
  id: string;
  code: string;
  discountType: MartCouponDiscountType;
  discountValue: number;
  maxDiscount: number;
  minOrderAmount: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  active: boolean;
  notes: string;
  createdAt: string;
}

export interface MartProduct {
  id: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  categories: string; // Comma-separated category slugs
  labels: string; // Comma-separated label slugs
  price: number;
  comparePrice: number;
  costPrice: number;
  wholesaleMinQty: number;
  wholesalePrice: number;
  fulfillmentType: MartFulfillmentType;
  supplierId: string;
  sourceName: string;
  collectionMode: MartCollectionMode;
  supplierAvailable: boolean;
  lowStockThreshold: number;
  stock: number;
  variantsEn: string;
  variantsBn: string;
  colorsJson: string;
  sizesList: string;
  variationMatrixJson: string;
  imageUrl: string;
  galleryUrls: string;
  descriptionEn: string;
  descriptionBn: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  // Optional legacy keys tolerated during migration
  name?: string;
  category?: string;
  variants?: string;
  description?: string;
}

export interface MartCategory {
  id: string;
  slug: string;
  parentSlug: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  imageUrl: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  // Optional legacy keys tolerated during migration
  name?: string;
  description?: string;
}

export type MartLabelTone = "emerald" | "gold" | "slate";

export interface MartLabel {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  tone: MartLabelTone | string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export interface MartSupplier {
  id: string;
  name: string;
  companyType: MartSupplierType;
  contactPerson: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  payoutMode: MartSupplierPayoutMode;
  leadTimeDays: number;
  tags: string;
  notes: string;
  nextFollowUpDate: string;
  lastContactedAt: string;
  active: boolean;
  createdAt: string;
}

export interface MartTransaction {
  id: string;
  date: string;
  type: MartTransactionType;
  category: string;
  amount: number;
  supplierId: string;
  orderId: string;
  paymentAccount: MartPaymentAccount | string;
  referenceNo: string;
  note: string;
  createdAt: string;
}

export interface MartCrmProfile {
  id: string;
  entityType: MartCrmEntityType;
  entityKey: string;
  name: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  tierOverride: MartCrmTier;
  tags: string;
  notes: string;
  nextFollowUpDate: string;
  followUpTask: string;
  lastContactedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MartCrmLog {
  id: string;
  entityType: MartCrmEntityType;
  entityKey: string;
  entityName: string;
  channel: MartCrmChannel;
  outcome: MartCrmOutcome;
  summary: string;
  nextFollowUpDate: string;
  relatedOrderId: string;
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
  nameEn?: string;
  nameBn?: string;
  variant: string;
  colorName?: string;
  sizeName?: string;
  variantSku?: string;
  isWholesale?: boolean;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string;
  // Enterprise Sourcing & Item-level Fulfillment metadata
  fulfillmentType?: MartFulfillmentType;
  supplierId?: string;
  supplierName?: string;
  collectionMode?: MartCollectionMode;
  unitCost?: number;
  lineCost?: number;
  lineProfit?: number;
  itemStatus?: MartItemStatus;
  itemNote?: string;
}

export interface MartOrder {
  id: string;
  itemsJson: string;
  itemsSummary: string;
  totalItems: number;
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  deliveryArea: MartDeliveryArea | string;
  deliveryCharge: number;
  totalAmount: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: MartPaymentMethod | string;
  paymentProvider?: string;
  transactionId: string;
  notes: string;
  status: MartOrderStatus;
  createdAt: string;
}

export interface MartSettings {
  heroTitleEn: string;
  heroTitleBn: string;
  heroSubtitleEn: string;
  heroSubtitleBn: string;
  heroCtaTextEn: string;
  heroCtaTextBn: string;
  promoTextEn: string;
  promoTextBn: string;
  insideDhakaCharge: string;
  outsideDhakaCharge: string;
  mobileBankingNumber: string;
  bkashMerchantNumber: string;
  bkashQrUrl: string;
  banglaQrUrl: string;
  banglaQrAccountInfo: string;
  // Legacy single-language read fallback keys
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  promoText?: string;
}

export const DEFAULT_MART_SETTINGS: MartSettings = {
  heroTitleEn: "Everyday Essentials & Authentic Electronics",
  heroTitleBn: "প্রতিদিনের নিত্যপ্রয়োজনীয় ও আসল ইলেকট্রনিক্স",
  heroSubtitleEn:
    "Verified quality products delivered nationwide across Bangladesh with transparent BDT pricing and flexible Cash on Delivery.",
  heroSubtitleBn:
    "স্বচ্ছ টাকা (৳) মূল্যে ও ক্যাশ অন ডেলিভারি সুবিধাসহ সারাদেশে যাচাইকৃত মানসম্মত পণ্য দ্রুত পৌঁছে দেওয়া হয়।",
  heroCtaTextEn: "Shop Collection",
  heroCtaTextBn: "কালেকশন দেখুন",
  promoTextEn: "Nationwide Delivery · Cash on Delivery & Mobile Banking Available",
  promoTextBn: "সারাদেশে ডেলিভারি · ক্যাশ অন ডেলিভারি ও মোবাইল ব্যাংকিং সুবিধা",
  insideDhakaCharge: "70",
  outsideDhakaCharge: "130",
  mobileBankingNumber: "",
  bkashMerchantNumber: "",
  bkashQrUrl: "",
  banglaQrUrl: "",
  banglaQrAccountInfo: "",
};

function mergeMartSettings(partial?: Partial<MartSettings>): MartSettings {
  return {
    heroTitleEn: partial?.heroTitleEn || partial?.heroTitle || DEFAULT_MART_SETTINGS.heroTitleEn,
    heroTitleBn: partial?.heroTitleBn || DEFAULT_MART_SETTINGS.heroTitleBn,
    heroSubtitleEn:
      partial?.heroSubtitleEn || partial?.heroSubtitle || DEFAULT_MART_SETTINGS.heroSubtitleEn,
    heroSubtitleBn: partial?.heroSubtitleBn || DEFAULT_MART_SETTINGS.heroSubtitleBn,
    heroCtaTextEn:
      partial?.heroCtaTextEn || partial?.heroCtaText || DEFAULT_MART_SETTINGS.heroCtaTextEn,
    heroCtaTextBn: partial?.heroCtaTextBn || DEFAULT_MART_SETTINGS.heroCtaTextBn,
    promoTextEn: partial?.promoTextEn || partial?.promoText || DEFAULT_MART_SETTINGS.promoTextEn,
    promoTextBn: partial?.promoTextBn || DEFAULT_MART_SETTINGS.promoTextBn,
    insideDhakaCharge: partial?.insideDhakaCharge || DEFAULT_MART_SETTINGS.insideDhakaCharge,
    outsideDhakaCharge: partial?.outsideDhakaCharge || DEFAULT_MART_SETTINGS.outsideDhakaCharge,
    mobileBankingNumber: partial?.mobileBankingNumber ?? DEFAULT_MART_SETTINGS.mobileBankingNumber,
    bkashMerchantNumber: partial?.bkashMerchantNumber ?? DEFAULT_MART_SETTINGS.bkashMerchantNumber,
    bkashQrUrl: partial?.bkashQrUrl ?? DEFAULT_MART_SETTINGS.bkashQrUrl,
    banglaQrUrl: partial?.banglaQrUrl ?? DEFAULT_MART_SETTINGS.banglaQrUrl,
    banglaQrAccountInfo: partial?.banglaQrAccountInfo ?? DEFAULT_MART_SETTINGS.banglaQrAccountInfo,
  };
}

function normalizeProductRecord(raw: Partial<MartProduct>): MartProduct {
  const legacyCat = (raw.category || "").trim();
  const cats =
    (raw.categories || "").trim() || (legacyCat ? slugifyTaxonomy(legacyCat) : "");
  const fulfillmentType: MartFulfillmentType =
    raw.fulfillmentType === "dropship" ? "dropship" : "own_stock";
  const collectionMode: MartCollectionMode =
    raw.collectionMode === "supplier_collects" ? "supplier_collects" : "store_collects";
  return {
    id: String(raw.id || ""),
    sku: String(raw.sku || ""),
    nameEn: String(raw.nameEn || raw.name || ""),
    nameBn: String(raw.nameBn || ""),
    categories: cats,
    labels: String(raw.labels || ""),
    price: Number(raw.price) || 0,
    comparePrice: Number(raw.comparePrice) || 0,
    costPrice: Number(raw.costPrice) || 0,
    wholesaleMinQty: Math.max(0, Number(raw.wholesaleMinQty) || 0),
    wholesalePrice: Math.max(0, Number(raw.wholesalePrice) || 0),
    fulfillmentType,
    supplierId: String(raw.supplierId || ""),
    sourceName: String(raw.sourceName || ""),
    collectionMode,
    supplierAvailable: raw.supplierAvailable !== false,
    lowStockThreshold: Math.max(1, Number(raw.lowStockThreshold) || 5),
    stock: Number(raw.stock) || 0,
    variantsEn: String(raw.variantsEn || raw.variants || ""),
    variantsBn: String(raw.variantsBn || ""),
    colorsJson: String(raw.colorsJson || ""),
    sizesList: String(raw.sizesList || ""),
    variationMatrixJson: String(raw.variationMatrixJson || ""),
    imageUrl: String(raw.imageUrl || ""),
    galleryUrls: String(raw.galleryUrls || ""),
    descriptionEn: String(raw.descriptionEn || raw.description || ""),
    descriptionBn: String(raw.descriptionBn || ""),
    featured: Boolean(raw.featured),
    active: raw.active !== false,
    createdAt: String(raw.createdAt || ""),
  };
}

export function normalizeCouponRecord(raw: Partial<MartCoupon>): MartCoupon {
  return {
    id: String(raw.id || ""),
    code: String(raw.code || "").trim().toUpperCase(),
    discountType: raw.discountType === "fixed" ? "fixed" : "percent",
    discountValue: Math.max(0, Number(raw.discountValue) || 0),
    maxDiscount: Math.max(0, Number(raw.maxDiscount) || 0),
    minOrderAmount: Math.max(0, Number(raw.minOrderAmount) || 0),
    expiryDate: String(raw.expiryDate || ""),
    usageLimit: Math.max(0, Number(raw.usageLimit) || 0),
    usageCount: Math.max(0, Number(raw.usageCount) || 0),
    active: raw.active !== false,
    notes: String(raw.notes || ""),
    createdAt: String(raw.createdAt || ""),
  };
}

function normalizeCategoryRecord(raw: Partial<MartCategory>): MartCategory {
  const nameEn = String(raw.nameEn || raw.name || "");
  const nameBn = String(raw.nameBn || "");
  return {
    id: String(raw.id || ""),
    slug: String(raw.slug || slugifyTaxonomy(nameEn || nameBn || raw.id || "")),
    parentSlug: String(raw.parentSlug || ""),
    nameEn,
    nameBn,
    descriptionEn: String(raw.descriptionEn || raw.description || ""),
    descriptionBn: String(raw.descriptionBn || ""),
    imageUrl: String(raw.imageUrl || ""),
    sortOrder: Number(raw.sortOrder) || 0,
    active: raw.active !== false,
    createdAt: String(raw.createdAt || ""),
  };
}

function normalizeLabelRecord(raw: Partial<MartLabel>): MartLabel {
  const nameEn = String(raw.nameEn || "");
  const nameBn = String(raw.nameBn || "");
  return {
    id: String(raw.id || ""),
    slug: String(raw.slug || slugifyTaxonomy(nameEn || nameBn || raw.id || "")),
    nameEn,
    nameBn,
    descriptionEn: String(raw.descriptionEn || ""),
    descriptionBn: String(raw.descriptionBn || ""),
    tone: String(raw.tone || "emerald"),
    sortOrder: Number(raw.sortOrder) || 0,
    active: raw.active !== false,
    createdAt: String(raw.createdAt || ""),
  };
}

export function normalizeSupplierRecord(raw: Partial<MartSupplier>): MartSupplier {
  const companyType: MartSupplierType =
    raw.companyType === "wholesale" || raw.companyType === "manufacturer"
      ? raw.companyType
      : "dropship";
  const payoutMode: MartSupplierPayoutMode =
    raw.payoutMode === "supplier_pays_us" ? "supplier_pays_us" : "we_pay_supplier";
  return {
    id: String(raw.id || ""),
    name: String(raw.name || ""),
    companyType,
    contactPerson: String(raw.contactPerson || ""),
    phone: String(raw.phone || ""),
    altPhone: String(raw.altPhone || ""),
    email: String(raw.email || ""),
    address: String(raw.address || ""),
    payoutMode,
    leadTimeDays: Math.max(0, Number(raw.leadTimeDays) || 0),
    tags: String(raw.tags || ""),
    notes: String(raw.notes || ""),
    nextFollowUpDate: String(raw.nextFollowUpDate || ""),
    lastContactedAt: String(raw.lastContactedAt || ""),
    active: raw.active !== false,
    createdAt: String(raw.createdAt || ""),
  };
}

export function normalizeTransactionRecord(raw: Partial<MartTransaction>): MartTransaction {
  return {
    id: String(raw.id || ""),
    date: String(raw.date || raw.createdAt || "").slice(0, 10),
    type: (raw.type as MartTransactionType) || "operating_expense",
    category: String(raw.category || ""),
    amount: Math.max(0, Number(raw.amount) || 0),
    supplierId: String(raw.supplierId || ""),
    orderId: String(raw.orderId || ""),
    paymentAccount: String(raw.paymentAccount || "Cash"),
    referenceNo: String(raw.referenceNo || ""),
    note: String(raw.note || ""),
    createdAt: String(raw.createdAt || ""),
  };
}

export function normalizeCrmProfileRecord(raw: Partial<MartCrmProfile>): MartCrmProfile {
  return {
    id: String(raw.id || ""),
    entityType: raw.entityType === "supplier" ? "supplier" : "customer",
    entityKey: String(raw.entityKey || ""),
    name: String(raw.name || ""),
    phone: String(raw.phone || ""),
    altPhone: String(raw.altPhone || ""),
    email: String(raw.email || ""),
    address: String(raw.address || ""),
    tierOverride: (raw.tierOverride as MartCrmTier) || "auto",
    tags: String(raw.tags || ""),
    notes: String(raw.notes || ""),
    nextFollowUpDate: String(raw.nextFollowUpDate || ""),
    followUpTask: String(raw.followUpTask || ""),
    lastContactedAt: String(raw.lastContactedAt || ""),
    createdAt: String(raw.createdAt || ""),
    updatedAt: String(raw.updatedAt || ""),
  };
}

export function normalizeCrmLogRecord(raw: Partial<MartCrmLog>): MartCrmLog {
  return {
    id: String(raw.id || ""),
    entityType: raw.entityType === "supplier" ? "supplier" : "customer",
    entityKey: String(raw.entityKey || ""),
    entityName: String(raw.entityName || ""),
    channel: (raw.channel as MartCrmChannel) || "call",
    outcome: (raw.outcome as MartCrmOutcome) || "connected",
    summary: String(raw.summary || ""),
    nextFollowUpDate: String(raw.nextFollowUpDate || ""),
    relatedOrderId: String(raw.relatedOrderId || ""),
    createdAt: String(raw.createdAt || ""),
  };
}

export interface MartPublicBundle {
  products: MartProduct[];
  categories: MartCategory[];
  labels: MartLabel[];
  settings: MartSettings;
  isLiveBackend: boolean;
}

export interface MartAdminBundle extends MartPublicBundle {
  suppliers: MartSupplier[];
  coupons: MartCoupon[];
  orders: MartOrder[];
  transactions: MartTransaction[];
  crmProfiles: MartCrmProfile[];
  crmLogs: MartCrmLog[];
}

export class MartApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
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

export function parseProductColors(colorsJson?: string): MartProductColor[] {
  if (!colorsJson) return [];
  try {
    const parsed = JSON.parse(colorsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c) => c && typeof c === "object" && (c.nameEn || c.nameBn || c.hex))
      .map((c, idx) => ({
        id: String(c.id || `clr-${idx}`),
        nameEn: String(c.nameEn || c.nameBn || ""),
        nameBn: String(c.nameBn || c.nameEn || ""),
        hex: String(c.hex || "#0B5336"),
        imageUrl: String(c.imageUrl || ""),
      }));
  } catch {
    return [];
  }
}

export function parseProductSizes(sizesList?: string): string[] {
  if (!sizesList) return [];
  return sizesList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseVariationMatrix(matrixJson?: string): MartVariationVariant[] {
  if (!matrixJson) return [];
  try {
    const parsed = JSON.parse(matrixJson);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v) => v && typeof v === "object")
      .map((v) => ({
        key: String(v.key || `${v.colorNameEn || ""}::${v.size || ""}`),
        colorNameEn: String(v.colorNameEn || ""),
        size: String(v.size || ""),
        sku: String(v.sku || ""),
        priceOverride: Math.max(0, Number(v.priceOverride) || 0),
        costOverride:
          v.costOverride !== undefined && v.costOverride !== ""
            ? Math.max(0, Number(v.costOverride) || 0)
            : undefined,
        stock: Math.max(0, Number(v.stock) || 0),
        active: v.active !== false,
      }));
  } catch {
    return [];
  }
}

export function findMatchingVariant(
  matrix: MartVariationVariant[],
  colorNameEn?: string,
  size?: string
): MartVariationVariant | undefined {
  if (matrix.length === 0) return undefined;
  const cNorm = String(colorNameEn || "").trim().toLowerCase();
  const sNorm = String(size || "").trim().toLowerCase();
  return matrix.find(
    (v) =>
      v.colorNameEn.trim().toLowerCase() === cNorm &&
      v.size.trim().toLowerCase() === sNorm
  );
}

export function parseGalleryUrls(galleryUrls?: string, primaryImageUrl?: string): string[] {
  const list: string[] = [];
  const pushUnique = (u?: string) => {
    const clean = String(u || "").trim();
    if (!clean) return;
    if (!list.includes(clean)) list.push(clean);
  };
  pushUnique(primaryImageUrl);
  if (galleryUrls) {
    try {
      if (galleryUrls.trim().startsWith("[")) {
        const arr = JSON.parse(galleryUrls);
        if (Array.isArray(arr)) arr.forEach((u) => pushUnique(String(u)));
      } else {
        galleryUrls.split(/[,\n]/).forEach((u) => pushUnique(u));
      }
    } catch {
      galleryUrls.split(/[,\n]/).forEach((u) => pushUnique(u));
    }
  }
  return list;
}

export function resolveProductPricing(
  product: MartProduct,
  variant?: MartVariationVariant,
  quantity = 1
): {
  baseUnitPrice: number;
  unitPrice: number;
  comparePrice: number;
  isWholesale: boolean;
} {
  const baseUnitPrice =
    variant && variant.priceOverride > 0
      ? variant.priceOverride
      : Number(product.price) || 0;
  const minQty = Number(product.wholesaleMinQty) || 0;
  const wholesaleRate = Number(product.wholesalePrice) || 0;
  const isWholesale = minQty > 0 && wholesaleRate > 0 && quantity >= minQty;
  const unitPrice = isWholesale ? wholesaleRate : baseUnitPrice;
  const comparePrice = Number(product.comparePrice) || 0;
  return { baseUnitPrice, unitPrice, comparePrice, isWholesale };
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
  return slugifyTaxonomy(text);
}

const MART_PUBLIC_CACHE_KEY = "xeetrix_mart_public_snapshot_v4";
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
      products: parsed.products.map(normalizeProductRecord),
      categories: parsed.categories.map(normalizeCategoryRecord),
      labels: Array.isArray(parsed.labels) ? parsed.labels.map(normalizeLabelRecord) : [],
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
    throw new MartApiError("Please enter your store admin passcode.", "MISSING_FIELDS");
  }

  const res = await fetch("/api/mart/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "verifyAuth", password: clean }),
    cache: "no-store",
  });

  const json = (await res.json()) as { ok: boolean; error?: string; code?: string };
  if (!res.ok || !json.ok) {
    throw new MartApiError(
      json.error || "Invalid Mart Admin passcode.",
      res.status === 401 ? "UNAUTHORIZED" : json.code
    );
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
): Promise<{ ok: boolean; error?: string; code?: string } & T> {
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

  const json = (await res.json()) as { ok: boolean; error?: string; code?: string } & T;
  if (!res.ok || !json.ok) {
    if (res.status === 401) {
      clearStoredMartAdminPass();
      throw new MartApiError(json.error || "Unauthorized Mart Admin session.", "UNAUTHORIZED");
    }
    throw new MartApiError(json.error || `Store backend HTTP ${res.status}`, json.code);
  }

  clearMartPublicSnapshot();
  return json;
}

/**
 * Fetches live public products, categories, labels, and settings via Next.js server proxy + cache.
 * Strictly returns empty arrays (no dummy products, categories, or labels) when empty or unconfigured.
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
        products?: Partial<MartProduct>[];
        categories?: Partial<MartCategory>[];
        labels?: Partial<MartLabel>[];
        settings?: Partial<MartSettings>;
      };
    };

    if (!json.ok || !json.data) {
      throw new Error("Invalid store response");
    }

    const bundle: MartPublicBundle = {
      products: Array.isArray(json.data.products)
        ? json.data.products.map(normalizeProductRecord)
        : [],
      categories: Array.isArray(json.data.categories)
        ? json.data.categories.map(normalizeCategoryRecord)
        : [],
      labels: Array.isArray(json.data.labels)
        ? json.data.labels.map(normalizeLabelRecord)
        : [],
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
      labels: [],
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
    code?: string;
    order?: MartOrder;
  };

  if (!res.ok || !json.ok || !json.order) {
    throw new MartApiError(json.error || "Order not found.", json.code || "NOT_FOUND");
  }
  return json.order;
}

export interface MartCouponCheckResult {
  valid: boolean;
  reasonCode?: string;
  minOrderAmount?: number;
  discountAmount: number;
  coupon?: Partial<MartCoupon> | null;
}

export async function validateMartCoupon(
  code: string,
  subtotal: number
): Promise<MartCouponCheckResult> {
  const res = await fetch("/api/mart/coupon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: code.trim().toUpperCase(), subtotal }),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    ok: boolean;
    valid?: boolean;
    reasonCode?: string;
    minOrderAmount?: number;
    discountAmount?: number;
    coupon?: Partial<MartCoupon> | null;
    error?: string;
    code?: string;
  };
  if (!res.ok) {
    throw new MartApiError(json.error || "Unable to verify coupon right now.", json.code);
  }
  return {
    valid: Boolean(json.valid),
    reasonCode: json.reasonCode,
    minOrderAmount: Number(json.minOrderAmount) || 0,
    discountAmount: Math.max(0, Number(json.discountAmount) || 0),
    coupon: json.coupon || null,
  };
}

export async function placeMartOrder(payload: {
  items: MartOrderItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  deliveryArea: MartDeliveryArea;
  deliveryCharge: number;
  totalAmount: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: MartPaymentMethod;
  paymentProvider?: string;
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
    code?: string;
    id?: string;
    record?: MartOrder;
  };

  if (!res.ok || !json.ok || !json.id) {
    throw new MartApiError(
      json.error || "Failed to place order.",
      json.code || (res.status === 503 ? "BACKEND_UNCONFIGURED" : "GENERIC_NETWORK")
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
    code?: string;
    data?: {
      products?: Partial<MartProduct>[];
      categories?: Partial<MartCategory>[];
      labels?: Partial<MartLabel>[];
      suppliers?: Partial<MartSupplier>[];
      coupons?: Partial<MartCoupon>[];
      orders?: MartOrder[];
      transactions?: Partial<MartTransaction>[];
      crmProfiles?: Partial<MartCrmProfile>[];
      crmLogs?: Partial<MartCrmLog>[];
      settings?: Partial<MartSettings>;
    };
  };

  if (!res.ok || !json.ok || !json.data) {
    if (res.status === 401) {
      clearStoredMartAdminPass();
      throw new MartApiError(json.error || "Unauthorized Mart Admin session.", "UNAUTHORIZED");
    }
    throw new MartApiError(
      json.error || "Failed to load Mart Admin data from Google Sheets.",
      json.code
    );
  }

  return {
    products: Array.isArray(json.data.products)
      ? json.data.products.map(normalizeProductRecord)
      : [],
    categories: Array.isArray(json.data.categories)
      ? json.data.categories.map(normalizeCategoryRecord)
      : [],
    labels: Array.isArray(json.data.labels)
      ? json.data.labels.map(normalizeLabelRecord)
      : [],
    suppliers: Array.isArray(json.data.suppliers)
      ? json.data.suppliers.map(normalizeSupplierRecord)
      : [],
    coupons: Array.isArray(json.data.coupons)
      ? json.data.coupons.map(normalizeCouponRecord)
      : [],
    orders: Array.isArray(json.data.orders) ? json.data.orders : [],
    transactions: Array.isArray(json.data.transactions)
      ? json.data.transactions.map(normalizeTransactionRecord)
      : [],
    crmProfiles: Array.isArray(json.data.crmProfiles)
      ? json.data.crmProfiles.map(normalizeCrmProfileRecord)
      : [],
    crmLogs: Array.isArray(json.data.crmLogs)
      ? json.data.crmLogs.map(normalizeCrmLogRecord)
      : [],
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
  folderType: "products" | "categories" | "payment";
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

export interface PreparedMartImagePayload {
  base64Data: string;
  mimeType: string;
  fileName: string;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
}

/**
 * Optimizes a product photo in-browser before Drive upload:
 * - When autoSquarePad is true: fits the complete image (zero cropping) centered inside
 *   a 1000x1000 white (#FFFFFF) 1:1 square canvas encoded as crisp JPEG.
 * - When autoSquarePad is false: preserves original aspect ratio and scales oversized images
 *   down to at most 1400px on the longest edge for fast reliable Drive uploads.
 */
export async function prepareMartProductImageUpload(
  file: File,
  options?: {
    autoSquarePad?: boolean;
    targetSize?: number;
    maxOriginalEdge?: number;
    quality?: number;
  }
): Promise<PreparedMartImagePayload> {
  const autoSquarePad = options?.autoSquarePad !== false;
  const targetSize = options?.targetSize ?? 1000;
  const maxOriginalEdge = options?.maxOriginalEdge ?? 1400;
  const quality = options?.quality ?? 0.9;

  // Skip canvas transformation for vector SVGs, animated GIFs, or SSR environments
  if (
    typeof window === "undefined" ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    const base64Data = await fileToMartBase64(file);
    return {
      base64Data,
      mimeType: file.type || "image/jpeg",
      fileName: file.name,
      originalWidth: 0,
      originalHeight: 0,
      outputWidth: 0,
      outputHeight: 0,
    };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image."));
      el.src = objectUrl;
    });

    const origW = img.naturalWidth || 0;
    const origH = img.naturalHeight || 0;
    if (origW <= 0 || origH <= 0) {
      const base64Data = await fileToMartBase64(file);
      return {
        base64Data,
        mimeType: file.type || "image/jpeg",
        fileName: file.name,
        originalWidth: 0,
        originalHeight: 0,
        outputWidth: 0,
        outputHeight: 0,
      };
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      const base64Data = await fileToMartBase64(file);
      return {
        base64Data,
        mimeType: file.type || "image/jpeg",
        fileName: file.name,
        originalWidth: origW,
        originalHeight: origH,
        outputWidth: origW,
        outputHeight: origH,
      };
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    let outW: number;
    let outH: number;
    let outMime: string;
    let outFileName: string;
    const baseName = file.name.replace(/\.[^.]+$/, "") || "product-image";

    if (autoSquarePad) {
      outW = targetSize;
      outH = targetSize;
      canvas.width = outW;
      canvas.height = outH;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, outW, outH);

      const scale = Math.min(outW / origW, outH / origH);
      const drawW = Math.max(1, Math.round(origW * scale));
      const drawH = Math.max(1, Math.round(origH * scale));
      const dx = Math.round((outW - drawW) / 2);
      const dy = Math.round((outH - drawH) / 2);
      ctx.drawImage(img, dx, dy, drawW, drawH);

      outMime = "image/jpeg";
      outFileName = `${baseName}-1x1.jpg`;
    } else {
      const longest = Math.max(origW, origH);
      const scale = longest > maxOriginalEdge ? maxOriginalEdge / longest : 1;
      outW = Math.max(1, Math.round(origW * scale));
      outH = Math.max(1, Math.round(origH * scale));
      canvas.width = outW;
      canvas.height = outH;

      const preservePng = file.type === "image/png";
      if (!preservePng) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, outW, outH);
      }
      ctx.drawImage(img, 0, 0, outW, outH);

      outMime = preservePng ? "image/png" : "image/jpeg";
      outFileName = preservePng ? `${baseName}.png` : `${baseName}.jpg`;
    }

    const dataUrl =
      outMime === "image/png"
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", quality);
    const commaIdx = dataUrl.indexOf(",");
    const base64Data = commaIdx !== -1 ? dataUrl.substring(commaIdx + 1) : "";

    if (!base64Data) {
      const rawBase64 = await fileToMartBase64(file);
      return {
        base64Data: rawBase64,
        mimeType: file.type || "image/jpeg",
        fileName: file.name,
        originalWidth: origW,
        originalHeight: origH,
        outputWidth: origW,
        outputHeight: origH,
      };
    }

    return {
      base64Data,
      mimeType: outMime,
      fileName: outFileName,
      originalWidth: origW,
      originalHeight: origH,
      outputWidth: outW,
      outputHeight: outH,
    };
  } catch {
    const base64Data = await fileToMartBase64(file);
    return {
      base64Data,
      mimeType: file.type || "image/jpeg",
      fileName: file.name,
      originalWidth: 0,
      originalHeight: 0,
      outputWidth: 0,
      outputHeight: 0,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function exportMartOrdersToCsv(orders: MartOrder[], lang: MartLang = "en"): void {
  const headers = MART_DICTIONARY[lang].admin.csvHeaders;

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
