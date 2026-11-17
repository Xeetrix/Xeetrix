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

export type MartProductGender = "" | "Unisex" | "Boys" | "Girls" | "Men" | "Women";

export interface MartProductAttributes {
  gender: MartProductGender;
  ageGroup: string;
  material: string;
  brand: string;
}

export interface MartProduct {
  id: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  categories: string; // Comma-separated category slugs (Index 0 = Primary Category for SKU)
  labels: string; // Comma-separated label slugs
  tags: string; // Comma-separated smart filter/search tags
  attributesJson: string; // JSON-serialized MartProductAttributes (gender, ageGroup, material, brand)
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
  skuCode?: string;
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

export function normalizeProductRecord(raw: Partial<MartProduct>): MartProduct {
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
    tags: String(raw.tags || ""),
    attributesJson: String(raw.attributesJson || ""),
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

export const MART_GENDER_OPTIONS: {
  value: Exclude<MartProductGender, "">;
  labelEn: string;
  labelBn: string;
}[] = [
  { value: "Unisex", labelEn: "Unisex", labelBn: "ইউনিসেক্স" },
  { value: "Boys", labelEn: "Boys", labelBn: "ছেলে বাচ্চা (Boys)" },
  { value: "Girls", labelEn: "Girls", labelBn: "মেয়ে বাচ্চা (Girls)" },
  { value: "Men", labelEn: "Men", labelBn: "পুরুষ (Men)" },
  { value: "Women", labelEn: "Women", labelBn: "নারী (Women)" },
];

export function parseProductAttributes(attributesJson?: string): MartProductAttributes {
  const empty: MartProductAttributes = {
    gender: "",
    ageGroup: "",
    material: "",
    brand: "",
  };
  if (!attributesJson) return empty;
  try {
    const parsed = JSON.parse(attributesJson);
    if (!parsed || typeof parsed !== "object") return empty;
    const rawGender = String(parsed.gender || "").trim();
    const validGender: MartProductGender =
      rawGender === "Unisex" ||
      rawGender === "Boys" ||
      rawGender === "Girls" ||
      rawGender === "Men" ||
      rawGender === "Women"
        ? rawGender
        : "";
    return {
      gender: validGender,
      ageGroup: String(parsed.ageGroup || "").trim(),
      material: String(parsed.material || "").trim(),
      brand: String(parsed.brand || "").trim(),
    };
  } catch {
    return empty;
  }
}

export function serializeProductAttributes(attrs: Partial<MartProductAttributes>): string {
  const clean: MartProductAttributes = {
    gender:
      attrs.gender === "Unisex" ||
      attrs.gender === "Boys" ||
      attrs.gender === "Girls" ||
      attrs.gender === "Men" ||
      attrs.gender === "Women"
        ? attrs.gender
        : "",
    ageGroup: String(attrs.ageGroup || "").trim(),
    material: String(attrs.material || "").trim(),
    brand: String(attrs.brand || "").trim(),
  };
  if (!clean.gender && !clean.ageGroup && !clean.material && !clean.brand) {
    return "";
  }
  return JSON.stringify(clean);
}

export function parseProductTags(tagsCsv?: string): string[] {
  if (!tagsCsv) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  tagsCsv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((tag) => {
      const key = tag.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(tag);
      }
    });
  return out;
}

/**
 * Promotes `targetSlug` to index 0 of `selectedCategorySlugs` so it becomes the Primary Category for SKU generation.
 */
export function promotePrimaryCategorySlug(
  selectedCategorySlugs: string[],
  targetSlug: string
): string[] {
  const cleanTarget = targetSlug.trim();
  if (!cleanTarget) return selectedCategorySlugs;
  const rest = selectedCategorySlugs.filter((s) => s !== cleanTarget);
  return [cleanTarget, ...rest];
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
  const slug = String(raw.slug || slugifyTaxonomy(nameEn || nameBn || raw.id || ""));
  const explicitCode = sanitizeSkuCodeToken(raw.skuCode);
  return {
    id: String(raw.id || ""),
    slug,
    parentSlug: String(raw.parentSlug || ""),
    skuCode: explicitCode || deriveDefaultCategorySkuCode(nameEn, slug),
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

/**
 * Canonical 3-letter uppercase SKU codes for standard Xeetrix Mart Categories & Sub-Categories.
 */
const PRESET_CATEGORY_SKU_CODES: Record<string, string> = {
  // Fashion & Apparel
  "fashion-apparel": "FSH",
  "fashion-and-apparel": "FSH",
  fashion: "FSH",
  apparel: "APR",
  "mens-clothing": "MEN",
  "men-clothing": "MEN",
  mens: "MEN",
  "womens-clothing": "WMN",
  "women-clothing": "WMN",
  womens: "WMN",
  "baby-kids": "KID",
  "baby-and-kids": "KID",
  baby: "BBY",
  kids: "KID",
  "footwear-bags": "FTW",
  "footwear-and-bags": "FTW",
  footwear: "FTW",
  bags: "BAG",
  // Electronics & Gadgets
  "electronics-gadgets": "ELC",
  "electronics-and-gadgets": "ELC",
  electronics: "ELC",
  gadgets: "GDG",
  "audio-headphones": "AUD",
  "audio-and-headphones": "AUD",
  audio: "AUD",
  headphones: "HDP",
  "smart-wearables": "WCH",
  wearables: "WCH",
  watches: "WCH",
  "mobile-accessories": "MOB",
  mobile: "MOB",
  // Home, Kitchen & Lifestyle
  "home-living": "HOM",
  "home-and-living": "HOM",
  "home-decor": "DEC",
  decor: "DEC",
  "kitchen-dining": "KTC",
  "kitchen-and-dining": "KTC",
  kitchen: "KTC",
  // Essentials, Health & Sports
  "groceries-daily-essentials": "GRC",
  "groceries-and-daily-essentials": "GRC",
  groceries: "GRC",
  "health-beauty": "HLT",
  "health-and-beauty": "HLT",
  beauty: "BTY",
  "sports-outdoors": "SPT",
  "sports-and-outdoors": "SPT",
  sports: "SPT",
};

const PRESET_COLOR_SKU_CODES: Record<string, string> = {
  black: "BLK",
  "jet black": "BLK",
  "matte black": "MBK",
  white: "WHT",
  "off white": "OWH",
  navy: "NVY",
  "navy blue": "NVB",
  "sky blue": "SKY",
  "royal blue": "RBL",
  blue: "BLU",
  red: "RED",
  crimson: "CRM",
  maroon: "MRN",
  burgundy: "BRG",
  green: "GRN",
  "olive green": "OLV",
  olive: "OLV",
  emerald: "EMR",
  mint: "MNT",
  teal: "TEL",
  yellow: "YLW",
  mustard: "MST",
  gold: "GLD",
  golden: "GLD",
  silver: "SLV",
  pink: "PNK",
  "baby pink": "BPK",
  "rose gold": "RSG",
  rose: "RSE",
  purple: "PRP",
  lavender: "LAV",
  violet: "VLT",
  orange: "ORG",
  coral: "CRL",
  brown: "BRN",
  chocolate: "CHC",
  coffee: "CFE",
  camel: "CML",
  tan: "TAN",
  beige: "BGE",
  cream: "CRM",
  khaki: "KHK",
  gray: "GRY",
  grey: "GRY",
  charcoal: "CHR",
  ash: "ASH",
  multicolor: "MLT",
  multi: "MLT",
};

export function sanitizeSkuCodeToken(raw?: string): string {
  if (!raw) return "";
  return String(raw)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3);
}

/**
 * Derives a clean, deterministic 3-letter uppercase SKU code from a category name or slug.
 * If `existingCodes` is provided, avoids collisions by testing alternate 3-letter combinations.
 */
export function deriveDefaultCategorySkuCode(
  nameEn?: string,
  slug?: string,
  existingCodes?: Iterable<string>
): string {
  const usedSet = existingCodes
    ? new Set(Array.from(existingCodes, (c) => String(c || "").toUpperCase()))
    : null;
  const normSlug = slugifyTaxonomy(slug || nameEn || "");
  if (normSlug && PRESET_CATEGORY_SKU_CODES[normSlug]) {
    const preset = PRESET_CATEGORY_SKU_CODES[normSlug];
    if (!usedSet || !usedSet.has(preset)) {
      return preset;
    }
  }

  const cleanText = String(nameEn || slug || "")
    .toUpperCase()
    .replace(/&/g, " ")
    .replace(/[^A-Z0-9\s]/g, " ")
    .trim();

  const words = cleanText
    .split(/\s+/)
    .filter((w) => w && !["AND", "THE", "FOR", "WITH", "OF", "IN"].includes(w));

  // Check if first word matches preset
  if (words.length > 0) {
    const firstWordLower = words[0].toLowerCase();
    if (PRESET_CATEGORY_SKU_CODES[firstWordLower]) {
      const preset = PRESET_CATEGORY_SKU_CODES[firstWordLower];
      if (!usedSet || !usedSet.has(preset)) {
        return preset;
      }
    }
  }

  const candidates: string[] = [];
  const pushCandidate = (c: string) => {
    const clean = sanitizeSkuCodeToken(c);
    if (clean.length === 3 && !candidates.includes(clean)) {
      candidates.push(clean);
    }
  };

  if (words.length > 0) {
    const primary = words[0];
    const consonants = primary[0] + primary.slice(1).replace(/[AEIOU]/g, "");
    if (consonants.length >= 3) {
      pushCandidate(consonants.slice(0, 3));
    }
    if (primary.length >= 3) {
      pushCandidate(primary.slice(0, 3));
    }
    if (words.length >= 2) {
      const w1 = words[0];
      const w2 = words[1];
      pushCandidate(w1.slice(0, 2) + w2.slice(0, 1));
      pushCandidate(w1.slice(0, 1) + w2.slice(0, 2));
    }
    if (words.length >= 3) {
      pushCandidate(words[0][0] + words[1][0] + words[2][0]);
    }
  }

  const allLetters = words.join("");
  if (allLetters.length >= 3) {
    pushCandidate(allLetters.slice(0, 3));
    for (let i = 1; i < allLetters.length - 1; i++) {
      for (let j = i + 1; j < allLetters.length; j++) {
        pushCandidate(allLetters[0] + allLetters[i] + allLetters[j]);
      }
    }
  } else if (allLetters.length > 0) {
    pushCandidate(allLetters.padEnd(3, "X"));
  }

  for (const cand of candidates) {
    if (!usedSet || !usedSet.has(cand)) {
      return cand;
    }
  }

  const base2 = (candidates[0] || "CAT").slice(0, 2);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  for (let i = 0; i < alphabet.length; i++) {
    const fallback = `${base2}${alphabet[i]}`;
    if (!usedSet || !usedSet.has(fallback)) {
      return fallback;
    }
  }

  return candidates[0] || "GEN";
}

export function resolveCategorySkuCode(cat?: Partial<MartCategory> | null): string {
  if (!cat) return "GEN";
  const explicit = sanitizeSkuCodeToken(cat.skuCode);
  if (explicit.length === 3) return explicit;
  return deriveDefaultCategorySkuCode(cat.nameEn || cat.nameBn, cat.slug);
}

/**
 * Resolves the [CAT] and [SUB] 3-letter codes from a product's selected category slugs:
 * - Uses the first (primary) selected category.
 * - If the primary selected category is a Sub-Category (has `parentSlug`), [CAT] is the Parent's code and [SUB] is the Sub-Category's code.
 * - If the primary selected category is a Parent Category:
 *     - If a child Sub-Category under that Parent is also selected, [CAT] is Parent and [SUB] is that first matching child Sub-Category.
 *     - Otherwise, [CAT] is the Parent's code and [SUB] is "GEN" (e.g., XM-FSH-GEN-0001).
 * - If no category is selected, returns { catCode: "GEN", subCode: "GEN" }.
 */
export function resolvePrimaryCatSubSkuCodes(
  selectedCategorySlugs: string[],
  categories: MartCategory[]
): {
  catCode: string;
  subCode: string;
  catSlug: string;
  subSlug: string;
  catNameEn: string;
  subNameEn: string;
} {
  const catMap = new Map<string, MartCategory>();
  categories.forEach((c) => {
    if (c.slug) catMap.set(c.slug, c);
  });

  const validSlugs = selectedCategorySlugs
    .map((s) => s.trim())
    .filter((s) => Boolean(s && catMap.has(s)));

  if (validSlugs.length === 0) {
    return {
      catCode: "GEN",
      subCode: "GEN",
      catSlug: "",
      subSlug: "",
      catNameEn: "General",
      subNameEn: "General",
    };
  }

  const firstCat = catMap.get(validSlugs[0])!;

  // Case 1: First selected item is a Sub-Category with a valid Parent Category
  if (firstCat.parentSlug && catMap.has(firstCat.parentSlug)) {
    const parentCat = catMap.get(firstCat.parentSlug)!;
    return {
      catCode: resolveCategorySkuCode(parentCat),
      subCode: resolveCategorySkuCode(firstCat),
      catSlug: parentCat.slug,
      subSlug: firstCat.slug,
      catNameEn: parentCat.nameEn || parentCat.slug,
      subNameEn: firstCat.nameEn || firstCat.slug,
    };
  }

  // Case 2: First selected item is a Parent Category — check if one of its Sub-Categories is also selected
  const matchingChildSlug = validSlugs.find((slug) => {
    const candidate = catMap.get(slug);
    return candidate && candidate.parentSlug === firstCat.slug;
  });

  if (matchingChildSlug) {
    const childCat = catMap.get(matchingChildSlug)!;
    return {
      catCode: resolveCategorySkuCode(firstCat),
      subCode: resolveCategorySkuCode(childCat),
      catSlug: firstCat.slug,
      subSlug: childCat.slug,
      catNameEn: firstCat.nameEn || firstCat.slug,
      subNameEn: childCat.nameEn || childCat.slug,
    };
  }

  // Case 3: Only a Parent Category is selected -> [SUB] = "GEN" (e.g. XM-FSH-GEN-0001)
  return {
    catCode: resolveCategorySkuCode(firstCat),
    subCode: "GEN",
    catSlug: firstCat.slug,
    subSlug: "",
    catNameEn: firstCat.nameEn || firstCat.slug,
    subNameEn: "General (GEN)",
  };
}

/**
 * Computes the next sequential 4-digit SKU (`XM-[CAT]-[SUB]-[SERIAL]`) using the strict MAX + 1 rule.
 * Never reuses deleted serial numbers.
 */
export function computeNextSequentialSku(
  catCode: string,
  subCode: string,
  products: Array<Pick<MartProduct, "id" | "sku">>,
  excludeProductId?: string | null
): {
  sku: string;
  prefix: string;
  nextSerial: number;
  highestExistingSerial: number;
} {
  const cleanCat = sanitizeSkuCodeToken(catCode) || "GEN";
  const cleanSub = sanitizeSkuCodeToken(subCode) || "GEN";
  const prefix = `XM-${cleanCat}-${cleanSub}-`;
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const serialRegex = new RegExp(`^${escapedPrefix}(\\d+)`, "i");

  let highestExistingSerial = 0;
  const existingSkuSet = new Set<string>();

  products.forEach((p) => {
    if (excludeProductId && p.id === excludeProductId) return;
    const rawSku = String(p.sku || "").trim().toUpperCase();
    if (!rawSku) return;
    existingSkuSet.add(rawSku);

    const match = rawSku.match(serialRegex);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (Number.isFinite(parsed) && parsed > highestExistingSerial) {
        highestExistingSerial = parsed;
      }
    }
  });

  let nextSerial = highestExistingSerial + 1;
  let candidateSku = `${prefix}${String(nextSerial).padStart(4, "0")}`;
  while (existingSkuSet.has(candidateSku.toUpperCase())) {
    nextSerial += 1;
    candidateSku = `${prefix}${String(nextSerial).padStart(4, "0")}`;
  }

  return {
    sku: candidateSku,
    prefix,
    nextSerial,
    highestExistingSerial,
  };
}

export function generateProductSkuFromCategories(
  selectedCategorySlugs: string[],
  categories: MartCategory[],
  products: Array<Pick<MartProduct, "id" | "sku">>,
  excludeProductId?: string | null
): {
  sku: string;
  catCode: string;
  subCode: string;
  catNameEn: string;
  subNameEn: string;
  nextSerial: number;
  highestExistingSerial: number;
} {
  const resolved = resolvePrimaryCatSubSkuCodes(selectedCategorySlugs, categories);
  const seq = computeNextSequentialSku(
    resolved.catCode,
    resolved.subCode,
    products,
    excludeProductId
  );
  return {
    sku: seq.sku,
    catCode: resolved.catCode,
    subCode: resolved.subCode,
    catNameEn: resolved.catNameEn,
    subNameEn: resolved.subNameEn,
    nextSerial: seq.nextSerial,
    highestExistingSerial: seq.highestExistingSerial,
  };
}

/**
 * Checks if any other product in `Mart_Products` already uses `candidateSku` (case-insensitive).
 */
export function findDuplicateProductSku(
  candidateSku: string,
  products: MartProduct[],
  excludeProductId?: string | null
): MartProduct | undefined {
  const norm = String(candidateSku || "").trim().toUpperCase();
  if (!norm) return undefined;
  return products.find(
    (p) =>
      (!excludeProductId || p.id !== excludeProductId) &&
      String(p.sku || "").trim().toUpperCase() === norm
  );
}

/**
 * Derives a clean 3-letter uppercase color code (e.g. "Black" -> "BLK", "Navy Blue" -> "NVB").
 */
export function deriveColorSkuCode(colorNameEn?: string): string {
  const clean = String(colorNameEn || "").trim();
  if (!clean) return "";
  const lower = clean.toLowerCase().replace(/\s+/g, " ");
  if (PRESET_COLOR_SKU_CODES[lower]) {
    return PRESET_COLOR_SKU_CODES[lower];
  }
  const words = clean
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) {
    const w1 = words[0];
    const w2 = words[1];
    return sanitizeSkuCodeToken(w1.slice(0, 2) + w2.slice(0, 1)) || "CLR";
  }
  if (words.length === 1) {
    const w = words[0];
    const consonants = w[0] + w.slice(1).replace(/[AEIOU]/g, "");
    if (consonants.length >= 3) {
      return consonants.slice(0, 3);
    }
    return w.slice(0, 3).padEnd(3, "X");
  }
  return "CLR";
}

/**
 * Builds a structured variant sub-SKU from the base SKU, color name, and size:
 * e.g. Base "XM-FSH-MEN-0001" + Color "Black" + Size "XL" -> "XM-FSH-MEN-0001-BLK-XL"
 */
export function generateVariantSubSku(
  baseSku: string,
  colorNameEn?: string,
  size?: string
): string {
  const cleanBase = String(baseSku || "").trim().toUpperCase() || "XM-GEN-GEN-0001";
  const colorCode = colorNameEn ? deriveColorSkuCode(colorNameEn) : "";
  const sizeToken = String(size || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");

  return [cleanBase, colorCode, sizeToken].filter(Boolean).join("-");
}

function cleanProductUrlToken(text?: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generates an SEO- and marketing-friendly slug combining SKU and product name:
 * e.g. SKU "XM-KID-001" + Name "Kids Fleece Hoodie" -> "xm-kid-001-kids-fleece-hoodie"
 */
export function buildMartProductSlug(
  product: Pick<MartProduct, "id" | "sku" | "nameEn" | "nameBn">
): string {
  const skuPart = cleanProductUrlToken(product.sku);
  const namePart = cleanProductUrlToken(product.nameEn || product.nameBn);
  const idPart = cleanProductUrlToken(product.id) || encodeURIComponent(product.id || "item");

  if (skuPart && namePart) {
    if (namePart === skuPart || namePart.startsWith(`${skuPart}-`)) {
      return namePart;
    }
    return `${skuPart}-${namePart}`;
  }
  return skuPart || namePart || idPart;
}

export function buildMartProductUrl(
  product: Pick<MartProduct, "id" | "sku" | "nameEn" | "nameBn">
): string {
  return `/mart/p/${buildMartProductSlug(product)}`;
}

/**
 * Resolves a product from /mart/p/[slug] using a resilient 4-tier matching strategy:
 * 1. Exact full slug match (SKU + Name slug)
 * 2. Exact SKU or Product ID match
 * 3. SKU prefix match (so renaming a product title later never breaks existing ad campaign links)
 * 4. Exact Name slug match
 */
export function findMartProductBySlugOrSku(
  products: MartProduct[],
  rawSlug?: string
): MartProduct | undefined {
  if (!rawSlug || products.length === 0) return undefined;
  let decoded = rawSlug;
  try {
    decoded = decodeURIComponent(rawSlug);
  } catch {
    decoded = rawSlug;
  }
  const target = decoded.trim().toLowerCase();
  const targetToken = cleanProductUrlToken(decoded);
  if (!target) return undefined;

  // 1. Exact canonical slug match
  const exactSlugMatch = products.find(
    (p) => buildMartProductSlug(p).toLowerCase() === target || buildMartProductSlug(p) === targetToken
  );
  if (exactSlugMatch) return exactSlugMatch;

  // 2. Exact raw SKU, tokenized SKU, or ID match
  const exactSkuOrIdMatch = products.find((p) => {
    const rawSku = (p.sku || "").trim().toLowerCase();
    const tokenSku = cleanProductUrlToken(p.sku);
    const rawId = (p.id || "").trim().toLowerCase();
    return (
      (rawSku && (rawSku === target || tokenSku === targetToken)) ||
      (rawId && (rawId === target || cleanProductUrlToken(p.id) === targetToken))
    );
  });
  if (exactSkuOrIdMatch) return exactSkuOrIdMatch;

  // 3. SKU prefix match (e.g. /mart/p/xm-kid-001-any-title matches SKU "XM-KID-001")
  const prefixMatches = products
    .filter((p) => {
      const tokenSku = cleanProductUrlToken(p.sku);
      return Boolean(tokenSku && targetToken.startsWith(`${tokenSku}-`));
    })
    .sort((a, b) => cleanProductUrlToken(b.sku).length - cleanProductUrlToken(a.sku).length);
  if (prefixMatches.length > 0) return prefixMatches[0];

  // 4. Name slug match
  return products.find((p) => {
    const nameToken = cleanProductUrlToken(p.nameEn || p.nameBn);
    return Boolean(nameToken && (nameToken === targetToken || nameToken === target));
  });
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
