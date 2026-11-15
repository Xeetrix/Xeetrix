"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Lock,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  SlidersHorizontal,
  Users,
  LogOut,
  RefreshCw,
  Upload,
  Trash2,
  Plus,
  Pencil,
  Copy,
  Printer,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
  Star,
  X,
  Menu,
  Building2,
  Calculator,
  ChevronDown,
  ChevronUp,
  BellRing,
  Ticket,
  QrCode,
  Layers,
  ImagePlus,
} from "lucide-react";
import { MartLogo } from "./MartLogo";
import { MartLanguageSwitcher } from "./MartLanguageSwitcher";
import { useMartI18n } from "./MartI18nProvider";
import { MartSuppliersPanel } from "./admin/MartSuppliersPanel";
import { MartAccountingPanel } from "./admin/MartAccountingPanel";
import { MartCrmPanel } from "./admin/MartCrmPanel";
import { MartCouponsPanel } from "./admin/MartCouponsPanel";
import {
  clearStoredMartAdminPass,
  createMartRecord,
  DEFAULT_MART_SETTINGS,
  deleteMartRecord,
  exportMartOrdersToCsv,
  fetchMartAdminData,
  fileToMartBase64,
  getStoredMartAdminPass,
  MART_CONTACT_EMAIL,
  MART_CONTACT_PHONE,
  MartAdminBundle,
  MartApiError,
  MartCategory,
  MartCollectionMode,
  MartCoupon,
  MartCrmLog,
  MartCrmProfile,
  MartFulfillmentType,
  MartItemStatus,
  MartLabel,
  MartLabelTone,
  MartOrder,
  MartOrderStatus,
  MartProduct,
  MartProductColor,
  MartSettings,
  MartSupplier,
  MartTransaction,
  MartVariationVariant,
  normalizeMartImageUrl,
  parseGalleryUrls,
  parseOrderItems,
  parseProductColors,
  parseProductSizes,
  parseVariationMatrix,
  prepareMartProductImageUpload,
  slugifyCategory,
  updateMartRecord,
  updateMartStoreSettings,
  uploadMartImageToDrive,
  verifyMartAdminPassword,
} from "@/lib/martApi";
import {
  formatMartDate,
  formatMartDateTime,
  formatMartPrice,
  parseCsvSlugs,
  pickLocalized,
  toLocalizedDigits,
  translateMartError,
} from "@/lib/martI18n";
import { MART_ENTERPRISE_DICTIONARY } from "@/lib/martEnterpriseI18n";
import {
  buildCustomerCrmSummaries,
  buildFollowUpQueue,
  buildSupplierSummaries,
  computeAccountingSummary,
  DashboardFollowUpItem,
  getEffectiveProductStock,
  normalizePhoneKey,
  ResolvedOrderFinancials,
  resolveOrderFinancials,
} from "@/lib/martOps";

type MartAdminSection =
  | "analytics"
  | "orders"
  | "products"
  | "taxonomy"
  | "coupons"
  | "suppliers"
  | "accounts"
  | "customers"
  | "settings";

type ProductVariationMode = "none" | "simple" | "matrix";

const MART_ITEM_STATUSES: MartItemStatus[] = [
  "Pending",
  "Forwarded to Supplier",
  "Packaging",
  "Shipped",
  "Delivered",
  "Returned",
  "Cancelled",
];

const MART_SESSION_KEY = "xeetrix_mart_admin_session_v1";

const ORDER_STATUSES: MartOrderStatus[] = [
  "Pending",
  "Confirmed",
  "Packaging",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function StatusLabel({
  status,
  label,
}: {
  status: MartOrderStatus;
  label: string;
}) {
  const tone =
    status === "Delivered"
      ? "text-[#0B5336] font-semibold"
      : status === "Cancelled"
      ? "text-red-600 font-semibold"
      : status === "Pending"
      ? "text-gold-700 font-semibold"
      : "text-slate-800 font-semibold";
  return <span className={tone}>{label}</span>;
}

export function MartAdminClient() {
  const { lang, t } = useMartI18n();
  const ent = MART_ENTERPRISE_DICTIONARY[lang];
  const tsrc = ent.sourcing;
  const tord = ent.orderItems;
  const tcrm = ent.crm;
  const tvar = ent.variations;
  const tcop = ent.coupons;
  const tqr = ent.qrPayment;

  const [authenticated, setAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<MartAdminSection>("analytics");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MartAdminBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function scrollWorkspaceToTop() {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleSelectSection(section: MartAdminSection) {
    setActiveSection(section);
    setMobileNavOpen(false);
    scrollWorkspaceToTop();
  }

  // Order Filters, Expandable Item Fulfillment Panel, Edit/Delete & Printable Invoice Modal
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"All" | MartOrderStatus>("All");
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});
  const [invoiceOrder, setInvoiceOrder] = useState<MartOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<MartOrder | null>(null);
  const [orderDraft, setOrderDraft] = useState({
    customerName: "",
    phone: "",
    deliveryArea: "Inside Dhaka",
    deliveryCharge: "0",
    discountCode: "",
    discountAmount: "0",
    address: "",
    paymentMethod: "Cash on Delivery",
    paymentProvider: "",
    transactionId: "",
    notes: "",
  });
  const [savingOrderDetails, setSavingOrderDetails] = useState(false);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);

  // Product Form (Add or Edit — Bilingual + Multi-Category + Labels + Variations + Gallery + Wholesale + Hybrid Sourcing)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodSku, setProdSku] = useState("");
  const [prodNameEn, setProdNameEn] = useState("");
  const [prodNameBn, setProdNameBn] = useState("");
  const [prodCategories, setProdCategories] = useState<string[]>([]);
  const [prodLabels, setProdLabels] = useState<string[]>([]);
  const [prodPrice, setProdPrice] = useState("");
  const [prodComparePrice, setProdComparePrice] = useState("");
  const [prodCostPrice, setProdCostPrice] = useState("");
  const [prodWholesaleMinQty, setProdWholesaleMinQty] = useState("");
  const [prodWholesalePrice, setProdWholesalePrice] = useState("");
  const [prodFulfillmentType, setProdFulfillmentType] =
    useState<MartFulfillmentType>("own_stock");
  const [prodSupplierId, setProdSupplierId] = useState("");
  const [prodSourceName, setProdSourceName] = useState("");
  const [prodCollectionMode, setProdCollectionMode] =
    useState<MartCollectionMode>("store_collects");
  const [prodSupplierAvailable, setProdSupplierAvailable] = useState(true);
  const [prodLowStockThreshold, setProdLowStockThreshold] = useState("5");
  const [prodStock, setProdStock] = useState("20");
  const [prodVariantsEn, setProdVariantsEn] = useState("");
  const [prodVariantsBn, setProdVariantsBn] = useState("");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodGalleryUrls, setProdGalleryUrls] = useState<string[]>([]);
  const [extraImgInput, setExtraImgInput] = useState("");
  const [uploadingGalleryImg, setUploadingGalleryImg] = useState(false);
  const [prodColors, setProdColors] = useState<MartProductColor[]>([]);
  const [prodSizesInput, setProdSizesInput] = useState("");
  const [prodMatrix, setProdMatrix] = useState<MartVariationVariant[]>([]);
  const [variationMode, setVariationMode] = useState<ProductVariationMode>("none");
  const [uploadingColorRowId, setUploadingColorRowId] = useState<string | null>(null);
  const [colorGalleryPickerIdx, setColorGalleryPickerIdx] = useState<number | null>(null);
  const [prodDescEn, setProdDescEn] = useState("");
  const [prodDescBn, setProdDescBn] = useState("");
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodActive, setProdActive] = useState(true);
  const [uploadingProdImg, setUploadingProdImg] = useState(false);
  const [autoSquarePad, setAutoSquarePad] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Category Form (Mart_Categories)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catNameEn, setCatNameEn] = useState("");
  const [catNameBn, setCatNameBn] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catParentSlug, setCatParentSlug] = useState("");
  const [catSortOrder, setCatSortOrder] = useState("0");
  const [catDescEn, setCatDescEn] = useState("");
  const [catDescBn, setCatDescBn] = useState("");
  const [catImageUrl, setCatImageUrl] = useState("");
  const [uploadingCatImg, setUploadingCatImg] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  // Label Form (Mart_Labels)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [lblNameEn, setLblNameEn] = useState("");
  const [lblNameBn, setLblNameBn] = useState("");
  const [lblSlug, setLblSlug] = useState("");
  const [lblTone, setLblTone] = useState<MartLabelTone>("emerald");
  const [lblSortOrder, setLblSortOrder] = useState("0");
  const [lblDescEn, setLblDescEn] = useState("");
  const [lblDescBn, setLblDescBn] = useState("");
  const [savingLabel, setSavingLabel] = useState(false);

  // Store Settings Form + QR Uploaders
  const [settingsForm, setSettingsForm] = useState<MartSettings>(DEFAULT_MART_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingBkashQr, setUploadingBkashQr] = useState(false);
  const [uploadingBanglaQr, setUploadingBanglaQr] = useState(false);

  // CRM Deep-Link Jump States
  const [crmJumpClientKey, setCrmJumpClientKey] = useState<string | null>(null);
  const [crmJumpSupplierId, setCrmJumpSupplierId] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (
        sessionStorage.getItem(MART_SESSION_KEY) === "authenticated" &&
        Boolean(getStoredMartAdminPass())
      ) {
        setAuthenticated(true);
      }
    } catch {
      // Ignore storage access errors
    }
    setAuthReady(true);
  }, []);

  async function loadMartDashboard() {
    setLoading(true);
    try {
      const res = await fetchMartAdminData();
      setData(res);
      setSettingsForm(res.settings);
    } catch (err) {
      const apiErr = err as MartApiError;
      if (apiErr?.code === "UNAUTHORIZED") {
        handleLogout();
        setAuthError(t.admin.sessionExpired);
      } else {
        showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadMartDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  function showNotice(type: "success" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await verifyMartAdminPassword(passwordInput);
      try {
        sessionStorage.setItem(MART_SESSION_KEY, "authenticated");
      } catch {
        // Ignore
      }
      setAuthenticated(true);
      setPasswordInput("");
    } catch (err) {
      const apiErr = err as MartApiError;
      setAuthError(
        apiErr?.code === "UNAUTHORIZED"
          ? t.admin.invalidPasscode
          : translateMartError(apiErr?.message, lang, apiErr?.code)
      );
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem(MART_SESSION_KEY);
    } catch {
      // Ignore
    }
    clearStoredMartAdminPass();
    setAuthenticated(false);
    setData(null);
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProdSku("");
    setProdNameEn("");
    setProdNameBn("");
    setProdCategories([]);
    setProdLabels([]);
    setProdPrice("");
    setProdComparePrice("");
    setProdCostPrice("");
    setProdWholesaleMinQty("");
    setProdWholesalePrice("");
    setProdFulfillmentType("own_stock");
    setProdSupplierId("");
    setProdSourceName("");
    setProdCollectionMode("store_collects");
    setProdSupplierAvailable(true);
    setProdLowStockThreshold("5");
    setProdStock("20");
    setProdVariantsEn("");
    setProdVariantsBn("");
    setProdImageUrl("");
    setProdGalleryUrls([]);
    setExtraImgInput("");
    setProdColors([]);
    setProdSizesInput("");
    setProdMatrix([]);
    setVariationMode("none");
    setUploadingColorRowId(null);
    setColorGalleryPickerIdx(null);
    setProdDescEn("");
    setProdDescBn("");
    setProdFeatured(false);
    setProdActive(true);
  }

  function startEditProduct(p: MartProduct) {
    setEditingProductId(p.id);
    setProdSku(p.sku || "");
    setProdNameEn(p.nameEn || "");
    setProdNameBn(p.nameBn || "");
    setProdCategories(parseCsvSlugs(p.categories));
    setProdLabels(parseCsvSlugs(p.labels));
    setProdPrice(String(p.price));
    setProdComparePrice(p.comparePrice ? String(p.comparePrice) : "");
    setProdCostPrice(p.costPrice ? String(p.costPrice) : "");
    setProdWholesaleMinQty(p.wholesaleMinQty > 0 ? String(p.wholesaleMinQty) : "");
    setProdWholesalePrice(p.wholesalePrice > 0 ? String(p.wholesalePrice) : "");
    setProdFulfillmentType(p.fulfillmentType === "dropship" ? "dropship" : "own_stock");
    setProdSupplierId(p.supplierId || "");
    setProdSourceName(p.sourceName || "");
    setProdCollectionMode(
      p.collectionMode === "supplier_collects" ? "supplier_collects" : "store_collects"
    );
    setProdSupplierAvailable(p.supplierAvailable !== false);
    setProdLowStockThreshold(String(p.lowStockThreshold ?? 5));
    setProdStock(String(p.stock));
    setProdVariantsEn(p.variantsEn || "");
    setProdVariantsBn(p.variantsBn || "");
    setProdImageUrl(p.imageUrl || "");
    const extraGallery = parseGalleryUrls(p.galleryUrls).filter(
      (u) => u && u !== p.imageUrl
    );
    setProdGalleryUrls(extraGallery);
    setExtraImgInput("");
    const parsedColors = parseProductColors(p.colorsJson);
    const parsedMatrix = parseVariationMatrix(p.variationMatrixJson);
    setProdColors(parsedColors);
    setProdSizesInput(p.sizesList || "");
    setProdMatrix(parsedMatrix);
    setColorGalleryPickerIdx(null);
    if (parsedColors.length > 0 || Boolean(p.sizesList) || parsedMatrix.length > 0) {
      setVariationMode("matrix");
    } else if (Boolean(p.variantsEn?.trim()) || Boolean(p.variantsBn?.trim())) {
      setVariationMode("simple");
    } else {
      setVariationMode("none");
    }
    setProdDescEn(p.descriptionEn || "");
    setProdDescBn(p.descriptionBn || "");
    setProdFeatured(Boolean(p.featured));
    setProdActive(Boolean(p.active));
    setActiveSection("products");
    scrollWorkspaceToTop();
  }

  function startDuplicateProduct(p: MartProduct) {
    startEditProduct(p);
    setEditingProductId(null);
    setProdSku(p.sku ? `${p.sku}-COPY` : "");
  }

  function toggleProdCategorySlug(slug: string) {
    setProdCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function toggleProdLabelSlug(slug: string) {
    setProdLabels((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  async function handleProductImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!data?.isLiveBackend) {
      showNotice("error", t.admin.products.errConnectBackend);
      e.target.value = "";
      return;
    }

    setUploadingProdImg(true);
    try {
      const prepared = await prepareMartProductImageUpload(file, {
        autoSquarePad,
        targetSize: 1000,
        quality: 0.9,
      });
      const uploaded = await uploadMartImageToDrive({
        fileName: prepared.fileName,
        mimeType: prepared.mimeType,
        base64Data: prepared.base64Data,
        folderType: "products",
      });
      setProdImageUrl(uploaded.url);
      const dimTag =
        prepared.outputWidth > 0 && prepared.outputHeight > 0
          ? `${prepared.outputWidth}×${prepared.outputHeight} · `
          : "";
      showNotice("success", `${t.admin.products.msgImageUploaded} (${dimTag}${uploaded.fileId})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setUploadingProdImg(false);
      e.target.value = "";
    }
  }

  async function handleGalleryImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!data?.isLiveBackend) {
      showNotice("error", t.admin.products.errConnectBackend);
      e.target.value = "";
      return;
    }

    setUploadingGalleryImg(true);
    try {
      const prepared = await prepareMartProductImageUpload(file, {
        autoSquarePad,
        targetSize: 1000,
        quality: 0.9,
      });
      const uploaded = await uploadMartImageToDrive({
        fileName: prepared.fileName,
        mimeType: prepared.mimeType,
        base64Data: prepared.base64Data,
        folderType: "products",
      });
      setProdGalleryUrls((prev) =>
        prev.includes(uploaded.url) ? prev : [...prev, uploaded.url]
      );
      const dimTag =
        prepared.outputWidth > 0 && prepared.outputHeight > 0
          ? `${prepared.outputWidth}×${prepared.outputHeight} · `
          : "";
      showNotice("success", `${t.admin.products.msgImageUploaded} (${dimTag}${uploaded.fileId})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setUploadingGalleryImg(false);
      e.target.value = "";
    }
  }

  function handleAddExtraGalleryUrl() {
    const clean = extraImgInput.trim();
    if (!clean) return;
    setProdGalleryUrls((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    setExtraImgInput("");
  }

  function handleSetPrimaryFromGallery(galleryUrl: string) {
    if (!galleryUrl) return;
    const oldPrimary = prodImageUrl.trim();
    setProdImageUrl(galleryUrl);
    setProdGalleryUrls((prev) => {
      const remaining = prev.filter((u) => u !== galleryUrl);
      if (oldPrimary && oldPrimary !== galleryUrl && !remaining.includes(oldPrimary)) {
        return [oldPrimary, ...remaining];
      }
      return remaining;
    });
  }

  async function handleColorRowImageUpload(
    colorId: string,
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!data?.isLiveBackend) {
      showNotice("error", t.admin.products.errConnectBackend);
      e.target.value = "";
      return;
    }
    setUploadingColorRowId(colorId);
    try {
      const prepared = await prepareMartProductImageUpload(file, {
        autoSquarePad,
        targetSize: 1000,
        quality: 0.9,
      });
      const uploaded = await uploadMartImageToDrive({
        fileName: `color-${prepared.fileName}`,
        mimeType: prepared.mimeType,
        base64Data: prepared.base64Data,
        folderType: "products",
      });
      setProdColors((prev) =>
        prev.map((item, i) => (i === idx ? { ...item, imageUrl: uploaded.url } : item))
      );
      setProdGalleryUrls((prev) =>
        prev.includes(uploaded.url) || prodImageUrl.trim() === uploaded.url
          ? prev
          : [...prev, uploaded.url]
      );
      const dimTag =
        prepared.outputWidth > 0 && prepared.outputHeight > 0
          ? `${prepared.outputWidth}×${prepared.outputHeight} · `
          : "";
      showNotice("success", `${t.admin.products.msgImageUploaded} (${dimTag}${uploaded.fileId})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setUploadingColorRowId(null);
      e.target.value = "";
    }
  }

  function handleColorNameEnChange(idx: number, nextNameEn: string) {
    const target = prodColors[idx];
    const oldEn = (target?.nameEn || target?.nameBn || "").trim();
    const newEn = nextNameEn.trim();
    setProdColors((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, nameEn: nextNameEn } : item))
    );
    if (oldEn && newEn && oldEn !== newEn) {
      setProdMatrix((prev) =>
        prev.map((m) =>
          m.colorNameEn.trim().toLowerCase() === oldEn.toLowerCase()
            ? {
                ...m,
                colorNameEn: newEn,
                key: `${newEn}::${m.size || ""}`,
              }
            : m
        )
      );
    }
  }

  function handleAddColorRow() {
    setProdColors((prev) => [
      ...prev,
      {
        id: `clr-${Date.now()}-${prev.length + 1}`,
        nameEn: "",
        nameBn: "",
        hex: "#0B5336",
        imageUrl: "",
      },
    ]);
  }

  function handleBuildVariationMatrix() {
    const validColors = prodColors.filter((c) => c.nameEn.trim() || c.nameBn.trim());
    const sizes = parseProductSizes(prodSizesInput);
    const existingMap = new Map<string, MartVariationVariant>();
    prodMatrix.forEach((m) => existingMap.set(m.key, m));

    const nextRows: MartVariationVariant[] = [];
    const baseSku = prodSku.trim() || "XM";

    if (validColors.length > 0 && sizes.length > 0) {
      validColors.forEach((c) => {
        const cEn = (c.nameEn || c.nameBn).trim();
        sizes.forEach((s) => {
          const key = `${cEn}::${s}`;
          const prev = existingMap.get(key);
          nextRows.push(
            prev || {
              key,
              colorNameEn: cEn,
              size: s,
              sku: `${baseSku}-${cEn.slice(0, 3).toUpperCase()}-${s.toUpperCase()}`.replace(
                /\s+/g,
                ""
              ),
              priceOverride: 0,
              costOverride: 0,
              stock: Math.max(0, Number(prodStock) || 10),
              active: true,
            }
          );
        });
      });
    } else if (validColors.length > 0) {
      validColors.forEach((c) => {
        const cEn = (c.nameEn || c.nameBn).trim();
        const key = `${cEn}::`;
        const prev = existingMap.get(key);
        nextRows.push(
          prev || {
            key,
            colorNameEn: cEn,
            size: "",
            sku: `${baseSku}-${cEn.slice(0, 4).toUpperCase()}`.replace(/\s+/g, ""),
            priceOverride: 0,
            costOverride: 0,
            stock: Math.max(0, Number(prodStock) || 10),
            active: true,
          }
        );
      });
    } else if (sizes.length > 0) {
      sizes.forEach((s) => {
        const key = `::${s}`;
        const prev = existingMap.get(key);
        nextRows.push(
          prev || {
            key,
            colorNameEn: "",
            size: s,
            sku: `${baseSku}-${s.toUpperCase()}`.replace(/\s+/g, ""),
            priceOverride: 0,
            costOverride: 0,
            stock: Math.max(0, Number(prodStock) || 10),
            active: true,
          }
        );
      });
    }

    setProdMatrix(nextRows);
  }

  async function handleQrImageUpload(
    type: "bkash" | "bangla",
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!data?.isLiveBackend) {
      showNotice("error", t.admin.products.errConnectBackend);
      e.target.value = "";
      return;
    }

    if (type === "bkash") setUploadingBkashQr(true);
    else setUploadingBanglaQr(true);

    try {
      const base64Data = await fileToMartBase64(file);
      const uploaded = await uploadMartImageToDrive({
        fileName: `${type}-qr-${file.name}`,
        mimeType: file.type || "image/png",
        base64Data,
        folderType: "payment",
      });
      setSettingsForm((prev) => ({
        ...prev,
        ...(type === "bkash"
          ? { bkashQrUrl: uploaded.url }
          : { banglaQrUrl: uploaded.url }),
      }));
      showNotice("success", `${tqr.qrUploadedMsg} (${uploaded.fileId})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      if (type === "bkash") setUploadingBkashQr(false);
      else setUploadingBanglaQr(false);
      e.target.value = "";
    }
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.isLiveBackend) {
      showNotice("error", t.admin.products.errConnectBackend);
      return;
    }
    if ((!prodNameEn.trim() && !prodNameBn.trim()) || !prodPrice) {
      showNotice("error", t.admin.products.errMissingProdFields);
      return;
    }

    const cleanColors =
      variationMode === "matrix"
        ? prodColors
            .filter((c) => c.nameEn.trim() || c.nameBn.trim())
            .map((c) => ({
              id: c.id,
              nameEn: (c.nameEn || c.nameBn).trim(),
              nameBn: (c.nameBn || c.nameEn).trim(),
              hex: c.hex || "#0B5336",
              imageUrl: (c.imageUrl || "").trim(),
            }))
        : [];

    const cleanMatrix =
      variationMode === "matrix"
        ? prodMatrix.map((v) => ({
            ...v,
            sku: v.sku.trim(),
            priceOverride: Math.max(0, Number(v.priceOverride) || 0),
            costOverride: Math.max(0, Number(v.costOverride) || 0),
            stock: Math.max(0, Number(v.stock) || 0),
          }))
        : [];

    const matrixStockTotal = cleanMatrix
      .filter((v) => v.active)
      .reduce((sum, v) => sum + v.stock, 0);

    const effectiveStock =
      prodFulfillmentType === "dropship"
        ? 0
        : variationMode === "matrix" && cleanMatrix.length > 0
        ? matrixStockTotal
        : Math.max(0, Number(prodStock) || 0);

    const effectiveVariantsEn = variationMode === "simple" ? prodVariantsEn.trim() : "";
    const effectiveVariantsBn = variationMode === "simple" ? prodVariantsBn.trim() : "";
    const effectiveSizesList = variationMode === "matrix" ? prodSizesInput.trim() : "";

    const payload = {
      sku: prodSku.trim() || `XM-${Date.now().toString().slice(-5)}`,
      nameEn: prodNameEn.trim() || prodNameBn.trim(),
      nameBn: prodNameBn.trim(),
      categories: prodCategories.join(","),
      labels: prodLabels.join(","),
      price: Math.max(0, Number(prodPrice) || 0),
      comparePrice: Math.max(0, Number(prodComparePrice) || 0),
      costPrice: Math.max(0, Number(prodCostPrice) || 0),
      wholesaleMinQty: Math.max(0, Number(prodWholesaleMinQty) || 0),
      wholesalePrice: Math.max(0, Number(prodWholesalePrice) || 0),
      fulfillmentType: prodFulfillmentType,
      supplierId: prodSupplierId.trim(),
      sourceName: prodSourceName.trim(),
      collectionMode: prodCollectionMode,
      supplierAvailable: prodFulfillmentType === "dropship" ? prodSupplierAvailable : true,
      lowStockThreshold: Math.max(0, Number(prodLowStockThreshold) || 5),
      stock: effectiveStock,
      variantsEn: effectiveVariantsEn,
      variantsBn: effectiveVariantsBn,
      colorsJson: cleanColors.length > 0 ? JSON.stringify(cleanColors) : "",
      sizesList: effectiveSizesList,
      variationMatrixJson: cleanMatrix.length > 0 ? JSON.stringify(cleanMatrix) : "",
      imageUrl: prodImageUrl.trim(),
      galleryUrls: prodGalleryUrls.filter(Boolean).join(","),
      descriptionEn: prodDescEn.trim(),
      descriptionBn: prodDescBn.trim(),
      featured: prodFeatured,
      active: prodActive,
    };

    setSavingProduct(true);
    try {
      if (editingProductId) {
        await updateMartRecord("Mart_Products", editingProductId, payload);
        setData((prev) =>
          prev
            ? {
                ...prev,
                products: prev.products.map((p) =>
                  p.id === editingProductId ? { ...p, ...payload } : p
                ),
              }
            : prev
        );
        showNotice("success", `${t.admin.products.msgSaved} (${editingProductId})`);
      } else {
        const res = await createMartRecord("Mart_Products", payload);
        setData((prev) =>
          prev
            ? {
                ...prev,
                products: [
                  { id: res.id, ...payload, createdAt: new Date().toISOString() },
                  ...prev.products,
                ],
              }
            : prev
        );
        showNotice("success", `${t.admin.products.msgCreated} (${res.id})`);
      }
      resetProductForm();
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleToggleProductField(
    p: MartProduct,
    field: "active" | "featured" | "supplierAvailable"
  ) {
    if (!data?.isLiveBackend) return;
    const currentVal = field === "supplierAvailable" ? p.supplierAvailable !== false : Boolean(p[field]);
    const nextVal = !currentVal;
    try {
      await updateMartRecord("Mart_Products", p.id, { [field]: nextVal });
      setData((prev) =>
        prev
          ? {
              ...prev,
              products: prev.products.map((item) =>
                item.id === p.id ? { ...item, [field]: nextVal } : item
              ),
            }
          : prev
      );
      showNotice("success", t.admin.products.msgFlagUpdated);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleQuickStockAdjust(p: MartProduct, delta: number) {
    if (!data?.isLiveBackend) return;
    const nextStock = Math.max(0, p.stock + delta);
    try {
      await updateMartRecord("Mart_Products", p.id, { stock: nextStock });
      setData((prev) =>
        prev
          ? {
              ...prev,
              products: prev.products.map((item) =>
                item.id === p.id ? { ...item, stock: nextStock } : item
              ),
            }
          : prev
      );
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!data?.isLiveBackend) return;
    try {
      await deleteMartRecord("Mart_Products", id);
      setData((prev) =>
        prev
          ? { ...prev, products: prev.products.filter((p) => p.id !== id) }
          : prev
      );
      if (editingProductId === id) {
        resetProductForm();
      }
      showNotice("success", `${t.admin.products.msgDeleted} (${id})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  function isOrderItemStockDeducted(orderStatus: string, itemStatus?: string): boolean {
    return orderStatus !== "Cancelled" && itemStatus !== "Cancelled" && itemStatus !== "Returned";
  }

  function applyOptimisticStockDelta(
    prevProducts: MartProduct[],
    itemDeltas: Array<{
      productId: string;
      variantSku?: string;
      colorName?: string;
      sizeName?: string;
      fulfillmentType?: string;
      delta: number;
    }>
  ): MartProduct[] {
    const activeDeltas = itemDeltas.filter(
      (d) => d.productId && d.delta !== 0 && d.fulfillmentType !== "dropship"
    );
    if (activeDeltas.length === 0) return prevProducts;

    return prevProducts.map((prod) => {
      if (prod.fulfillmentType === "dropship") return prod;
      const hits = activeDeltas.filter((d) => d.productId === prod.id);
      if (hits.length === 0) return prod;

      const matrix = parseVariationMatrix(prod.variationMatrixJson);
      if (matrix.length > 0) {
        const nextMatrix = matrix.map((cell) => ({ ...cell }));
        let anyCellHit = false;
        let fallbackScalarDelta = 0;

        hits.forEach((h) => {
          const skuNorm = String(h.variantSku || "").trim().toLowerCase();
          const cNorm = String(h.colorName || "").trim().toLowerCase();
          const sNorm = String(h.sizeName || "").trim().toLowerCase();
          const matched = nextMatrix.find(
            (cell) =>
              (skuNorm && cell.sku && cell.sku.trim().toLowerCase() === skuNorm) ||
              (cell.colorNameEn.trim().toLowerCase() === cNorm &&
                cell.size.trim().toLowerCase() === sNorm)
          );
          if (matched) {
            matched.stock = Math.max(0, matched.stock + h.delta);
            anyCellHit = true;
          } else {
            fallbackScalarDelta += h.delta;
          }
        });

        const totalMatrixStock = nextMatrix
          .filter((cell) => cell.active)
          .reduce((sum, cell) => sum + Math.max(0, Number(cell.stock) || 0), 0);

        return {
          ...prod,
          variationMatrixJson: anyCellHit ? JSON.stringify(nextMatrix) : prod.variationMatrixJson,
          stock: anyCellHit
            ? totalMatrixStock
            : Math.max(0, (Number(prod.stock) || 0) + fallbackScalarDelta),
        };
      }

      const scalarDelta = hits.reduce((s, h) => s + h.delta, 0);
      return {
        ...prod,
        stock: Math.max(0, (Number(prod.stock) || 0) + scalarDelta),
      };
    });
  }

  async function handleOrderStatusChange(orderId: string, status: MartOrderStatus) {
    if (!data?.isLiveBackend) return;
    const prevOrder = orders.find((o) => o.id === orderId);
    try {
      await updateMartRecord("Mart_Orders", orderId, { status });
      const deltas = prevOrder
        ? parseOrderItems(prevOrder.itemsJson).map((it) => {
            const wasDeducted = isOrderItemStockDeducted(prevOrder.status, it.itemStatus);
            const nextDeducted = isOrderItemStockDeducted(status, it.itemStatus);
            const qty = Math.max(1, Number(it.quantity) || 1);
            return {
              productId: it.productId,
              variantSku: it.variantSku,
              colorName: it.colorName,
              sizeName: it.sizeName,
              fulfillmentType: it.fulfillmentType,
              delta: (wasDeducted ? 1 : 0) * qty - (nextDeducted ? 1 : 0) * qty,
            };
          })
        : [];

      setData((prev) =>
        prev
          ? {
              ...prev,
              products: applyOptimisticStockDelta(prev.products, deltas),
              orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
            }
          : prev
      );
      showNotice("success", `${orderId}: ${t.orderStatuses[status]}`);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice(
        "error",
        translateMartError(apiErr?.message, lang, apiErr?.code) || t.admin.orders.errOrderUpdate
      );
    }
  }

  async function handleOrderItemUpdate(
    order: MartOrder,
    itemIndex: number,
    updates: { itemStatus?: MartItemStatus; supplierId?: string }
  ) {
    if (!data?.isLiveBackend) return;
    const rawItems = parseOrderItems(order.itemsJson);
    const prevItem = rawItems[itemIndex];
    if (!prevItem) return;

    const updatedItems = rawItems.map((it, idx) => {
      if (idx !== itemIndex) return it;
      const next = { ...it };
      if (updates.itemStatus) {
        next.itemStatus = updates.itemStatus;
      }
      if (updates.supplierId !== undefined) {
        next.supplierId = updates.supplierId;
        const sup = suppliers.find((s) => s.id === updates.supplierId);
        next.supplierName = sup ? sup.name : "";
      }
      return next;
    });

    const nextItem = updatedItems[itemIndex];
    const itemsJson = JSON.stringify(updatedItems);
    try {
      await updateMartRecord("Mart_Orders", order.id, { itemsJson });
      const wasDeducted = isOrderItemStockDeducted(order.status, prevItem.itemStatus);
      const nextDeducted = isOrderItemStockDeducted(order.status, nextItem.itemStatus);
      const qty = Math.max(1, Number(prevItem.quantity) || 1);
      const stockDelta = (wasDeducted ? 1 : 0) * qty - (nextDeducted ? 1 : 0) * qty;

      setData((prev) =>
        prev
          ? {
              ...prev,
              products:
                stockDelta !== 0
                  ? applyOptimisticStockDelta(prev.products, [
                      {
                        productId: prevItem.productId,
                        variantSku: prevItem.variantSku,
                        colorName: prevItem.colorName,
                        sizeName: prevItem.sizeName,
                        fulfillmentType: prevItem.fulfillmentType,
                        delta: stockDelta,
                      },
                    ])
                  : prev.products,
              orders: prev.orders.map((o) => (o.id === order.id ? { ...o, itemsJson } : o)),
            }
          : prev
      );
      showNotice("success", tord.statusUpdatedMsg);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice(
        "error",
        translateMartError(apiErr?.message, lang, apiErr?.code) || t.admin.orders.errOrderUpdate
      );
    }
  }

  function startEditOrder(order: MartOrder) {
    setEditingOrder(order);
    setOrderDraft({
      customerName: order.customerName || "",
      phone: order.phone || "",
      deliveryArea: order.deliveryArea || "Inside Dhaka",
      deliveryCharge: String(Number(order.deliveryCharge) || 0),
      discountCode: order.discountCode || "",
      discountAmount: String(Number(order.discountAmount) || 0),
      address: order.address || "",
      paymentMethod: order.paymentMethod || "Cash on Delivery",
      paymentProvider: order.paymentProvider || "",
      transactionId: order.transactionId || "",
      notes: order.notes || "",
    });
  }

  async function handleSaveOrderDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOrder || !data?.isLiveBackend) return;
    if (!orderDraft.customerName.trim() || !orderDraft.phone.trim() || !orderDraft.address.trim()) {
      showNotice("error", t.admin.orders.errOrderCustomerReq);
      return;
    }

    const deliveryCharge = Math.max(0, Number(orderDraft.deliveryCharge) || 0);
    const discountAmount = Math.max(0, Number(orderDraft.discountAmount) || 0);
    const totalAmount =
      Math.max(0, (Number(editingOrder.subtotal) || 0) - discountAmount) + deliveryCharge;

    const updates = {
      customerName: orderDraft.customerName.trim(),
      phone: orderDraft.phone.trim(),
      deliveryArea: orderDraft.deliveryArea.trim() || "Inside Dhaka",
      deliveryCharge,
      discountCode: orderDraft.discountCode.trim().toUpperCase(),
      discountAmount,
      totalAmount,
      address: orderDraft.address.trim(),
      paymentMethod: orderDraft.paymentMethod.trim() || "Cash on Delivery",
      paymentProvider: orderDraft.paymentProvider.trim(),
      transactionId: orderDraft.transactionId.trim(),
      notes: orderDraft.notes.trim(),
    };

    setSavingOrderDetails(true);
    try {
      await updateMartRecord("Mart_Orders", editingOrder.id, updates);
      setData((prev) =>
        prev
          ? {
              ...prev,
              orders: prev.orders.map((o) =>
                o.id === editingOrder.id ? { ...o, ...updates } : o
              ),
            }
          : prev
      );
      if (invoiceOrder?.id === editingOrder.id) {
        setInvoiceOrder({ ...invoiceOrder, ...updates });
      }
      const savedId = editingOrder.id;
      setEditingOrder(null);
      showNotice("success", `${t.admin.orders.msgOrderDetailsUpdated} (${savedId})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice(
        "error",
        translateMartError(apiErr?.message, lang, apiErr?.code) || t.admin.orders.errOrderUpdate
      );
    } finally {
      setSavingOrderDetails(false);
    }
  }

  async function handleDeleteOrder(order: MartOrder) {
    if (!data?.isLiveBackend) return;
    try {
      await deleteMartRecord("Mart_Orders", order.id);
      const deltas = parseOrderItems(order.itemsJson).map((it) => {
        const wasDeducted = isOrderItemStockDeducted(order.status, it.itemStatus);
        const qty = Math.max(1, Number(it.quantity) || 1);
        return {
          productId: it.productId,
          variantSku: it.variantSku,
          colorName: it.colorName,
          sizeName: it.sizeName,
          fulfillmentType: it.fulfillmentType,
          delta: wasDeducted ? qty : 0,
        };
      });

      setData((prev) =>
        prev
          ? {
              ...prev,
              products: applyOptimisticStockDelta(prev.products, deltas),
              orders: prev.orders.filter((o) => o.id !== order.id),
            }
          : prev
      );
      setConfirmDeleteOrderId(null);
      if (invoiceOrder?.id === order.id) setInvoiceOrder(null);
      if (editingOrder?.id === order.id) setEditingOrder(null);
      showNotice("success", `${t.admin.orders.msgOrderDeleted} (${order.id})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleClearFollowUp(item: DashboardFollowUpItem) {
    if (!data?.isLiveBackend) return;
    try {
      if (item.entityType === "supplier") {
        await updateMartRecord("Mart_Suppliers", item.entityKey, { nextFollowUpDate: "" });
        setData((prev) =>
          prev
            ? {
                ...prev,
                suppliers: (prev.suppliers || []).map((s) =>
                  s.id === item.entityKey ? { ...s, nextFollowUpDate: "" } : s
                ),
              }
            : prev
        );
      } else {
        const prof = crmProfiles.find(
          (p) =>
            p.entityType === "customer" &&
            (normalizePhoneKey(p.entityKey || p.phone) === item.entityKey ||
              p.entityKey === item.entityKey)
        );
        if (prof?.id) {
          await updateMartRecord("Mart_CRM_Profiles", prof.id, {
            nextFollowUpDate: "",
            followUpTask: "",
          });
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  crmProfiles: (prev.crmProfiles || []).map((p) =>
                    p.id === prof.id
                      ? { ...p, nextFollowUpDate: "", followUpTask: "" }
                      : p
                  ),
                }
              : prev
          );
        }
      }
      showNotice("success", tcrm.msgFollowUpCleared);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleCategoryImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!data?.isLiveBackend) {
      showNotice("error", t.admin.products.errConnectBackend);
      e.target.value = "";
      return;
    }

    setUploadingCatImg(true);
    try {
      const base64Data = await fileToMartBase64(file);
      const uploaded = await uploadMartImageToDrive({
        fileName: file.name,
        mimeType: file.type || "image/jpeg",
        base64Data,
        folderType: "categories",
      });
      setCatImageUrl(uploaded.url);
      showNotice("success", `${t.admin.taxonomy.msgCatImageUploaded} (${uploaded.fileId})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setUploadingCatImg(false);
      e.target.value = "";
    }
  }

  function replaceCsvSlugToken(csvVal: string, oldSlug: string, newSlug: string): string {
    const parts = parseCsvSlugs(csvVal);
    if (!oldSlug || !newSlug || oldSlug === newSlug) return csvVal;
    const next: string[] = [];
    parts.forEach((p) => {
      const mapped = p === oldSlug ? newSlug : p;
      if (mapped && !next.includes(mapped)) next.push(mapped);
    });
    return next.join(",");
  }

  function resetCategoryForm() {
    setEditingCategoryId(null);
    setCatNameEn("");
    setCatNameBn("");
    setCatSlug("");
    setCatParentSlug("");
    setCatSortOrder("0");
    setCatDescEn("");
    setCatDescBn("");
    setCatImageUrl("");
  }

  function startEditCategory(cat: MartCategory) {
    setEditingCategoryId(cat.id);
    setCatNameEn(cat.nameEn || "");
    setCatNameBn(cat.nameBn || "");
    setCatSlug(cat.slug || "");
    setCatParentSlug(cat.parentSlug || "");
    setCatSortOrder(String(cat.sortOrder ?? 0));
    setCatDescEn(cat.descriptionEn || "");
    setCatDescBn(cat.descriptionBn || "");
    setCatImageUrl(cat.imageUrl || "");
    setActiveSection("taxonomy");
    scrollWorkspaceToTop();
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.isLiveBackend) {
      showNotice("error", t.admin.products.errConnectBackend);
      return;
    }
    if (!catNameEn.trim() && !catNameBn.trim()) {
      showNotice("error", t.admin.taxonomy.errCatNameReq);
      return;
    }

    const baseEn = catNameEn.trim() || catNameBn.trim();
    const editingTarget = editingCategoryId
      ? categories.find((c) => c.id === editingCategoryId)
      : undefined;
    const targetSlug =
      slugifyCategory(catSlug.trim() || baseEn) || editingTarget?.slug || slugifyCategory(baseEn);

    if (categories.some((c) => c.id !== editingCategoryId && c.slug === targetSlug)) {
      showNotice("error", t.admin.taxonomy.errDuplicateSlug);
      return;
    }

    const payload = {
      nameEn: baseEn,
      nameBn: catNameBn.trim(),
      slug: targetSlug,
      parentSlug: catParentSlug === targetSlug ? "" : catParentSlug.trim(),
      descriptionEn: catDescEn.trim(),
      descriptionBn: catDescBn.trim(),
      imageUrl: catImageUrl.trim(),
      sortOrder: Number(catSortOrder) || 0,
      active: editingTarget ? editingTarget.active : true,
    };

    setSavingCategory(true);
    try {
      if (editingCategoryId && editingTarget) {
        const oldSlug = editingTarget.slug;
        await updateMartRecord("Mart_Categories", editingCategoryId, payload);
        setData((prev) =>
          prev
            ? {
                ...prev,
                categories: prev.categories
                  .map((c) => {
                    if (c.id === editingCategoryId) {
                      return { ...c, ...payload };
                    }
                    if (oldSlug && oldSlug !== targetSlug && c.parentSlug === oldSlug) {
                      return { ...c, parentSlug: targetSlug };
                    }
                    return c;
                  })
                  .sort((a, b) => a.sortOrder - b.sortOrder),
                products:
                  oldSlug && oldSlug !== targetSlug
                    ? prev.products.map((p) => ({
                        ...p,
                        categories: replaceCsvSlugToken(p.categories, oldSlug, targetSlug),
                      }))
                    : prev.products,
              }
            : prev
        );
        resetCategoryForm();
        showNotice("success", t.admin.taxonomy.msgCatUpdated);
      } else {
        const res = await createMartRecord("Mart_Categories", payload);
        setData((prev) =>
          prev
            ? {
                ...prev,
                categories: [
                  { id: res.id, ...payload, createdAt: new Date().toISOString() },
                  ...prev.categories,
                ].sort((a, b) => a.sortOrder - b.sortOrder),
              }
            : prev
        );
        resetCategoryForm();
        showNotice("success", t.admin.taxonomy.msgCatCreated);
      }
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleToggleCategory(cat: MartCategory) {
    if (!data?.isLiveBackend) return;
    const nextActive = !cat.active;
    try {
      await updateMartRecord("Mart_Categories", cat.id, { active: nextActive });
      setData((prev) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((c) =>
                c.id === cat.id ? { ...c, active: nextActive } : c
              ),
            }
          : prev
      );
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!data?.isLiveBackend) return;
    try {
      await deleteMartRecord("Mart_Categories", id);
      setData((prev) =>
        prev
          ? { ...prev, categories: prev.categories.filter((c) => c.id !== id) }
          : prev
      );
      if (editingCategoryId === id) {
        resetCategoryForm();
      }
      showNotice("success", t.admin.taxonomy.msgCatDeleted);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  function resetLabelForm() {
    setEditingLabelId(null);
    setLblNameEn("");
    setLblNameBn("");
    setLblSlug("");
    setLblTone("emerald");
    setLblSortOrder("0");
    setLblDescEn("");
    setLblDescBn("");
  }

  function startEditLabel(lbl: MartLabel) {
    setEditingLabelId(lbl.id);
    setLblNameEn(lbl.nameEn || "");
    setLblNameBn(lbl.nameBn || "");
    setLblSlug(lbl.slug || "");
    setLblTone((lbl.tone as MartLabelTone) || "emerald");
    setLblSortOrder(String(lbl.sortOrder ?? 0));
    setLblDescEn(lbl.descriptionEn || "");
    setLblDescBn(lbl.descriptionBn || "");
    setActiveSection("taxonomy");
    scrollWorkspaceToTop();
  }

  async function handleSaveLabel(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.isLiveBackend) {
      showNotice("error", t.admin.products.errConnectBackend);
      return;
    }
    if (!lblNameEn.trim() && !lblNameBn.trim()) {
      showNotice("error", t.admin.taxonomy.errLblNameReq);
      return;
    }

    const baseEn = lblNameEn.trim() || lblNameBn.trim();
    const editingTarget = editingLabelId
      ? labels.find((l) => l.id === editingLabelId)
      : undefined;
    const targetSlug =
      slugifyCategory(lblSlug.trim() || baseEn) || editingTarget?.slug || slugifyCategory(baseEn);

    if (labels.some((l) => l.id !== editingLabelId && l.slug === targetSlug)) {
      showNotice("error", t.admin.taxonomy.errDuplicateSlug);
      return;
    }

    const payload = {
      nameEn: baseEn,
      nameBn: lblNameBn.trim(),
      slug: targetSlug,
      descriptionEn: lblDescEn.trim(),
      descriptionBn: lblDescBn.trim(),
      tone: lblTone,
      sortOrder: Number(lblSortOrder) || 0,
      active: editingTarget ? editingTarget.active : true,
    };

    setSavingLabel(true);
    try {
      if (editingLabelId && editingTarget) {
        const oldSlug = editingTarget.slug;
        await updateMartRecord("Mart_Labels", editingLabelId, payload);
        setData((prev) =>
          prev
            ? {
                ...prev,
                labels: (prev.labels || [])
                  .map((l) => (l.id === editingLabelId ? { ...l, ...payload } : l))
                  .sort((a, b) => a.sortOrder - b.sortOrder),
                products:
                  oldSlug && oldSlug !== targetSlug
                    ? prev.products.map((p) => ({
                        ...p,
                        labels: replaceCsvSlugToken(p.labels, oldSlug, targetSlug),
                      }))
                    : prev.products,
              }
            : prev
        );
        resetLabelForm();
        showNotice("success", t.admin.taxonomy.msgLblUpdated);
      } else {
        const res = await createMartRecord("Mart_Labels", payload);
        setData((prev) =>
          prev
            ? {
                ...prev,
                labels: [
                  { id: res.id, ...payload, createdAt: new Date().toISOString() },
                  ...(prev.labels || []),
                ].sort((a, b) => a.sortOrder - b.sortOrder),
              }
            : prev
        );
        resetLabelForm();
        showNotice("success", t.admin.taxonomy.msgLblCreated);
      }
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSavingLabel(false);
    }
  }

  async function handleToggleLabel(lbl: MartLabel) {
    if (!data?.isLiveBackend) return;
    const nextActive = !lbl.active;
    try {
      await updateMartRecord("Mart_Labels", lbl.id, { active: nextActive });
      setData((prev) =>
        prev
          ? {
              ...prev,
              labels: (prev.labels || []).map((l) =>
                l.id === lbl.id ? { ...l, active: nextActive } : l
              ),
            }
          : prev
      );
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleDeleteLabel(id: string) {
    if (!data?.isLiveBackend) return;
    try {
      await deleteMartRecord("Mart_Labels", id);
      setData((prev) =>
        prev
          ? { ...prev, labels: (prev.labels || []).filter((l) => l.id !== id) }
          : prev
      );
      if (editingLabelId === id) {
        resetLabelForm();
      }
      showNotice("success", t.admin.taxonomy.msgLblDeleted);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.isLiveBackend) {
      showNotice("error", t.admin.products.errConnectBackend);
      return;
    }
    setSavingSettings(true);
    try {
      const updated = await updateMartStoreSettings(settingsForm);
      setSettingsForm(updated);
      setData((prev) => (prev ? { ...prev, settings: updated } : prev));
      showNotice("success", t.admin.settings.msgSaved);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSavingSettings(false);
    }
  }

  const products = useMemo(() => data?.products || [], [data]);
  const categories = useMemo(() => data?.categories || [], [data]);
  const labels = useMemo(() => data?.labels || [], [data]);
  const coupons = useMemo(() => data?.coupons || [], [data]);
  const orders = useMemo(() => data?.orders || [], [data]);
  const suppliers = useMemo(() => data?.suppliers || [], [data]);
  const transactions = useMemo(() => data?.transactions || [], [data]);
  const crmProfiles = useMemo(() => data?.crmProfiles || [], [data]);
  const crmLogs = useMemo(() => data?.crmLogs || [], [data]);

  const prodMap = useMemo(() => {
    const map = new Map<string, MartProduct>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const supMap = useMemo(() => {
    const map = new Map<string, MartSupplier>();
    suppliers.forEach((s) => map.set(s.id, s));
    return map;
  }, [suppliers]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, MartCategory>();
    categories.forEach((c) => {
      if (c.slug) map.set(c.slug, c);
    });
    return map;
  }, [categories]);

  const labelMap = useMemo(() => {
    const map = new Map<string, MartLabel>();
    labels.forEach((l) => {
      if (l.slug) map.set(l.slug, l);
    });
    return map;
  }, [labels]);

  const categoryProductCounts = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      parseCsvSlugs(p.categories).forEach((slug) => {
        map.set(slug, (map.get(slug) || 0) + 1);
      });
    });
    return map;
  }, [products]);

  const labelProductCounts = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      parseCsvSlugs(p.labels).forEach((slug) => {
        map.set(slug, (map.get(slug) || 0) + 1);
      });
    });
    return map;
  }, [products]);

  const availableGalleryPool = useMemo(() => {
    const urls = [prodImageUrl.trim(), ...prodGalleryUrls.map((u) => u.trim())].filter(Boolean);
    return Array.from(new Set(urls));
  }, [prodImageUrl, prodGalleryUrls]);

  const matrixNeedsSync = useMemo(() => {
    if (variationMode !== "matrix") return false;
    const validColors = prodColors.filter((c) => c.nameEn.trim() || c.nameBn.trim());
    const sizes = parseProductSizes(prodSizesInput);
    if (validColors.length === 0 && sizes.length === 0) return false;
    const expectedKeys = new Set<string>();
    if (validColors.length > 0 && sizes.length > 0) {
      validColors.forEach((c) => {
        const cEn = (c.nameEn || c.nameBn).trim();
        sizes.forEach((s) => expectedKeys.add(`${cEn}::${s}`));
      });
    } else if (validColors.length > 0) {
      validColors.forEach((c) => {
        const cEn = (c.nameEn || c.nameBn).trim();
        expectedKeys.add(`${cEn}::`);
      });
    } else {
      sizes.forEach((s) => expectedKeys.add(`::${s}`));
    }
    if (expectedKeys.size !== prodMatrix.length) return true;
    return prodMatrix.some((m) => !expectedKeys.has(m.key));
  }, [variationMode, prodColors, prodSizesInput, prodMatrix]);

  const supplierSummaries = useMemo(
    () =>
      buildSupplierSummaries({
        suppliers,
        products,
        orders,
        transactions,
        crmLogs,
      }),
    [suppliers, products, orders, transactions, crmLogs]
  );

  const customerSummaries = useMemo(
    () =>
      buildCustomerCrmSummaries({
        orders,
        crmProfiles,
        crmLogs,
        prodMap,
        supMap,
      }),
    [orders, crmProfiles, crmLogs, prodMap, supMap]
  );

  const customerByKeyMap = useMemo(() => {
    const map = new Map<string, (typeof customerSummaries)[number]>();
    customerSummaries.forEach((c) => map.set(c.entityKey, c));
    return map;
  }, [customerSummaries]);

  const followUpQueue = useMemo(
    () => buildFollowUpQueue(customerSummaries, supplierSummaries),
    [customerSummaries, supplierSummaries]
  );

  const accountingSummary = useMemo(
    () =>
      computeAccountingSummary({
        products,
        orders,
        suppliers,
        transactions,
        supplierSummaries,
      }),
    [products, orders, suppliers, transactions, supplierSummaries]
  );

  const resolvedOrderMap = useMemo(() => {
    const map = new Map<string, ResolvedOrderFinancials>();
    orders.forEach((o) => {
      map.set(o.id, resolveOrderFinancials(o, prodMap, supMap));
    });
    return map;
  }, [orders, prodMap, supMap]);

  const analytics = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const activeOrders = orders.filter((o) => o.status !== "Cancelled");
    const totalRevenue = activeOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
    const todaysOrders = orders.filter((o) => (o.createdAt || "").slice(0, 10) === todayKey).length;
    const pendingOrders = orders.filter(
      (o) => o.status === "Pending" || o.status === "Confirmed" || o.status === "Packaging"
    ).length;
    const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
    // Own-stock only low-stock check (never flag dropshipping products)
    const lowStockProducts = products.filter(
      (p) =>
        p.fulfillmentType !== "dropship" &&
        getEffectiveProductStock(p) <= (Number(p.lowStockThreshold) || 5)
    );

    const statusCounts: Record<MartOrderStatus, number> = {
      Pending: 0,
      Confirmed: 0,
      Packaging: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    orders.forEach((o) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status] += 1;
      }
    });

    return {
      totalRevenue,
      validOrdersCount: activeOrders.length,
      todaysOrders,
      pendingOrders,
      deliveredOrders,
      lowStockProducts,
      statusCounts,
    };
  }, [orders, products]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const statusOk = orderStatusFilter === "All" || o.status === orderStatusFilter;
      const searchOk =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.itemsSummary.toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const catNames = parseCsvSlugs(p.categories)
        .map((s) => {
          const c = categoryMap.get(s);
          return c ? `${c.nameEn} ${c.nameBn} ${c.slug}` : s;
        })
        .join(" ");
      const lblNames = parseCsvSlugs(p.labels)
        .map((s) => {
          const l = labelMap.get(s);
          return l ? `${l.nameEn} ${l.nameBn} ${l.slug}` : s;
        })
        .join(" ");
      const supName = p.supplierId ? supMap.get(p.supplierId)?.name || "" : p.sourceName || "";
      return [p.nameEn, p.nameBn, p.sku, catNames, lblNames, supName]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [products, productSearch, categoryMap, labelMap, supMap]);

  const prodUnitPriceNum = Number(prodPrice) || 0;
  const prodCostPriceNum = Number(prodCostPrice) || 0;
  const prodUnitProfit = prodUnitPriceNum - prodCostPriceNum;
  const prodMarginPct =
    prodUnitPriceNum > 0 ? Math.round((prodUnitProfit / prodUnitPriceNum) * 100) : 0;

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        {t.admin.initializing}
      </div>
    );
  }

  // Bilingual Password Gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex justify-end">
            <MartLanguageSwitcher />
          </div>

          <div className="text-center space-y-2">
            <Link href="/mart" className="inline-flex justify-center">
              <MartLogo />
            </Link>
            <h1 className="font-display text-2xl font-bold text-slate-900 pt-2">
              {t.admin.portalTitle}
            </h1>
            <p className="text-sm text-slate-600">{t.admin.portalSubtitle}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
            <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.admin.passcodeLabel}
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={t.admin.passcodePlaceholder}
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? t.admin.hidePasscodeAria : t.admin.showPasscodeAria
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary w-full py-3 text-sm disabled:opacity-60"
              >
                {authLoading ? t.admin.verifying : t.admin.unlockBtn}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link href="/mart" className="inline-flex items-center gap-1.5 hover:text-[#0B5336]">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{t.admin.backToStore}</span>
              </Link>
              <span>{t.admin.independentPortal}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  type NavItemDef = {
    id: MartAdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeCount?: number;
  };

  const pendingBadgeCount = orders.filter((o) => o.status === "Pending").length;
  const dueFollowUpsCount = followUpQueue.length;

  const navGroups: { title: string; items: NavItemDef[] }[] = [
    {
      title: t.admin.navGroups.operations,
      items: [
        { id: "analytics", label: t.admin.nav.analytics, icon: LayoutDashboard },
        {
          id: "orders",
          label: t.admin.nav.orders,
          icon: ShoppingCart,
          badgeCount: pendingBadgeCount,
        },
      ],
    },
    {
      title: t.admin.navGroups.catalog,
      items: [
        { id: "products", label: t.admin.nav.products, icon: Package },
        { id: "taxonomy", label: t.admin.nav.taxonomy, icon: Tags },
        { id: "coupons", label: t.admin.nav.coupons, icon: Ticket },
      ],
    },
    {
      title: t.admin.navGroups.financeCrm,
      items: [
        { id: "suppliers", label: t.admin.nav.suppliers, icon: Building2 },
        { id: "accounts", label: t.admin.nav.accounts, icon: Calculator },
        {
          id: "customers",
          label: t.admin.nav.customers,
          icon: Users,
          badgeCount: dueFollowUpsCount,
        },
      ],
    },
    {
      title: t.admin.navGroups.system,
      items: [{ id: "settings", label: t.admin.nav.settings, icon: SlidersHorizontal }],
    },
  ];

  const allNavItems = navGroups.flatMap((g) => g.items);
  const activeNavLabel = allNavItems.find((n) => n.id === activeSection)?.label || "";

  const sidebarFooterContent = (
    <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${
              data?.isLiveBackend ? "bg-emerald-400" : "bg-gold-400"
            }`}
          />
          <span>{t.admin.sheetStatusLabel}:</span>
        </div>
        <span
          className={`text-xs font-semibold ${
            data?.isLiveBackend ? "text-emerald-400" : "text-gold-400"
          }`}
        >
          {data?.isLiveBackend ? t.admin.connectedLive : t.admin.notConnected}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        <MartLanguageSwitcher inverted />
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/mart"
          onClick={() => setMobileNavOpen(false)}
          className="flex-1 min-h-[40px] flex items-center justify-center rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white whitespace-nowrap"
        >
          {t.admin.viewStoreBtn}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white whitespace-nowrap"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{t.admin.logoutBtn}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Stationary Fixed Full-Height Desktop Sidebar (264px) */}
      <aside className="hidden lg:flex lg:w-[264px] shrink-0 lg:h-screen lg:flex-col bg-slate-900 text-slate-200 border-r border-slate-800">
        <div className="px-5 py-4 border-b border-slate-800 shrink-0">
          <Link href="/mart" className="inline-block">
            <MartLogo inverted />
          </Link>
        </div>

        <nav
          aria-label={t.admin.breadcrumbRoot}
          className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-none"
        >
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSection(item.id)}
                    className={`w-full min-h-[42px] flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? "bg-[#0B5336] text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {typeof item.badgeCount === "number" && item.badgeCount > 0 && (
                      <span
                        className={`font-mono text-[11px] font-bold tabular-nums shrink-0 ${
                          active ? "text-gold-300" : "text-gold-400"
                        }`}
                      >
                        {toLocalizedDigits(item.badgeCount, lang)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {sidebarFooterContent}
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label={t.admin.breadcrumbRoot}
        >
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative z-10 w-[280px] max-w-[85vw] h-full bg-slate-900 text-slate-200 flex flex-col justify-between shadow-2xl border-r border-slate-800">
            <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <Link href="/mart" onClick={() => setMobileNavOpen(false)}>
                <MartLogo inverted />
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label={t.admin.closeMenuAria}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-none">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSection(item.id)}
                        className={`w-full min-h-[44px] flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          active
                            ? "bg-[#0B5336] text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {typeof item.badgeCount === "number" && item.badgeCount > 0 && (
                          <span
                            className={`font-mono text-[11px] font-bold tabular-nums shrink-0 ${
                              active ? "text-gold-300" : "text-gold-400"
                            }`}
                          >
                            {toLocalizedDigits(item.badgeCount, lang)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {sidebarFooterContent}
          </aside>
        </div>
      )}

      {/* Main Content Workspace (Scrolls independently on Desktop) */}
      <div
        ref={mainScrollRef}
        className="flex-1 min-w-0 flex flex-col lg:h-screen lg:overflow-y-auto"
      >
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label={t.admin.openMenuAria}
              className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="hidden sm:block text-xs text-slate-500 truncate">
                {t.admin.breadcrumbRoot} /{" "}
                <span className="text-slate-900 font-medium">{activeNavLabel}</span>
              </div>
              <h1 className="font-display text-base sm:text-xl font-bold text-slate-900 truncate">
                {activeNavLabel}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <MartLanguageSwitcher className="hidden lg:inline-flex" />

            <button
              type="button"
              onClick={() => exportMartOrdersToCsv(orders, lang)}
              disabled={orders.length === 0}
              aria-label={t.admin.exportCsv}
              className="btn-outline min-h-[40px] px-3 sm:px-4 py-2 text-xs gap-1.5 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.admin.exportCsv}</span>
            </button>

            <button
              type="button"
              onClick={loadMartDashboard}
              disabled={loading}
              aria-label={t.admin.refreshStore}
              className="btn-primary min-h-[40px] px-3 sm:px-4 py-2 text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {loading ? t.admin.syncing : t.admin.refreshStore}
              </span>
            </button>
          </div>
        </header>

        {toast && (
          <div className="mx-4 sm:mx-6 mt-4">
            <div
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium ${
                toast.type === "success"
                  ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {toast.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span className="break-words">{toast.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-xs underline ml-4 whitespace-nowrap shrink-0"
              >
                {t.admin.dismiss}
              </button>
            </div>
          </div>
        )}

        <main className="p-4 sm:p-6 space-y-6 sm:space-y-8 flex-1">
          {!data?.isLiveBackend && !loading && (
            <div className="rounded-xl border border-gold-200 bg-gold-50 px-4 sm:px-5 py-4 text-xs text-gold-900">
              <strong>{t.admin.setupAlertTitle}</strong> {t.admin.setupAlertBody}
            </div>
          )}

          {/* 1. DASHBOARD ANALYTICS, FINANCIAL P&L SUMMARY & CRM FOLLOW-UP QUEUE */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              {/* Row 1: Core Operations KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">
                    {t.admin.analytics.totalRevenue}
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {formatMartPrice(analytics.totalRevenue, lang)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tabular-nums">
                    {t.admin.analytics.validOrdersPrefix}{" "}
                    {toLocalizedDigits(analytics.validOrdersCount, lang)}{" "}
                    {t.admin.analytics.validOrdersSuffix}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">
                    {t.admin.analytics.todaysOrders}
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-[#0B5336] tabular-nums">
                    {toLocalizedDigits(analytics.todaysOrders, lang)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tabular-nums">
                    {toLocalizedDigits(orders.length, lang)} {t.admin.analytics.allTimeOrdersSuffix}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">
                    {t.admin.analytics.pendingActive}
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-gold-600 tabular-nums">
                    {toLocalizedDigits(analytics.pendingOrders, lang)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {t.admin.analytics.pendingActiveDesc}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">
                    {t.admin.analytics.deliveredOrders}
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {toLocalizedDigits(analytics.deliveredOrders, lang)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tabular-nums">
                    {toLocalizedDigits(products.length, lang)} {t.admin.analytics.catalogSkusSuffix}{" "}
                    · {toLocalizedDigits(categories.length, lang)}{" "}
                    {t.admin.analytics.categoriesSuffix} ·{" "}
                    {toLocalizedDigits(labels.length, lang)} {t.admin.analytics.labelsSuffix}
                  </div>
                </div>
              </div>

              {/* Row 2: Live Profit, Payables & Dropship Receivables KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveSection("accounts")}
                  className="text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#0B5336] transition-colors"
                >
                  <div className="text-xs font-medium text-slate-500">{tcrm.netProfitKpi}</div>
                  <div
                    className={`mt-1.5 font-mono text-xl font-bold tabular-nums ${
                      accountingSummary.netProfit >= 0 ? "text-[#0B5336]" : "text-red-600"
                    }`}
                  >
                    {formatMartPrice(accountingSummary.netProfit, lang)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 tabular-nums">
                    {ent.accounts.grossProfitCard}:{" "}
                    {formatMartPrice(accountingSummary.grossProfit, lang)} (
                    {toLocalizedDigits(accountingSummary.netMarginPct, lang)}%)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("suppliers")}
                  className="text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#0B5336] transition-colors"
                >
                  <div className="text-xs font-medium text-slate-500">{tcrm.payableKpi}</div>
                  <div
                    className={`mt-1.5 font-mono text-xl font-bold tabular-nums ${
                      accountingSummary.totalPayableDue > 0 ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    {formatMartPrice(accountingSummary.totalPayableDue, lang)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 tabular-nums">
                    {ent.suppliers.title.split("(")[0].trim()}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("suppliers")}
                  className="text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#0B5336] transition-colors"
                >
                  <div className="text-xs font-medium text-slate-500">{tcrm.receivableKpi}</div>
                  <div
                    className={`mt-1.5 font-mono text-xl font-bold tabular-nums ${
                      accountingSummary.totalReceivableDue > 0 ? "text-[#0B5336]" : "text-slate-900"
                    }`}
                  >
                    {formatMartPrice(accountingSummary.totalReceivableDue, lang)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 tabular-nums">
                    {ent.suppliers.payoutModes.supplier_pays_us}
                  </div>
                </button>
              </div>

              {/* Row 3: Order Pipeline, Own-Stock Alerts & CRM Follow-up Reminder Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Order Pipeline Summary */}
                <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h2 className="font-display text-base font-bold text-slate-900">
                    {t.admin.analytics.fulfillmentOverview}
                  </h2>
                  <div className="space-y-3">
                    {ORDER_STATUSES.map((status) => {
                      const count = analytics.statusCounts[status];
                      const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">
                              {t.orderStatuses[status]}
                            </span>
                            <span className="font-mono text-slate-600 tabular-nums">
                              {toLocalizedDigits(count, lang)} ({toLocalizedDigits(pct, lang)}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                status === "Delivered"
                                  ? "bg-[#0B5336]"
                                  : status === "Cancelled"
                                  ? "bg-red-500"
                                  : "bg-gold-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Own-Stock Low Stock Alerts */}
                <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-gold-600 shrink-0" />
                      <span>{t.admin.analytics.lowStockTitle}</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveSection("products")}
                      className="text-xs font-semibold text-[#0B5336] hover:underline whitespace-nowrap"
                    >
                      {t.admin.analytics.manageInventory}
                    </button>
                  </div>

                  {analytics.lowStockProducts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      {products.length === 0
                        ? t.admin.analytics.noProductsLowStock
                        : t.admin.analytics.allStockHealthy}
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {analytics.lowStockProducts.slice(0, 6).map((p) => (
                        <div
                          key={p.id}
                          className="py-2.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {pickLocalized(p.nameEn, p.nameBn, lang, p.sku)}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400">
                              {t.common.sku}: {p.sku || p.id}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`font-mono font-bold tabular-nums ${
                                p.stock === 0 ? "text-red-600" : "text-gold-700"
                              }`}
                            >
                              {toLocalizedDigits(p.stock, lang)} {t.admin.analytics.leftSuffix}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(p, 5)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold hover:bg-slate-50 whitespace-nowrap"
                            >
                              {t.admin.analytics.addFiveStock}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Today & Overdue CRM Follow-Up Queue */}
                <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-[#0B5336] shrink-0" />
                        <span>{tcrm.dashboardQueueTitle}</span>
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {tcrm.dashboardQueueSubtitle}
                      </p>
                    </div>
                  </div>

                  {followUpQueue.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      {tcrm.dashboardQueueEmpty}
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                      {followUpQueue.slice(0, 8).map((item) => (
                        <div key={item.id} className="py-2.5 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 truncate block">
                                {item.name}
                              </span>
                              <span className="font-mono text-[11px] text-slate-500">
                                {item.entityType === "customer"
                                  ? tcrm.entityCustomer
                                  : tcrm.entitySupplier}{" "}
                                · {item.phone}
                              </span>
                            </div>
                            <span
                              className={`text-[11px] font-mono font-semibold whitespace-nowrap shrink-0 ${
                                item.isOverdue
                                  ? "text-red-600"
                                  : item.isDueToday
                                  ? "text-gold-700"
                                  : "text-slate-600"
                              }`}
                            >
                              {item.nextFollowUpDate}
                            </span>
                          </div>
                          {item.task && (
                            <p className="text-[11px] text-slate-600 line-clamp-1">{item.task}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.entityType === "customer") {
                                  setCrmJumpClientKey(item.entityKey);
                                  setActiveSection("customers");
                                } else {
                                  setCrmJumpSupplierId(item.entityKey);
                                  setActiveSection("suppliers");
                                }
                              }}
                              className="text-[11px] font-semibold text-[#0B5336] hover:underline whitespace-nowrap"
                            >
                              {tcrm.openProfileBtn}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClearFollowUp(item)}
                              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 whitespace-nowrap"
                            >
                              {tcrm.markDoneBtn}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. ORDER MANAGEMENT WITH ITEM-LEVEL SOURCING, PROFIT & CRM RISK ALERTS */}
          {activeSection === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl">
                  {(["All", ...ORDER_STATUSES] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        orderStatusFilter === status
                          ? "bg-[#0B5336] text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {status === "All" ? t.admin.orders.allFilter : t.orderStatuses[status]}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder={t.admin.orders.searchPlaceholder}
                    className="input pl-10 text-xs"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {/* Mobile Orders Card List */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <div className="px-4 py-10 text-center text-xs text-slate-500">
                      {t.admin.orders.emptyOrders}
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      const parsedItems = parseOrderItems(order.itemsJson);
                      const fin = resolvedOrderMap.get(order.id);
                      const expanded = Boolean(expandedOrderIds[order.id]);
                      const clientKey =
                        normalizePhoneKey(order.phone) ||
                        order.phone.trim() ||
                        order.customerName.trim();
                      const crmSummary = customerByKeyMap.get(clientKey);
                      const clientTier = crmSummary?.effectiveTier;

                      return (
                        <div key={order.id} className="p-4 space-y-3 text-xs">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-mono text-sm font-bold text-slate-900">
                                {order.id}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {formatMartDate(order.createdAt, lang)}
                              </div>
                            </div>
                            <div className="text-right font-mono tabular-nums shrink-0">
                              <div className="text-sm font-bold text-[#0B5336]">
                                {formatMartPrice(order.totalAmount, lang)}
                              </div>
                              {(Number(order.discountAmount) || 0) > 0 && (
                                <div className="text-[11px] text-[#0B5336]">
                                  − {formatMartPrice(Number(order.discountAmount) || 0, lang)}
                                  {order.discountCode ? ` (${order.discountCode})` : ""}
                                </div>
                              )}
                              <div className="text-[11px] text-slate-400">
                                {t.admin.orders.deliveryPrefix}:{" "}
                                {formatMartPrice(order.deliveryCharge, lang)}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold text-slate-900">
                                {order.customerName}
                              </span>
                              {clientTier && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCrmJumpClientKey(clientKey);
                                    handleSelectSection("customers");
                                  }}
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border whitespace-nowrap ${
                                    clientTier === "high_risk" || clientTier === "blocked"
                                      ? "border-red-200 bg-red-50 text-red-700"
                                      : clientTier === "vip"
                                      ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                                      : "border-slate-200 bg-white text-slate-600"
                                  }`}
                                >
                                  {clientTier === "high_risk"
                                    ? tord.highRiskWarning
                                    : clientTier === "blocked"
                                    ? tord.blockedWarning
                                    : clientTier === "vip"
                                    ? tord.vipCustomerTag
                                    : tcrm.tiers[clientTier]}
                                </button>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-slate-700">
                              {order.phone}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {order.deliveryArea} · {order.address}
                            </div>
                            {order.notes && (
                              <div className="text-[11px] text-gold-700">
                                {t.admin.orders.notePrefix}: {order.notes}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            {parsedItems.length > 0 ? (
                              <ul className="space-y-0.5 text-slate-700">
                                {parsedItems.map((it, idx) => (
                                  <li key={idx}>
                                    {pickLocalized(it.nameEn || it.name, it.nameBn, lang)}
                                    {it.variant ? ` (${it.variant})` : ""}{" "}
                                    <span className="font-mono text-slate-500">
                                      × {toLocalizedDigits(it.quantity, lang)}
                                    </span>
                                    {it.isWholesale && (
                                      <span className="ml-1 text-[10px] font-semibold text-[#0B5336]">
                                        [{tvar.wholesaleCardHintPrefix}]
                                      </span>
                                    )}
                                    {it.fulfillmentType === "dropship" && (
                                      <span className="ml-1 text-[10px] font-semibold text-gold-700">
                                        [{tsrc.dropshipMode.split(" ")[0]}]
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-slate-700">{order.itemsSummary}</div>
                            )}
                            {fin && (
                              <div className="font-mono text-[11px] text-[#0B5336] font-semibold tabular-nums">
                                {tord.orderProfitLabel}: {formatMartPrice(fin.grossProfit, lang)}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                            <div className="text-[11px]">
                              <span className="font-semibold text-slate-800">
                                {order.paymentMethod}
                              </span>
                              {order.paymentProvider ? (
                                <span className="ml-1 font-semibold text-[#0B5336]">
                                  ({order.paymentProvider})
                                </span>
                              ) : null}
                              {order.transactionId && (
                                <div className="font-mono text-slate-500">
                                  {t.admin.orders.trxPrefix}: {order.transactionId}
                                </div>
                              )}
                            </div>

                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleOrderStatusChange(
                                  order.id,
                                  e.target.value as MartOrderStatus
                                )
                              }
                              aria-label={t.admin.orders.colStatus}
                              className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {t.orderStatuses[st]}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {parsedItems.length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedOrderIds((prev) => ({
                                    ...prev,
                                    [order.id]: !prev[order.id],
                                  }))
                                }
                                className="min-h-[38px] inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                              >
                                {expanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                                <span>
                                  {expanded ? tord.hidePanelBtn : tord.fulfillmentPanelBtn}
                                </span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => startEditOrder(order)}
                              className="min-h-[38px] inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>{t.admin.orders.editOrderBtn}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setInvoiceOrder(order)}
                              className="min-h-[38px] inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>{t.admin.orders.invoiceBtn}</span>
                            </button>
                            {confirmDeleteOrderId === order.id ? (
                              <div className="inline-flex items-center gap-1 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(order)}
                                  className="min-h-[38px] inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-700 whitespace-nowrap"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>{t.admin.orders.deleteOrderConfirm}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteOrderId(null)}
                                  aria-label={t.common.cancel}
                                  className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteOrderId(order.id)}
                                aria-label={t.admin.orders.deleteOrderBtn}
                                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 ml-auto"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {expanded && fin && fin.items.length > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 text-[11px]">
                                <span className="font-bold text-slate-900">
                                  {tord.itemSourceLabel}
                                </span>
                                <span className="font-mono font-bold text-[#0B5336] tabular-nums">
                                  {tord.orderSalesLabel}: {formatMartPrice(fin.validSales, lang)} ·{" "}
                                  {tord.orderCostLabel}: {formatMartPrice(fin.validCost, lang)}
                                </span>
                              </div>
                              {fin.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="font-semibold text-slate-900">
                                        {pickLocalized(item.nameEn || item.name, item.nameBn, lang)}{" "}
                                        <span className="font-mono text-slate-500">
                                          × {toLocalizedDigits(item.quantity, lang)}
                                        </span>
                                      </div>
                                      {item.variant && (
                                        <div className="text-[11px] text-slate-500">
                                          {item.variant}
                                        </div>
                                      )}
                                      <div className="text-[11px] text-slate-500">
                                        {item.resolvedFulfillmentType === "dropship"
                                          ? tsrc.dropshipMode
                                          : tsrc.ownStockMode}{" "}
                                        ·{" "}
                                        {item.resolvedCollectionMode === "supplier_collects"
                                          ? tsrc.supplierCollectsOption
                                          : tsrc.storeCollectsOption}
                                      </div>
                                    </div>
                                    <div className="text-right font-mono tabular-nums shrink-0">
                                      <div className="text-slate-600">
                                        {formatMartPrice(item.resolvedLineCost, lang)}
                                      </div>
                                      <div
                                        className={
                                          item.resolvedLineProfit >= 0
                                            ? "text-[#0B5336] font-bold"
                                            : "text-red-600 font-bold"
                                        }
                                      >
                                        {formatMartPrice(item.resolvedLineProfit, lang)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <select
                                      value={item.resolvedSupplierId}
                                      onChange={(e) =>
                                        handleOrderItemUpdate(order, idx, {
                                          supplierId: e.target.value,
                                        })
                                      }
                                      className="min-h-[38px] rounded border border-slate-200 bg-white px-2 py-1 text-[11px]"
                                    >
                                      <option value="">
                                        {item.resolvedSupplierName || tsrc.noSupplierOption}
                                      </option>
                                      {suppliers.map((sup) => (
                                        <option key={sup.id} value={sup.id}>
                                          {sup.name}
                                        </option>
                                      ))}
                                    </select>
                                    <select
                                      value={item.resolvedStatus}
                                      onChange={(e) =>
                                        handleOrderItemUpdate(order, idx, {
                                          itemStatus: e.target.value as MartItemStatus,
                                        })
                                      }
                                      className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold"
                                    >
                                      {MART_ITEM_STATUSES.map((ist) => (
                                        <option key={ist} value={ist}>
                                          {tord.itemStatuses[ist]}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Desktop Orders Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">{t.admin.orders.colOrderDate}</th>
                        <th className="px-4 py-3 font-semibold">
                          {t.admin.orders.colCustomerDelivery}
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          {t.admin.orders.colOrderedItems}
                        </th>
                        <th className="px-4 py-3 font-semibold">{t.admin.orders.colPayment}</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          {t.admin.orders.colTotal}
                        </th>
                        <th className="px-4 py-3 font-semibold">{t.admin.orders.colStatus}</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          {t.admin.orders.colInvoice}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                            {t.admin.orders.emptyOrders}
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const parsedItems = parseOrderItems(order.itemsJson);
                          const fin = resolvedOrderMap.get(order.id);
                          const expanded = Boolean(expandedOrderIds[order.id]);
                          const clientKey =
                            normalizePhoneKey(order.phone) ||
                            order.phone.trim() ||
                            order.customerName.trim();
                          const crmSummary = customerByKeyMap.get(clientKey);
                          const clientTier = crmSummary?.effectiveTier;

                          return (
                            <React.Fragment key={order.id}>
                              <tr className="hover:bg-slate-50 align-top">
                                <td className="px-4 py-3">
                                  <div className="font-mono font-bold text-slate-900">
                                    {order.id}
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    {formatMartDate(order.createdAt, lang)}
                                  </div>
                                </td>
                                <td className="px-4 py-3 max-w-xs">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-semibold text-slate-900">
                                      {order.customerName}
                                    </span>
                                    {clientTier && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCrmJumpClientKey(clientKey);
                                          setActiveSection("customers");
                                        }}
                                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border whitespace-nowrap ${
                                          clientTier === "high_risk" || clientTier === "blocked"
                                            ? "border-red-200 bg-red-50 text-red-700"
                                            : clientTier === "vip"
                                            ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                                            : "border-slate-200 bg-slate-50 text-slate-600"
                                        }`}
                                      >
                                        {clientTier === "high_risk"
                                          ? tord.highRiskWarning
                                          : clientTier === "blocked"
                                          ? tord.blockedWarning
                                          : clientTier === "vip"
                                          ? tord.vipCustomerTag
                                          : tcrm.tiers[clientTier]}
                                      </button>
                                    )}
                                  </div>
                                  <div className="font-mono text-[11px] text-slate-600">
                                    {order.phone}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {order.deliveryArea} · {order.address}
                                  </div>
                                  {order.notes && (
                                    <div className="text-[11px] text-gold-700 mt-0.5">
                                      {t.admin.orders.notePrefix}: {order.notes}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 max-w-xs">
                                  {parsedItems.length > 0 ? (
                                    <ul className="space-y-0.5 text-slate-700">
                                      {parsedItems.map((it, idx) => (
                                        <li key={idx}>
                                          {pickLocalized(it.nameEn || it.name, it.nameBn, lang)}
                                          {it.variant ? ` (${it.variant})` : ""}{" "}
                                          <span className="font-mono text-slate-500">
                                            × {toLocalizedDigits(it.quantity, lang)}
                                          </span>
                                          {it.isWholesale && (
                                            <span className="ml-1 text-[10px] font-semibold text-[#0B5336]">
                                              [{tvar.wholesaleCardHintPrefix}]
                                            </span>
                                          )}
                                          {it.fulfillmentType === "dropship" && (
                                            <span className="ml-1 text-[10px] font-semibold text-gold-700">
                                              [{tsrc.dropshipMode.split(" ")[0]}]
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-slate-700">{order.itemsSummary}</span>
                                  )}
                                  {fin && (
                                    <div className="mt-1 font-mono text-[11px] text-[#0B5336] font-semibold tabular-nums">
                                      {tord.orderProfitLabel}:{" "}
                                      {formatMartPrice(fin.grossProfit, lang)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-slate-800">
                                    {order.paymentMethod}
                                  </div>
                                  {order.paymentProvider && (
                                    <div className="text-[11px] font-semibold text-[#0B5336]">
                                      {order.paymentProvider}
                                    </div>
                                  )}
                                  {order.transactionId && (
                                    <div className="font-mono text-[11px] text-slate-500">
                                      {t.admin.orders.trxPrefix}: {order.transactionId}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right font-mono tabular-nums">
                                  <div className="font-bold text-slate-900">
                                    {formatMartPrice(order.totalAmount, lang)}
                                  </div>
                                  {(Number(order.discountAmount) || 0) > 0 && (
                                    <div className="text-[11px] text-[#0B5336]">
                                      − {formatMartPrice(Number(order.discountAmount) || 0, lang)}
                                      {order.discountCode ? ` (${order.discountCode})` : ""}
                                    </div>
                                  )}
                                  <div className="text-[11px] text-slate-400">
                                    {t.admin.orders.deliveryPrefix}:{" "}
                                    {formatMartPrice(order.deliveryCharge, lang)}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      handleOrderStatusChange(
                                        order.id,
                                        e.target.value as MartOrderStatus
                                      )
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold"
                                  >
                                    {ORDER_STATUSES.map((st) => (
                                      <option key={st} value={st}>
                                        {t.orderStatuses[st]}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                    {parsedItems.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedOrderIds((prev) => ({
                                            ...prev,
                                            [order.id]: !prev[order.id],
                                          }))
                                        }
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                                      >
                                        {expanded ? (
                                          <ChevronUp className="h-3.5 w-3.5" />
                                        ) : (
                                          <ChevronDown className="h-3.5 w-3.5" />
                                        )}
                                        <span>
                                          {expanded ? tord.hidePanelBtn : tord.fulfillmentPanelBtn}
                                        </span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => startEditOrder(order)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      <span>{t.admin.orders.editOrderBtn}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setInvoiceOrder(order)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                                    >
                                      <Printer className="h-3.5 w-3.5" />
                                      <span>{t.admin.orders.invoiceBtn}</span>
                                    </button>
                                    {confirmDeleteOrderId === order.id ? (
                                      <div className="inline-flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteOrder(order)}
                                          className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-700 whitespace-nowrap"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          <span>{t.admin.orders.deleteOrderConfirm}</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteOrderId(null)}
                                          aria-label={t.common.cancel}
                                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteOrderId(order.id)}
                                        aria-label={t.admin.orders.deleteOrderBtn}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 whitespace-nowrap"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {expanded && fin && fin.items.length > 0 && (
                                <tr className="bg-slate-50/80">
                                  <td colSpan={7} className="px-4 py-4">
                                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                        <div className="text-xs font-bold text-slate-900">
                                          {tord.itemSourceLabel}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
                                          <span>
                                            {tord.orderSalesLabel}:{" "}
                                            <strong>
                                              {formatMartPrice(fin.validSales, lang)}
                                            </strong>
                                          </span>
                                          <span>
                                            {tord.orderCostLabel}:{" "}
                                            <strong>
                                              {formatMartPrice(fin.validCost, lang)}
                                            </strong>
                                          </span>
                                          <span
                                            className={
                                              fin.grossProfit >= 0
                                                ? "text-[#0B5336] font-bold"
                                                : "text-red-600 font-bold"
                                            }
                                          >
                                            {tord.orderProfitLabel}:{" "}
                                            {formatMartPrice(fin.grossProfit, lang)}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                          <thead className="text-[11px] text-slate-500 border-b border-slate-100">
                                            <tr>
                                              <th className="py-2 pr-3 font-semibold">
                                                {t.admin.invoice.itemCol}
                                              </th>
                                              <th className="py-2 pr-3 font-semibold">
                                                {tord.supplierCol}
                                              </th>
                                              <th className="py-2 pr-3 font-semibold">
                                                {tord.collectionCol}
                                              </th>
                                              <th className="py-2 pr-3 font-semibold text-right">
                                                {tord.costProfitCol}
                                              </th>
                                              <th className="py-2 font-semibold text-right">
                                                {tord.itemStatusCol}
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {fin.items.map((item, idx) => (
                                              <tr key={idx}>
                                                <td className="py-2 pr-3">
                                                  <div className="font-semibold text-slate-900">
                                                    {pickLocalized(
                                                      item.nameEn || item.name,
                                                      item.nameBn,
                                                      lang
                                                    )}{" "}
                                                    <span className="font-mono text-slate-500">
                                                      × {toLocalizedDigits(item.quantity, lang)}
                                                    </span>
                                                  </div>
                                                  {item.variant && (
                                                    <div className="text-[11px] text-slate-500">
                                                      {item.variant}
                                                    </div>
                                                  )}
                                                </td>
                                                <td className="py-2 pr-3">
                                                  <div className="text-[11px] font-semibold text-slate-700 mb-1">
                                                    {item.resolvedFulfillmentType === "dropship"
                                                      ? tsrc.dropshipMode
                                                      : tsrc.ownStockMode}
                                                  </div>
                                                  <select
                                                    value={item.resolvedSupplierId}
                                                    onChange={(e) =>
                                                      handleOrderItemUpdate(order, idx, {
                                                        supplierId: e.target.value,
                                                      })
                                                    }
                                                    className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px]"
                                                  >
                                                    <option value="">
                                                      {item.resolvedSupplierName ||
                                                        tsrc.noSupplierOption}
                                                    </option>
                                                    {suppliers.map((sup) => (
                                                      <option key={sup.id} value={sup.id}>
                                                        {sup.name}
                                                      </option>
                                                    ))}
                                                  </select>
                                                </td>
                                                <td className="py-2 pr-3 text-[11px] text-slate-600">
                                                  {item.resolvedCollectionMode ===
                                                  "supplier_collects"
                                                    ? tsrc.supplierCollectsOption
                                                    : tsrc.storeCollectsOption}
                                                </td>
                                                <td className="py-2 pr-3 text-right font-mono tabular-nums">
                                                  <div className="text-slate-600">
                                                    {formatMartPrice(item.resolvedLineCost, lang)}
                                                  </div>
                                                  <div
                                                    className={
                                                      item.resolvedLineProfit >= 0
                                                        ? "text-[#0B5336] font-bold"
                                                        : "text-red-600 font-bold"
                                                    }
                                                  >
                                                    {formatMartPrice(item.resolvedLineProfit, lang)}
                                                  </div>
                                                </td>
                                                <td className="py-2 text-right">
                                                  <select
                                                    value={item.resolvedStatus}
                                                    onChange={(e) =>
                                                      handleOrderItemUpdate(order, idx, {
                                                        itemStatus: e.target
                                                          .value as MartItemStatus,
                                                      })
                                                    }
                                                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold"
                                                  >
                                                    {MART_ITEM_STATUSES.map((ist) => (
                                                      <option key={ist} value={ist}>
                                                        {tord.itemStatuses[ist]}
                                                      </option>
                                                    ))}
                                                  </select>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. PRODUCTS & INVENTORY MANAGEMENT (BILINGUAL + MULTI-CATEGORY + LABELS) */}
          {activeSection === "products" && (
            <div className="space-y-8">
              <div
                className={`rounded-2xl border p-4 sm:p-6 space-y-5 transition-colors ${
                  editingProductId
                    ? "border-[#0B5336] ring-2 ring-[#0B5336]/15 bg-brand-50/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                    {editingProductId ? (
                      <Pencil className="h-4 w-4 text-[#0B5336]" />
                    ) : (
                      <Plus className="h-4 w-4 text-[#0B5336]" />
                    )}
                    <span>
                      {editingProductId
                        ? `${t.admin.products.editTitle} (${editingProductId})`
                        : t.admin.products.addTitle}
                    </span>
                  </h2>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 whitespace-nowrap"
                    >
                      {t.admin.products.cancelEdit}
                    </button>
                  )}
                </div>

                {editingProductId && (
                  <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs font-medium text-[#0B5336]">
                    {t.admin.products.editingBannerHint}
                  </div>
                )}

                <form onSubmit={handleSaveProduct} className="space-y-5">
                  {/* Dual EN + BN Names + SKU + Stock / Sourcing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.admin.products.nameEnLabel}
                      </label>
                      <input
                        type="text"
                        value={prodNameEn}
                        onChange={(e) => setProdNameEn(e.target.value)}
                        placeholder={t.admin.products.nameEnPlaceholder}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.admin.products.nameBnLabel}
                      </label>
                      <input
                        type="text"
                        value={prodNameBn}
                        onChange={(e) => setProdNameBn(e.target.value)}
                        placeholder={t.admin.products.nameBnPlaceholder}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.admin.products.skuLabel}
                      </label>
                      <input
                        type="text"
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value.toUpperCase())}
                        placeholder={t.admin.products.skuPlaceholder}
                        className="input font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.admin.products.stockLabel}
                      </label>
                      {prodFulfillmentType === "dropship" ? (
                        <div className="input flex items-center text-xs font-semibold text-[#0B5336] bg-brand-50">
                          {tsrc.unlimitedLabel}
                        </div>
                      ) : variationMode === "matrix" && prodMatrix.length > 0 ? (
                        <div>
                          <div className="input flex items-center justify-between text-xs font-mono font-bold text-[#0B5336] bg-brand-50/70 tabular-nums">
                            <span>
                              {toLocalizedDigits(
                                prodMatrix
                                  .filter((v) => v.active)
                                  .reduce((s, v) => s + Math.max(0, Number(v.stock) || 0), 0),
                                lang
                              )}
                            </span>
                            <span className="font-sans font-medium text-[11px] text-slate-600">
                              Matrix
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {t.admin.products.variantStockLockedNote}
                          </p>
                        </div>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          required
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          className="input font-mono"
                        />
                      )}
                    </div>
                  </div>

                  {/* Balanced Selling & Regular Prices Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.admin.products.priceLabel}
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="1250"
                        className="input font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.admin.products.comparePriceLabel}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={prodComparePrice}
                        onChange={(e) => setProdComparePrice(e.target.value)}
                        placeholder="1550"
                        className="input font-mono"
                      />
                    </div>
                  </div>

                  {/* Sourcing Mode, Cost Price, Supplier & Billing Control */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {tsrc.sectionTitle}
                      </span>
                      {prodPrice && (
                        <span
                          className={`text-xs font-mono font-bold tabular-nums ${
                            prodUnitProfit >= 0 ? "text-[#0B5336]" : "text-red-600"
                          }`}
                        >
                          {tsrc.unitProfitLabel}: {formatMartPrice(prodUnitProfit, lang)} (
                          {toLocalizedDigits(prodMarginPct, lang)}% · {tsrc.marginPreviewLabel})
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {tsrc.fulfillmentModeLabel}
                        </label>
                        <select
                          value={prodFulfillmentType}
                          onChange={(e) =>
                            setProdFulfillmentType(e.target.value as MartFulfillmentType)
                          }
                          className="input text-xs"
                        >
                          <option value="own_stock">{tsrc.ownStockMode}</option>
                          <option value="dropship">{tsrc.dropshipMode}</option>
                        </select>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {prodFulfillmentType === "dropship"
                            ? tsrc.dropshipHint
                            : tsrc.ownStockHint}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {tsrc.costPriceLabel}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={prodCostPrice}
                          onChange={(e) => setProdCostPrice(e.target.value)}
                          placeholder="850"
                          className="input font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {tsrc.supplierLabel}
                        </label>
                        <select
                          value={prodSupplierId}
                          onChange={(e) => {
                            const id = e.target.value;
                            setProdSupplierId(id);
                            const sup = suppliers.find((s) => s.id === id);
                            if (sup) {
                              setProdCollectionMode(
                                sup.payoutMode === "supplier_pays_us"
                                  ? "supplier_collects"
                                  : "store_collects"
                              );
                            }
                          }}
                          className="input text-xs"
                        >
                          <option value="">{tsrc.noSupplierOption}</option>
                          {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {tsrc.sourceNameLabel}
                        </label>
                        <input
                          type="text"
                          value={prodSourceName}
                          onChange={(e) => setProdSourceName(e.target.value)}
                          placeholder={tsrc.sourceNamePlaceholder}
                          className="input text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {tsrc.collectionModeLabel}
                        </label>
                        <select
                          value={prodCollectionMode}
                          onChange={(e) =>
                            setProdCollectionMode(e.target.value as MartCollectionMode)
                          }
                          className="input text-xs"
                        >
                          <option value="store_collects">{tsrc.storeCollectsOption}</option>
                          <option value="supplier_collects">{tsrc.supplierCollectsOption}</option>
                        </select>
                      </div>

                      {prodFulfillmentType === "own_stock" ? (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            {tsrc.lowStockThresholdLabel}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={prodLowStockThreshold}
                            onChange={(e) => setProdLowStockThreshold(e.target.value)}
                            className="input font-mono"
                          />
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer pb-2">
                          <input
                            type="checkbox"
                            checked={prodSupplierAvailable}
                            onChange={(e) => setProdSupplierAvailable(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-[#0B5336]"
                          />
                          <span>{tsrc.supplierAvailableCheckbox}</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Multi-Category & Multi-Label Matrix */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
                    {/* Categories Multi-Select */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {t.admin.products.categoriesLabel}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {t.admin.products.categoriesHint}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSection("taxonomy")}
                          className="text-[11px] font-semibold text-[#0B5336] hover:underline whitespace-nowrap shrink-0"
                        >
                          {t.admin.products.goToTaxonomyBtn}
                        </button>
                      </div>

                      {categories.length === 0 ? (
                        <p className="text-xs text-slate-500 py-2">
                          {t.admin.products.noCategoriesHint}
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => {
                            const checked = prodCategories.includes(cat.slug);
                            const catLabel = pickLocalized(cat.nameEn, cat.nameBn, lang, cat.slug);
                            const parent = cat.parentSlug
                              ? categoryMap.get(cat.parentSlug)
                              : null;
                            return (
                              <label
                                key={cat.id}
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                  checked
                                    ? "border-[#0B5336] bg-[#0B5336] text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleProdCategorySlug(cat.slug)}
                                  className="sr-only"
                                />
                                <span>
                                  {parent
                                    ? `${pickLocalized(parent.nameEn, parent.nameBn, lang)} › ${catLabel}`
                                    : catLabel}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Labels / Collections Multi-Select */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {t.admin.products.labelsLabel}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {t.admin.products.labelsHint}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSection("taxonomy")}
                          className="text-[11px] font-semibold text-[#0B5336] hover:underline whitespace-nowrap shrink-0"
                        >
                          {t.admin.products.goToTaxonomyBtn}
                        </button>
                      </div>

                      {labels.length === 0 ? (
                        <p className="text-xs text-slate-500 py-2">
                          {t.admin.products.noLabelsHint}
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {labels.map((lbl) => {
                            const checked = prodLabels.includes(lbl.slug);
                            const lblText = pickLocalized(lbl.nameEn, lbl.nameBn, lang, lbl.slug);
                            return (
                              <label
                                key={lbl.id}
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                  checked
                                    ? "border-gold-500 bg-gold-500 text-slate-950 font-semibold"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleProdLabelSlug(lbl.slug)}
                                  className="sr-only"
                                />
                                <span>{lblText}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Primary Image & Multi-Angle Gallery Pool */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <ImagePlus className="h-3.5 w-3.5 text-[#0B5336]" />
                          <span>{tvar.mediaGallerySectionTitle}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          <span className="font-semibold text-[#0B5336]">{tvar.sizeGuideTitle}</span>
                          {" · "}
                          <span>{tvar.sizeGuideHint}</span>
                        </div>
                      </div>

                      <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 cursor-pointer shrink-0 hover:border-[#0B5336]">
                        <input
                          type="checkbox"
                          checked={autoSquarePad}
                          onChange={(e) => setAutoSquarePad(e.target.checked)}
                          className="h-3.5 w-3.5 rounded accent-[#0B5336]"
                        />
                        <span>{tvar.autoSquarePadLabel}</span>
                      </label>
                    </div>
                    {!autoSquarePad && (
                      <div className="text-[11px] text-slate-500">
                        {tvar.autoSquarePadOffHint}
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      <div className="lg:col-span-2 flex items-center gap-3">
                        <div className="h-20 w-20 rounded-xl border border-slate-200 bg-white p-1 overflow-hidden shrink-0 flex items-center justify-center">
                          {prodImageUrl.trim() ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={normalizeMartImageUrl(prodImageUrl)}
                              alt={tvar.primaryPreviewLabel}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 text-center px-1">
                              {tvar.noPrimaryImageHint}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="lg:col-span-6">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          {t.admin.products.imageUrlLabel}
                        </label>
                        <input
                          type="text"
                          value={prodImageUrl}
                          onChange={(e) => setProdImageUrl(e.target.value)}
                          placeholder="https://lh3.googleusercontent.com/d/..."
                          className="input bg-white font-mono text-xs"
                        />
                      </div>

                      <div className="lg:col-span-4 lg:self-end">
                        <label className="btn-outline bg-white w-full px-4 py-2.5 text-xs gap-2 cursor-pointer">
                          <Upload className="h-3.5 w-3.5 text-[#0B5336]" />
                          <span>
                            {uploadingProdImg
                              ? t.admin.products.uploading
                              : t.admin.products.uploadToDrive}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingProdImg}
                            onChange={handleProductImageUpload}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {tvar.galleryTitle}
                          </div>
                          <div className="text-[11px] text-slate-500">{tvar.galleryHint}</div>
                        </div>
                        <label className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap">
                          <ImagePlus className="h-3.5 w-3.5 text-[#0B5336]" />
                          <span>
                            {uploadingGalleryImg
                              ? t.admin.products.uploading
                              : tvar.uploadGalleryBtn}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingGalleryImg}
                            onChange={handleGalleryImageUpload}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={extraImgInput}
                          onChange={(e) => setExtraImgInput(e.target.value)}
                          placeholder={tvar.addImageUrlPlaceholder}
                          className="input text-xs font-mono flex-1 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddExtraGalleryUrl}
                          className="btn-outline bg-white px-4 py-2 text-xs whitespace-nowrap"
                        >
                          {tvar.addImageBtn}
                        </button>
                      </div>

                      {prodGalleryUrls.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-1">
                          {prodGalleryUrls.map((url, idx) => (
                            <div
                              key={`${url}-${idx}`}
                              className="group relative flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5"
                            >
                              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-white p-1 border border-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={normalizeMartImageUrl(url)}
                                  alt={tvar.galleryTitle}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setProdGalleryUrls((prev) =>
                                      prev.filter((_, i) => i !== idx)
                                    )
                                  }
                                  aria-label={t.common.delete}
                                  className="absolute top-0.5 right-0.5 rounded bg-slate-900/80 p-0.5 text-white hover:bg-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryFromGallery(url)}
                                className="w-full rounded px-1.5 py-0.5 text-[10px] font-semibold text-[#0B5336] bg-brand-50 hover:bg-[#0B5336] hover:text-white transition-colors whitespace-nowrap"
                              >
                                {tvar.setAsPrimaryBtn}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unified 3-Mode Variation Studio + Wholesale Bulk Tier Pricing */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                    <div className="space-y-2.5">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-[#0B5336]" />
                          <span>{tvar.modeLabel}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{tvar.sectionSubtitle}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {(
                          [
                            { id: "none", title: tvar.modeNone, hint: tvar.modeNoneHint },
                            { id: "simple", title: tvar.modeSimple, hint: tvar.modeSimpleHint },
                            { id: "matrix", title: tvar.modeMatrix, hint: tvar.modeMatrixHint },
                          ] as const
                        ).map((modeOpt) => {
                          const active = variationMode === modeOpt.id;
                          return (
                            <button
                              key={modeOpt.id}
                              type="button"
                              onClick={() => {
                                setVariationMode(modeOpt.id);
                                setColorGalleryPickerIdx(null);
                              }}
                              className={`rounded-xl border p-3 text-left transition-colors ${
                                active
                                  ? "border-[#0B5336] bg-white ring-2 ring-[#0B5336]/15"
                                  : "border-slate-200 bg-white/70 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-xs font-bold ${
                                    active ? "text-[#0B5336]" : "text-slate-800"
                                  }`}
                                >
                                  {modeOpt.title}
                                </span>
                                {active && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0B5336] shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                                {modeOpt.hint}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mode: Simple Option List */}
                    {variationMode === "simple" && (
                      <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {t.admin.products.variantsEnLabel}
                          </label>
                          <input
                            type="text"
                            value={prodVariantsEn}
                            onChange={(e) => setProdVariantsEn(e.target.value)}
                            placeholder={t.admin.products.variantsEnPlaceholder}
                            className="input bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {t.admin.products.variantsBnLabel}
                          </label>
                          <input
                            type="text"
                            value={prodVariantsBn}
                            onChange={(e) => setProdVariantsBn(e.target.value)}
                            placeholder={t.admin.products.variantsBnPlaceholder}
                            className="input bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Mode: Structured Color Swatches + Sizes + Price/Stock Matrix */}
                    {variationMode === "matrix" && (
                      <div className="space-y-4 pt-3 border-t border-slate-200">
                        {/* Color Swatches Builder with Drive Upload & Gallery Picker */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {tvar.colorsTitle}
                            </span>
                            <button
                              type="button"
                              onClick={handleAddColorRow}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0B5336] hover:bg-brand-50 whitespace-nowrap"
                            >
                              {tvar.addColorBtn}
                            </button>
                          </div>

                          {prodColors.length > 0 && (
                            <div className="space-y-2.5">
                              {prodColors.map((clr, idx) => {
                                const isUploadingColor = uploadingColorRowId === clr.id;
                                const pickerOpen = colorGalleryPickerIdx === idx;
                                return (
                                  <div
                                    key={clr.id}
                                    className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5"
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                                      {/* Live Color Image / Hex Swatch Preview */}
                                      <div className="sm:col-span-1 flex items-center gap-2">
                                        <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center bg-white p-0.5">
                                          {clr.imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                              src={normalizeMartImageUrl(clr.imageUrl)}
                                              alt={clr.nameEn || clr.nameBn || "Color"}
                                              referrerPolicy="no-referrer"
                                              className="h-full w-full object-contain"
                                            />
                                          ) : (
                                            <span
                                              className="h-5 w-5 rounded-full border border-slate-300"
                                              style={{ backgroundColor: clr.hex || "#0B5336" }}
                                            />
                                          )}
                                        </div>
                                      </div>

                                      <div className="sm:col-span-4">
                                        <input
                                          type="text"
                                          value={clr.nameEn}
                                          onChange={(e) =>
                                            handleColorNameEnChange(idx, e.target.value)
                                          }
                                          placeholder={tvar.colorNameEnPlaceholder}
                                          aria-label={tvar.colorNameEnLabel}
                                          className="input min-h-[38px] py-1.5 text-xs"
                                        />
                                      </div>

                                      <div className="sm:col-span-4">
                                        <input
                                          type="text"
                                          value={clr.nameBn}
                                          onChange={(e) =>
                                            setProdColors((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, nameBn: e.target.value } : item
                                              )
                                            )
                                          }
                                          placeholder={tvar.colorNameBnPlaceholder}
                                          aria-label={tvar.colorNameBnLabel}
                                          className="input min-h-[38px] py-1.5 text-xs"
                                        />
                                      </div>

                                      <div className="sm:col-span-2 flex items-center gap-2">
                                        <input
                                          type="color"
                                          value={clr.hex || "#0B5336"}
                                          onChange={(e) =>
                                            setProdColors((prev) =>
                                              prev.map((item, i) =>
                                                i === idx ? { ...item, hex: e.target.value } : item
                                              )
                                            )
                                          }
                                          aria-label={tvar.colorHexLabel}
                                          className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer shrink-0"
                                        />
                                        <span className="font-mono text-[11px] text-slate-400">
                                          {clr.hex || "#0B5336"}
                                        </span>
                                      </div>

                                      <div className="sm:col-span-1 text-right">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setProdColors((prev) =>
                                              prev.filter((_, i) => i !== idx)
                                            );
                                            if (colorGalleryPickerIdx === idx) {
                                              setColorGalleryPickerIdx(null);
                                            }
                                          }}
                                          aria-label={t.common.delete}
                                          className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Per-Color Dedicated Drive Upload, Gallery Picker & URL Input */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-slate-100">
                                      <input
                                        type="text"
                                        value={clr.imageUrl || ""}
                                        onChange={(e) =>
                                          setProdColors((prev) =>
                                            prev.map((item, i) =>
                                              i === idx
                                                ? { ...item, imageUrl: e.target.value }
                                                : item
                                            )
                                          )
                                        }
                                        placeholder={tvar.colorImageLabel}
                                        className="input min-h-[36px] py-1 text-xs font-mono flex-1"
                                      />

                                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                        <label className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] cursor-pointer inline-flex items-center gap-1.5 min-h-[36px] whitespace-nowrap">
                                          <Upload className="h-3.5 w-3.5 text-[#0B5336]" />
                                          <span>
                                            {isUploadingColor
                                              ? t.admin.products.uploading
                                              : tvar.uploadColorImgBtn}
                                          </span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            disabled={isUploadingColor}
                                            onChange={(e) =>
                                              handleColorRowImageUpload(clr.id, idx, e)
                                            }
                                            className="sr-only"
                                          />
                                        </label>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            setColorGalleryPickerIdx((prev) =>
                                              prev === idx ? null : idx
                                            )
                                          }
                                          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold min-h-[36px] whitespace-nowrap transition-colors ${
                                            pickerOpen
                                              ? "border-[#0B5336] bg-[#0B5336] text-white"
                                              : "border-slate-300 bg-white text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336]"
                                          }`}
                                        >
                                          {tvar.pickFromGalleryBtn}
                                        </button>

                                        {clr.imageUrl && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setProdColors((prev) =>
                                                prev.map((item, i) =>
                                                  i === idx ? { ...item, imageUrl: "" } : item
                                                )
                                              )
                                            }
                                            className="rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-red-600 min-h-[36px]"
                                            title={tvar.clearColorImgBtn}
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {pickerOpen && (
                                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                                        {availableGalleryPool.length === 0 ? (
                                          <p className="text-[11px] text-slate-500">
                                            {tvar.noGalleryPhotosHint}
                                          </p>
                                        ) : (
                                          <div className="flex flex-wrap gap-2">
                                            {availableGalleryPool.map((poolUrl, pIdx) => {
                                              const selected = clr.imageUrl === poolUrl;
                                              return (
                                                <button
                                                  key={`${poolUrl}-${pIdx}`}
                                                  type="button"
                                                  onClick={() => {
                                                    setProdColors((prev) =>
                                                      prev.map((item, i) =>
                                                        i === idx
                                                          ? { ...item, imageUrl: poolUrl }
                                                          : item
                                                      )
                                                    );
                                                    setColorGalleryPickerIdx(null);
                                                  }}
                                                  className={`h-14 w-14 rounded-lg bg-white p-1 overflow-hidden border-2 transition-all ${
                                                    selected
                                                      ? "border-[#0B5336] ring-2 ring-[#0B5336]/25"
                                                      : "border-slate-200 hover:border-[#0B5336]"
                                                  }`}
                                                >
                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                  <img
                                                    src={normalizeMartImageUrl(poolUrl)}
                                                    alt={tvar.galleryTitle}
                                                    referrerPolicy="no-referrer"
                                                    className="h-full w-full object-contain"
                                                  />
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Sizes Input + Matrix Generator */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end pt-3 border-t border-slate-200">
                          <div className="lg:col-span-7">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              {tvar.sizesLabel}
                            </label>
                            <input
                              type="text"
                              value={prodSizesInput}
                              onChange={(e) => setProdSizesInput(e.target.value)}
                              placeholder={tvar.sizesPlaceholder}
                              className="input bg-white text-xs"
                            />
                          </div>
                          <div className="lg:col-span-5 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={handleBuildVariationMatrix}
                              className="btn-outline bg-white px-3.5 py-2 text-xs whitespace-nowrap"
                            >
                              {tvar.syncMatrixBtn}
                            </button>
                            {prodMatrix.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setProdMatrix([])}
                                className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 whitespace-nowrap"
                              >
                                {tvar.clearMatrixBtn}
                              </button>
                            )}
                          </div>
                        </div>

                        {matrixNeedsSync && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                              <span>{tvar.matrixSyncNeededHint}</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleBuildVariationMatrix}
                              className="rounded-lg bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-amber-700 whitespace-nowrap"
                            >
                              {tvar.syncMatrixBtn}
                            </button>
                          </div>
                        )}

                        {/* Optional Price/Cost/Stock Variation Matrix */}
                        {prodMatrix.length > 0 && (
                          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-800">
                                {tvar.matrixTitle} ({toLocalizedDigits(prodMatrix.length, lang)})
                              </span>
                              <span className="text-[11px] text-slate-500">{tvar.matrixHint}</span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 text-slate-500">
                                  <tr>
                                    <th className="py-2 pr-2 font-semibold">{tvar.colCombination}</th>
                                    <th className="py-2 pr-2 font-semibold">{tvar.colVariantSku}</th>
                                    <th className="py-2 pr-2 font-semibold">{tvar.colPriceOverride}</th>
                                    <th className="py-2 pr-2 font-semibold">{tvar.colCostOverride}</th>
                                    <th className="py-2 pr-2 font-semibold">{tvar.colStock}</th>
                                    <th className="py-2 font-semibold text-center">{tvar.colActive}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {prodMatrix.map((row, idx) => (
                                    <tr key={row.key}>
                                      <td className="py-1.5 pr-2 font-semibold text-slate-800 whitespace-nowrap">
                                        {[row.colorNameEn, row.size].filter(Boolean).join(" / ")}
                                      </td>
                                      <td className="py-1.5 pr-2">
                                        <input
                                          type="text"
                                          value={row.sku}
                                          onChange={(e) =>
                                            setProdMatrix((prev) =>
                                              prev.map((m, i) =>
                                                i === idx ? { ...m, sku: e.target.value } : m
                                              )
                                            )
                                          }
                                          className="rounded border border-slate-200 px-2 py-1 text-xs font-mono w-28"
                                        />
                                      </td>
                                      <td className="py-1.5 pr-2">
                                        <input
                                          type="number"
                                          min={0}
                                          value={row.priceOverride || ""}
                                          onChange={(e) =>
                                            setProdMatrix((prev) =>
                                              prev.map((m, i) =>
                                                i === idx
                                                  ? { ...m, priceOverride: Math.max(0, Number(e.target.value) || 0) }
                                                  : m
                                              )
                                            )
                                          }
                                          className="rounded border border-slate-200 px-2 py-1 text-xs font-mono w-20"
                                        />
                                      </td>
                                      <td className="py-1.5 pr-2">
                                        <input
                                          type="number"
                                          min={0}
                                          value={row.costOverride || ""}
                                          onChange={(e) =>
                                            setProdMatrix((prev) =>
                                              prev.map((m, i) =>
                                                i === idx
                                                  ? { ...m, costOverride: Math.max(0, Number(e.target.value) || 0) }
                                                  : m
                                              )
                                            )
                                          }
                                          className="rounded border border-slate-200 px-2 py-1 text-xs font-mono w-20"
                                        />
                                      </td>
                                      <td className="py-1.5 pr-2">
                                        <input
                                          type="number"
                                          min={0}
                                          value={row.stock}
                                          onChange={(e) =>
                                            setProdMatrix((prev) =>
                                              prev.map((m, i) =>
                                                i === idx
                                                  ? { ...m, stock: Math.max(0, Number(e.target.value) || 0) }
                                                  : m
                                              )
                                            )
                                          }
                                          className="rounded border border-slate-200 px-2 py-1 text-xs font-mono w-20"
                                        />
                                      </td>
                                      <td className="py-1.5 text-center">
                                        <input
                                          type="checkbox"
                                          checked={row.active}
                                          onChange={(e) =>
                                            setProdMatrix((prev) =>
                                              prev.map((m, i) =>
                                                i === idx ? { ...m, active: e.target.checked } : m
                                              )
                                            )
                                          }
                                          className="h-4 w-4 rounded border-slate-300 text-[#0B5336]"
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Wholesale / Bulk Tier Pricing (Applies across standard & variant products) */}
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-800">
                        {tvar.wholesaleTitle}
                      </div>
                      <p className="text-[11px] text-slate-500">{tvar.wholesaleHint}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            {tvar.wholesaleMinQtyLabel}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={prodWholesaleMinQty}
                            onChange={(e) => setProdWholesaleMinQty(e.target.value)}
                            placeholder="10"
                            className="input bg-white font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            {tvar.wholesalePriceLabel}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={prodWholesalePrice}
                            onChange={(e) => setProdWholesalePrice(e.target.value)}
                            placeholder="980"
                            className="input bg-white font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dual EN + BN Descriptions */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.admin.products.descEnLabel}
                      </label>
                      <textarea
                        rows={2}
                        value={prodDescEn}
                        onChange={(e) => setProdDescEn(e.target.value)}
                        placeholder={t.admin.products.descEnPlaceholder}
                        className="input min-h-[76px] py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.admin.products.descBnLabel}
                      </label>
                      <textarea
                        rows={2}
                        value={prodDescBn}
                        onChange={(e) => setProdDescBn(e.target.value)}
                        placeholder={t.admin.products.descBnPlaceholder}
                        className="input min-h-[76px] py-2"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-6 text-xs font-medium text-slate-700">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prodActive}
                          onChange={(e) => setProdActive(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0B5336]"
                        />
                        <span>{t.admin.products.visibleCheckbox}</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prodFeatured}
                          onChange={(e) => setProdFeatured(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0B5336]"
                        />
                        <span>{t.admin.products.featuredCheckbox}</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProduct}
                      className="btn-primary px-6 py-2.5 text-xs"
                    >
                      {savingProduct
                        ? t.admin.products.savingProduct
                        : editingProductId
                        ? t.admin.products.saveChangesBtn
                        : t.admin.products.publishProductBtn}
                    </button>
                  </div>
                </form>
              </div>

              {/* Catalog */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {t.admin.products.catalogTableTitle} (
                    {toLocalizedDigits(filteredProducts.length, lang)})
                  </h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder={t.admin.products.filterPlaceholder}
                      className="input min-h-[40px] py-1.5 pl-9 text-xs"
                    />
                  </div>
                </div>

                {/* Mobile Product Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-10 text-center text-xs text-slate-500">
                      {t.admin.products.emptyProducts}
                    </div>
                  ) : (
                    filteredProducts.map((p) => {
                      const catLabels = parseCsvSlugs(p.categories).map((slug) => {
                        const c = categoryMap.get(slug);
                        return c ? pickLocalized(c.nameEn, c.nameBn, lang, slug) : slug;
                      });
                      const lblNames = parseCsvSlugs(p.labels).map((slug) => {
                        const l = labelMap.get(slug);
                        return l ? pickLocalized(l.nameEn, l.nameBn, lang, slug) : slug;
                      });
                      const displayProdName = pickLocalized(
                        p.nameEn,
                        p.nameBn,
                        lang,
                        p.sku
                      );
                      const isDropship = p.fulfillmentType === "dropship";
                      const supObj = p.supplierId ? supMap.get(p.supplierId) : undefined;
                      const unitCost = Number(p.costPrice) || 0;
                      const unitProfit = (Number(p.price) || 0) - unitCost;
                      const effectiveStock = getEffectiveProductStock(p);
                      const colorList = parseProductColors(p.colorsJson);
                      const sizeList = parseProductSizes(p.sizesList);
                      const hasWholesale = p.wholesaleMinQty > 0 && p.wholesalePrice > 0;

                      return (
                        <div key={p.id} className="p-4 space-y-3 text-xs">
                          <div className="flex items-start gap-3">
                            <div className="h-14 w-14 rounded-xl bg-white p-0.5 overflow-hidden shrink-0 border border-slate-200">
                              {p.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={normalizeMartImageUrl(p.imageUrl)}
                                  alt={displayProdName}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-contain"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-semibold text-sm text-slate-900 line-clamp-2">
                                  {displayProdName}
                                </div>
                                <div className="text-right font-mono tabular-nums shrink-0">
                                  <div className="font-bold text-slate-900">
                                    {formatMartPrice(p.price, lang)}
                                  </div>
                                  <div
                                    className={`text-[11px] font-semibold ${
                                      unitProfit >= 0 ? "text-[#0B5336]" : "text-red-600"
                                    }`}
                                  >
                                    {formatMartPrice(unitCost, lang)} →{" "}
                                    {formatMartPrice(unitProfit, lang)}
                                  </div>
                                </div>
                              </div>

                              <div className="font-mono text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                                <span>
                                  {p.sku || p.id}
                                  {colorList.length > 0
                                    ? ` · ${toLocalizedDigits(colorList.length, lang)} ${tvar.colorsCountSuffix}`
                                    : ""}
                                  {sizeList.length > 0
                                    ? ` · ${toLocalizedDigits(sizeList.length, lang)} ${tvar.sizesCountSuffix}`
                                    : ""}
                                </span>
                                {colorList.length > 0 && (
                                  <span className="inline-flex items-center gap-1">
                                    {colorList.slice(0, 5).map((clr) => (
                                      <span
                                        key={clr.id}
                                        title={pickLocalized(clr.nameEn, clr.nameBn, lang)}
                                        className="h-2.5 w-2.5 rounded-full border border-slate-300"
                                        style={{ backgroundColor: clr.hex || "#0B5336" }}
                                      />
                                    ))}
                                  </span>
                                )}
                              </div>
                              {hasWholesale && (
                                <div className="text-[11px] font-mono text-[#0B5336] font-semibold mt-0.5">
                                  {tvar.wholesaleCardHintPrefix}:{" "}
                                  {formatMartPrice(p.wholesalePrice, lang)} (
                                  {toLocalizedDigits(p.wholesaleMinQty, lang)}+)
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-3 gap-y-1 bg-slate-50 rounded-xl px-3 py-2">
                            <span>
                              <strong>
                                {catLabels.length > 0
                                  ? catLabels.join(" · ")
                                  : t.catalog.generalFallback}
                              </strong>
                              {lblNames.length > 0 ? ` · ${lblNames.join(" · ")}` : ""}
                            </span>
                            <span className="text-slate-500">
                              {isDropship ? tsrc.dropshipMode : tsrc.ownStockMode} (
                              {supObj?.name || p.sourceName || tsrc.noSupplierOption})
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {isDropship ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleProductField(p, "supplierAvailable")
                                }
                                className={`min-h-[38px] rounded-lg border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                                  p.supplierAvailable !== false
                                    ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }`}
                              >
                                {p.supplierAvailable !== false
                                  ? tsrc.availableStatus
                                  : tsrc.pausedStatus}
                              </button>
                            ) : parseVariationMatrix(p.variationMatrixJson).length > 0 ? (
                              <button
                                type="button"
                                onClick={() => startEditProduct(p)}
                                title={t.admin.products.variantStockLockedNote}
                                className="min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1 text-xs font-mono font-bold tabular-nums hover:border-[#0B5336]"
                              >
                                <span
                                  className={
                                    effectiveStock <= (Number(p.lowStockThreshold) || 5)
                                      ? "text-red-600"
                                      : "text-slate-900"
                                  }
                                >
                                  {t.admin.products.colStock}: {toLocalizedDigits(effectiveStock, lang)}
                                </span>
                                <Pencil className="h-3 w-3 text-slate-400" />
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleQuickStockAdjust(p, -1)}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 font-mono hover:bg-slate-100"
                                >
                                  -
                                </button>
                                <span
                                  className={`font-mono font-bold tabular-nums w-8 text-center ${
                                    effectiveStock <= (Number(p.lowStockThreshold) || 5)
                                      ? "text-red-600"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {toLocalizedDigits(effectiveStock, lang)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStockAdjust(p, 1)}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 font-mono hover:bg-slate-100"
                                >
                                  +
                                </button>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleProductField(p, "active")}
                                className={`min-h-[38px] rounded-lg px-2.5 py-1 text-[11px] font-semibold border whitespace-nowrap ${
                                  p.active
                                    ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                                    : "border-slate-200 bg-slate-100 text-slate-500"
                                }`}
                              >
                                {p.active ? t.admin.products.activeFlag : t.admin.products.pausedFlag}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleProductField(p, "featured")}
                                title={t.admin.products.featuredTitle}
                                className={`min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg border ${
                                  p.featured
                                    ? "border-gold-200 bg-gold-50 text-gold-600"
                                    : "border-slate-200 bg-white text-slate-400"
                                }`}
                              >
                                <Star className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => startEditProduct(p)}
                              className="min-h-[38px] inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] font-medium whitespace-nowrap"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>{t.admin.products.editBtn}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => startDuplicateProduct(p)}
                              className="min-h-[38px] inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-slate-600 hover:border-[#0B5336] hover:text-[#0B5336] font-medium whitespace-nowrap"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>{t.admin.products.duplicateBtn}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="min-h-[38px] inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-red-600 hover:bg-red-50 font-medium whitespace-nowrap"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>{t.admin.products.deleteBtn}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">
                          {t.admin.products.colProductSku}
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          {t.admin.products.colTaxonomy}
                        </th>
                        <th className="px-4 py-3 font-semibold">{tsrc.colSourcing}</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          {t.admin.products.colPrice} / {tsrc.colCostMargin}
                        </th>
                        <th className="px-4 py-3 font-semibold text-center">
                          {t.admin.products.colStock}
                        </th>
                        <th className="px-4 py-3 font-semibold">{t.admin.products.colFlags}</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          {t.admin.products.colActions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                            {t.admin.products.emptyProducts}
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const catLabels = parseCsvSlugs(p.categories).map((slug) => {
                            const c = categoryMap.get(slug);
                            return c ? pickLocalized(c.nameEn, c.nameBn, lang, slug) : slug;
                          });
                          const lblNames = parseCsvSlugs(p.labels).map((slug) => {
                            const l = labelMap.get(slug);
                            return l ? pickLocalized(l.nameEn, l.nameBn, lang, slug) : slug;
                          });
                          const displayProdName = pickLocalized(
                            p.nameEn,
                            p.nameBn,
                            lang,
                            p.sku
                          );
                          const isDropship = p.fulfillmentType === "dropship";
                          const supObj = p.supplierId ? supMap.get(p.supplierId) : undefined;
                          const unitCost = Number(p.costPrice) || 0;
                          const unitProfit = (Number(p.price) || 0) - unitCost;
                          const effectiveStock = getEffectiveProductStock(p);
                          const colorList = parseProductColors(p.colorsJson);
                          const sizeList = parseProductSizes(p.sizesList);
                          const hasWholesale = p.wholesaleMinQty > 0 && p.wholesalePrice > 0;

                          return (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-white p-0.5 overflow-hidden shrink-0 border border-slate-200">
                                    {p.imageUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={normalizeMartImageUrl(p.imageUrl)}
                                        alt={displayProdName}
                                        referrerPolicy="no-referrer"
                                        className="h-full w-full object-contain"
                                      />
                                    ) : null}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900">
                                      {displayProdName}
                                    </div>
                                    <div className="font-mono text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5">
                                      <span>
                                        {p.sku || p.id}
                                        {colorList.length > 0
                                          ? ` · ${toLocalizedDigits(colorList.length, lang)} ${tvar.colorsCountSuffix}`
                                          : ""}
                                        {sizeList.length > 0
                                          ? ` · ${toLocalizedDigits(sizeList.length, lang)} ${tvar.sizesCountSuffix}`
                                          : ""}
                                      </span>
                                      {colorList.length > 0 && (
                                        <span className="inline-flex items-center gap-1">
                                          {colorList.slice(0, 5).map((clr) => (
                                            <span
                                              key={clr.id}
                                              title={pickLocalized(clr.nameEn, clr.nameBn, lang)}
                                              className="h-2.5 w-2.5 rounded-full border border-slate-300"
                                              style={{ backgroundColor: clr.hex || "#0B5336" }}
                                            />
                                          ))}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-xs">
                                <div className="font-medium text-slate-800">
                                  {catLabels.length > 0
                                    ? catLabels.join(" · ")
                                    : t.catalog.generalFallback}
                                </div>
                                {lblNames.length > 0 && (
                                  <div className="text-[11px] text-[#0B5336] font-medium mt-0.5">
                                    {lblNames.join(" · ")}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-800">
                                  {isDropship ? tsrc.dropshipMode : tsrc.ownStockMode}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {supObj?.name || p.sourceName || tsrc.noSupplierOption}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono tabular-nums">
                                <div className="font-bold text-slate-900">
                                  {formatMartPrice(p.price, lang)}
                                </div>
                                {hasWholesale && (
                                  <div className="text-[10px] text-[#0B5336] font-semibold">
                                    {tvar.wholesaleCardHintPrefix}:{" "}
                                    {formatMartPrice(p.wholesalePrice, lang)} (
                                    {toLocalizedDigits(p.wholesaleMinQty, lang)}+)
                                  </div>
                                )}
                                <div className="text-[11px] text-slate-500">
                                  {formatMartPrice(unitCost, lang)} →{" "}
                                  <span
                                    className={
                                      unitProfit >= 0
                                        ? "text-[#0B5336] font-semibold"
                                        : "text-red-600 font-semibold"
                                    }
                                  >
                                    {formatMartPrice(unitProfit, lang)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isDropship ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleProductField(p, "supplierAvailable")
                                    }
                                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                                      p.supplierAvailable !== false
                                        ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                                        : "border-red-200 bg-red-50 text-red-700"
                                    }`}
                                  >
                                    {p.supplierAvailable !== false
                                      ? tsrc.availableStatus
                                      : tsrc.pausedStatus}
                                  </button>
                                ) : parseVariationMatrix(p.variationMatrixJson).length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => startEditProduct(p)}
                                    title={t.admin.products.variantStockLockedNote}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-mono font-bold tabular-nums hover:border-[#0B5336]"
                                  >
                                    <span
                                      className={
                                        effectiveStock <= (Number(p.lowStockThreshold) || 5)
                                          ? "text-red-600"
                                          : "text-slate-900"
                                      }
                                    >
                                      {toLocalizedDigits(effectiveStock, lang)}
                                    </span>
                                    <Pencil className="h-3 w-3 text-slate-400" />
                                  </button>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStockAdjust(p, -1)}
                                      className="rounded border border-slate-200 px-1.5 py-0.5 font-mono hover:bg-slate-100"
                                    >
                                      -
                                    </button>
                                    <span
                                      className={`font-mono font-bold tabular-nums w-8 text-center ${
                                        effectiveStock <= (Number(p.lowStockThreshold) || 5)
                                          ? "text-red-600"
                                          : "text-slate-900"
                                      }`}
                                    >
                                      {toLocalizedDigits(effectiveStock, lang)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStockAdjust(p, 1)}
                                      className="rounded border border-slate-200 px-1.5 py-0.5 font-mono hover:bg-slate-100"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductField(p, "active")}
                                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold border whitespace-nowrap ${
                                      p.active
                                        ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                                        : "border-slate-200 bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {p.active
                                      ? t.admin.products.activeFlag
                                      : t.admin.products.pausedFlag}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductField(p, "featured")}
                                    title={t.admin.products.featuredTitle}
                                    className={`rounded-lg p-1.5 border ${
                                      p.featured
                                        ? "border-gold-200 bg-gold-50 text-gold-600"
                                        : "border-slate-200 bg-white text-slate-400"
                                    }`}
                                  >
                                    <Star className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => startEditProduct(p)}
                                    className="inline-flex items-center gap-1 text-slate-700 hover:text-[#0B5336] font-medium whitespace-nowrap"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span>{t.admin.products.editBtn}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => startDuplicateProduct(p)}
                                    className="inline-flex items-center gap-1 text-slate-600 hover:text-[#0B5336] font-medium whitespace-nowrap"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>{t.admin.products.duplicateBtn}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>{t.admin.products.deleteBtn}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. CATEGORIES & LABELS MANAGEMENT */}
          {activeSection === "taxonomy" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Categories Panel */}
              <div className="lg:col-span-6 space-y-6">
                <div
                  className={`rounded-2xl border p-6 space-y-4 transition-colors ${
                    editingCategoryId
                      ? "border-[#0B5336] ring-2 ring-[#0B5336]/15 bg-brand-50/20"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      {editingCategoryId
                        ? `${t.admin.taxonomy.catEditTitle} (${editingCategoryId})`
                        : t.admin.taxonomy.catAddTitle}
                    </h2>
                    {editingCategoryId && (
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                      >
                        {t.admin.products.cancelEdit}
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleSaveCategory} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.catNameEnLabel}
                        </label>
                        <input
                          type="text"
                          value={catNameEn}
                          onChange={(e) => {
                            const nextVal = e.target.value;
                            setCatNameEn(nextVal);
                            if (!editingCategoryId && !catSlug.trim()) {
                              // Keep auto preview cleanly blank until edited
                            }
                          }}
                          placeholder={t.admin.taxonomy.catNameEnPlaceholder}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.catNameBnLabel}
                        </label>
                        <input
                          type="text"
                          value={catNameBn}
                          onChange={(e) => setCatNameBn(e.target.value)}
                          placeholder={t.admin.taxonomy.catNameBnPlaceholder}
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.admin.taxonomy.catSlugLabel}
                      </label>
                      <input
                        type="text"
                        value={catSlug}
                        onChange={(e) => setCatSlug(e.target.value)}
                        placeholder={
                          slugifyCategory(catNameEn || catNameBn) ||
                          t.admin.taxonomy.catSlugPlaceholder
                        }
                        className="input font-mono text-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {t.admin.taxonomy.slugCascadeNote}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.catParentLabel}
                        </label>
                        <select
                          value={catParentSlug}
                          onChange={(e) => setCatParentSlug(e.target.value)}
                          className="input text-xs"
                        >
                          <option value="">{t.admin.taxonomy.catParentNone}</option>
                          {categories
                            .filter((cat) => cat.id !== editingCategoryId)
                            .map((cat) => (
                              <option key={cat.slug} value={cat.slug}>
                                {pickLocalized(cat.nameEn, cat.nameBn, lang, cat.slug)}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.catSortOrderLabel}
                        </label>
                        <input
                          type="number"
                          value={catSortOrder}
                          onChange={(e) => setCatSortOrder(e.target.value)}
                          className="input font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.catDescEnLabel}
                        </label>
                        <input
                          type="text"
                          value={catDescEn}
                          onChange={(e) => setCatDescEn(e.target.value)}
                          placeholder={t.admin.taxonomy.catDescEnPlaceholder}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.catDescBnLabel}
                        </label>
                        <input
                          type="text"
                          value={catDescBn}
                          onChange={(e) => setCatDescBn(e.target.value)}
                          placeholder={t.admin.taxonomy.catDescBnPlaceholder}
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.admin.taxonomy.catImageLabel}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={catImageUrl}
                          onChange={(e) => setCatImageUrl(e.target.value)}
                          placeholder="https://lh3.googleusercontent.com/d/..."
                          className="input font-mono text-xs flex-1"
                        />
                        <label className="btn-outline px-3.5 py-2 text-xs gap-1.5 cursor-pointer whitespace-nowrap shrink-0">
                          <Upload className="h-3.5 w-3.5 text-[#0B5336]" />
                          <span>
                            {uploadingCatImg
                              ? t.admin.taxonomy.uploadingBtn
                              : t.admin.taxonomy.driveUploadBtn}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingCatImg}
                            onChange={handleCategoryImageUpload}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      {catImageUrl.trim() && (
                        <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                          <div className="h-14 w-20 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={normalizeMartImageUrl(catImageUrl)}
                              alt={t.admin.taxonomy.coverPreviewAlt}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-semibold text-slate-700">
                              {t.admin.taxonomy.coverPreviewAlt}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400 truncate">
                              {catImageUrl.trim()}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCatImageUrl("")}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 shrink-0"
                          >
                            {t.admin.taxonomy.removeImageBtn}
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={savingCategory}
                      className="btn-primary w-full py-2.5 text-xs"
                    >
                      {savingCategory
                        ? editingCategoryId
                          ? t.admin.taxonomy.catSavingBtn
                          : t.admin.taxonomy.catCreatingBtn
                        : editingCategoryId
                        ? t.admin.taxonomy.catSaveBtn
                        : t.admin.taxonomy.catCreateBtn}
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      {t.admin.taxonomy.catListTitle} ({toLocalizedDigits(categories.length, lang)})
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {categories.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        {t.admin.taxonomy.catEmpty}
                      </div>
                    ) : (
                      categories.map((cat) => {
                        const parent = cat.parentSlug
                          ? categoryMap.get(cat.parentSlug)
                          : null;
                        return (
                          <div
                            key={cat.id}
                            className="px-4 sm:px-6 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                {cat.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={normalizeMartImageUrl(cat.imageUrl)}
                                    alt={pickLocalized(cat.nameEn, cat.nameBn, lang)}
                                    referrerPolicy="no-referrer"
                                    className="h-full w-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate">
                                  {cat.nameEn}
                                  {cat.nameBn ? ` · ${cat.nameBn}` : ""}
                                </div>
                                <div className="font-mono text-[11px] text-slate-400 truncate tabular-nums">
                                  /{cat.slug}
                                  {parent
                                    ? ` · ${t.admin.taxonomy.catParentPrefix} ${pickLocalized(
                                        parent.nameEn,
                                        parent.nameBn,
                                        lang
                                      )}`
                                    : ""}
                                  {` · ${toLocalizedDigits(
                                    categoryProductCounts.get(cat.slug) || 0,
                                    lang
                                  )} ${t.admin.taxonomy.linkedProductsSuffix}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleCategory(cat)}
                                className={`rounded-lg px-2 py-1 text-[11px] font-semibold border whitespace-nowrap ${
                                  cat.active
                                    ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                                    : "border-slate-200 bg-slate-100 text-slate-500"
                                }`}
                              >
                                {cat.active
                                  ? t.admin.taxonomy.catVisible
                                  : t.admin.taxonomy.catHidden}
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditCategory(cat)}
                                aria-label={`${t.common.edit} ${cat.slug}`}
                                className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:border-[#0B5336] hover:text-[#0B5336]"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id)}
                                aria-label={cat.slug}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Labels / Collections Panel */}
              <div className="lg:col-span-6 space-y-6">
                <div
                  className={`rounded-2xl border p-6 space-y-4 transition-colors ${
                    editingLabelId
                      ? "border-[#0B5336] ring-2 ring-[#0B5336]/15 bg-brand-50/20"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      {editingLabelId
                        ? `${t.admin.taxonomy.lblEditTitle} (${editingLabelId})`
                        : t.admin.taxonomy.lblAddTitle}
                    </h2>
                    {editingLabelId && (
                      <button
                        type="button"
                        onClick={resetLabelForm}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                      >
                        {t.admin.products.cancelEdit}
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleSaveLabel} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.lblNameEnLabel}
                        </label>
                        <input
                          type="text"
                          value={lblNameEn}
                          onChange={(e) => setLblNameEn(e.target.value)}
                          placeholder={t.admin.taxonomy.lblNameEnPlaceholder}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.lblNameBnLabel}
                        </label>
                        <input
                          type="text"
                          value={lblNameBn}
                          onChange={(e) => setLblNameBn(e.target.value)}
                          placeholder={t.admin.taxonomy.lblNameBnPlaceholder}
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.admin.taxonomy.lblSlugLabel}
                      </label>
                      <input
                        type="text"
                        value={lblSlug}
                        onChange={(e) => setLblSlug(e.target.value)}
                        placeholder={
                          slugifyCategory(lblNameEn || lblNameBn) ||
                          t.admin.taxonomy.lblSlugPlaceholder
                        }
                        className="input font-mono text-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {t.admin.taxonomy.slugCascadeNote}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.lblToneLabel}
                        </label>
                        <select
                          value={lblTone}
                          onChange={(e) => setLblTone(e.target.value as MartLabelTone)}
                          className="input text-xs"
                        >
                          <option value="emerald">{t.admin.taxonomy.lblToneEmerald}</option>
                          <option value="gold">{t.admin.taxonomy.lblToneGold}</option>
                          <option value="slate">{t.admin.taxonomy.lblToneSlate}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.lblSortOrderLabel}
                        </label>
                        <input
                          type="number"
                          value={lblSortOrder}
                          onChange={(e) => setLblSortOrder(e.target.value)}
                          className="input font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.lblDescEnLabel}
                        </label>
                        <input
                          type="text"
                          value={lblDescEn}
                          onChange={(e) => setLblDescEn(e.target.value)}
                          placeholder={t.admin.taxonomy.lblDescEnPlaceholder}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.lblDescBnLabel}
                        </label>
                        <input
                          type="text"
                          value={lblDescBn}
                          onChange={(e) => setLblDescBn(e.target.value)}
                          placeholder={t.admin.taxonomy.lblDescBnPlaceholder}
                          className="input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingLabel}
                      className="btn-primary w-full py-2.5 text-xs"
                    >
                      {savingLabel
                        ? editingLabelId
                          ? t.admin.taxonomy.lblSavingBtn
                          : t.admin.taxonomy.lblCreatingBtn
                        : editingLabelId
                        ? t.admin.taxonomy.lblSaveBtn
                        : t.admin.taxonomy.lblCreateBtn}
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      {t.admin.taxonomy.lblListTitle} ({toLocalizedDigits(labels.length, lang)})
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {labels.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        {t.admin.taxonomy.lblEmpty}
                      </div>
                    ) : (
                      labels.map((lbl) => (
                        <div
                          key={lbl.id}
                          className="px-4 sm:px-6 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {lbl.nameEn}
                              {lbl.nameBn ? ` · ${lbl.nameBn}` : ""}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400 truncate tabular-nums">
                              #{lbl.slug} · {lbl.tone} ·{" "}
                              {toLocalizedDigits(labelProductCounts.get(lbl.slug) || 0, lang)}{" "}
                              {t.admin.taxonomy.linkedProductsSuffix}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleLabel(lbl)}
                              className={`rounded-lg px-2 py-1 text-[11px] font-semibold border whitespace-nowrap ${
                                lbl.active
                                  ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                                  : "border-slate-200 bg-slate-100 text-slate-500"
                              }`}
                            >
                              {lbl.active
                                ? t.admin.taxonomy.catVisible
                                : t.admin.taxonomy.catHidden}
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditLabel(lbl)}
                              aria-label={`${t.common.edit} ${lbl.slug}`}
                              className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:border-[#0B5336] hover:text-[#0B5336]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLabel(lbl.id)}
                              aria-label={lbl.slug}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. BILINGUAL STORE SETTINGS */}
          {activeSection === "settings" && (
            <div className="max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {t.admin.settings.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{t.admin.settings.subtitle}</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.admin.settings.promoEnLabel}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.promoTextEn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, promoTextEn: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.admin.settings.promoBnLabel}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.promoTextBn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, promoTextBn: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.admin.settings.heroTitleEnLabel}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroTitleEn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroTitleEn: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.admin.settings.heroTitleBnLabel}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroTitleBn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroTitleBn: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.admin.settings.heroSubtitleEnLabel}
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.heroSubtitleEn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroSubtitleEn: e.target.value })
                      }
                      className="input min-h-[72px] py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.admin.settings.heroSubtitleBnLabel}
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.heroSubtitleBn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroSubtitleBn: e.target.value })
                      }
                      className="input min-h-[72px] py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.admin.settings.heroCtaEnLabel}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroCtaTextEn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroCtaTextEn: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.admin.settings.heroCtaBnLabel}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroCtaTextBn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroCtaTextBn: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.admin.settings.insideDhakaLabel}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settingsForm.insideDhakaCharge}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          insideDhakaCharge: e.target.value,
                        })
                      }
                      className="input font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.admin.settings.outsideDhakaLabel}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settingsForm.outsideDhakaCharge}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          outsideDhakaCharge: e.target.value,
                        })
                      }
                      className="input font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.admin.settings.mobileBankingLabel}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.mobileBankingNumber}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        mobileBankingNumber: e.target.value,
                      })
                    }
                    placeholder={t.admin.settings.mobileBankingPlaceholder}
                    className="input font-mono"
                  />
                </div>

                {/* Official bKash Merchant QR & Bangla QR Payments */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <QrCode className="h-4 w-4 text-[#0B5336]" />
                      <span>{tqr.adminSectionTitle}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{tqr.adminSectionSubtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* bKash Merchant QR */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {tqr.bkashMerchantLabel}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.bkashMerchantNumber}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              bkashMerchantNumber: e.target.value,
                            })
                          }
                          placeholder={tqr.bkashMerchantPlaceholder}
                          className="input font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {tqr.bkashQrUrlLabel}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={settingsForm.bkashQrUrl}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, bkashQrUrl: e.target.value })
                            }
                            placeholder="https://lh3.googleusercontent.com/d/..."
                            className="input font-mono text-xs flex-1"
                          />
                          <label className="btn-outline px-3 py-2 text-xs gap-1.5 cursor-pointer whitespace-nowrap shrink-0">
                            <Upload className="h-3.5 w-3.5 text-[#0B5336]" />
                            <span>
                              {uploadingBkashQr
                                ? t.admin.products.uploading
                                : tqr.uploadQrBtn}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingBkashQr}
                              onChange={(e) => handleQrImageUpload("bkash", e)}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      </div>

                      {settingsForm.bkashQrUrl && (
                        <div className="h-28 w-28 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={normalizeMartImageUrl(settingsForm.bkashQrUrl)}
                            alt={tqr.bkashQrTab}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Bangla QR */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {tqr.banglaQrAccountLabel}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.banglaQrAccountInfo}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              banglaQrAccountInfo: e.target.value,
                            })
                          }
                          placeholder={tqr.banglaQrAccountPlaceholder}
                          className="input text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {tqr.banglaQrUrlLabel}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={settingsForm.banglaQrUrl}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, banglaQrUrl: e.target.value })
                            }
                            placeholder="https://lh3.googleusercontent.com/d/..."
                            className="input font-mono text-xs flex-1"
                          />
                          <label className="btn-outline px-3 py-2 text-xs gap-1.5 cursor-pointer whitespace-nowrap shrink-0">
                            <Upload className="h-3.5 w-3.5 text-[#0B5336]" />
                            <span>
                              {uploadingBanglaQr
                                ? t.admin.products.uploading
                                : tqr.uploadQrBtn}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingBanglaQr}
                              onChange={(e) => handleQrImageUpload("bangla", e)}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      </div>

                      {settingsForm.banglaQrUrl && (
                        <div className="h-28 w-28 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={normalizeMartImageUrl(settingsForm.banglaQrUrl)}
                            alt={tqr.banglaQrTab}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="btn-primary px-6 py-2.5 text-xs"
                >
                  {savingSettings ? t.admin.settings.savingBtn : t.admin.settings.saveBtn}
                </button>
              </form>
            </div>
          )}

          {/* COUPONS & PROMO CODES */}
          {activeSection === "coupons" && (
            <MartCouponsPanel
              isLiveBackend={Boolean(data?.isLiveBackend)}
              coupons={coupons}
              onScrollToTop={scrollWorkspaceToTop}
              onCouponCreated={(coupon: MartCoupon) =>
                setData((prev) =>
                  prev
                    ? { ...prev, coupons: [coupon, ...(prev.coupons || [])] }
                    : prev
                )
              }
              onCouponUpdated={(id, updates) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        coupons: (prev.coupons || []).map((c) =>
                          c.id === id ? { ...c, ...updates } : c
                        ),
                      }
                    : prev
                )
              }
              onCouponDeleted={(id) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        coupons: (prev.coupons || []).filter((c) => c.id !== id),
                      }
                    : prev
                )
              }
              onNotify={showNotice}
            />
          )}

          {/* 5. SUPPLIERS & DROPSHIPPING PARTNERS */}
          {activeSection === "suppliers" && (
            <MartSuppliersPanel
              isLiveBackend={Boolean(data?.isLiveBackend)}
              supplierSummaries={supplierSummaries}
              initialCrmSupplierId={crmJumpSupplierId}
              onClearInitialSupplier={() => setCrmJumpSupplierId(null)}
              onScrollToTop={scrollWorkspaceToTop}
              onSupplierCreated={(s) =>
                setData((prev) =>
                  prev ? { ...prev, suppliers: [s, ...(prev.suppliers || [])] } : prev
                )
              }
              onSupplierUpdated={(id, updates) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        suppliers: (prev.suppliers || []).map((s) =>
                          s.id === id ? { ...s, ...updates } : s
                        ),
                      }
                    : prev
                )
              }
              onSupplierDeleted={(id) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        suppliers: (prev.suppliers || []).filter((s) => s.id !== id),
                      }
                    : prev
                )
              }
              onTransactionCreated={(txn) =>
                setData((prev) =>
                  prev
                    ? { ...prev, transactions: [txn, ...(prev.transactions || [])] }
                    : prev
                )
              }
              onCrmLogCreated={(log) =>
                setData((prev) =>
                  prev ? { ...prev, crmLogs: [log, ...(prev.crmLogs || [])] } : prev
                )
              }
              onCrmLogUpdated={(id, updates) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        crmLogs: (prev.crmLogs || []).map((l) =>
                          l.id === id ? { ...l, ...updates } : l
                        ),
                      }
                    : prev
                )
              }
              onCrmLogDeleted={(id) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        crmLogs: (prev.crmLogs || []).filter((l) => l.id !== id),
                      }
                    : prev
                )
              }
              onNotify={showNotice}
            />
          )}

          {/* 6. ACCOUNTING, P&L & CASHBOOK LEDGER */}
          {activeSection === "accounts" && (
            <MartAccountingPanel
              isLiveBackend={Boolean(data?.isLiveBackend)}
              products={products}
              orders={orders}
              suppliers={suppliers}
              supplierSummaries={supplierSummaries}
              transactions={transactions}
              onScrollToTop={scrollWorkspaceToTop}
              onTransactionCreated={(txn) =>
                setData((prev) =>
                  prev
                    ? { ...prev, transactions: [txn, ...(prev.transactions || [])] }
                    : prev
                )
              }
              onTransactionUpdated={(id, updates) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        transactions: (prev.transactions || []).map((tx) =>
                          tx.id === id ? { ...tx, ...updates } : tx
                        ),
                      }
                    : prev
                )
              }
              onTransactionDeleted={(id) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        transactions: (prev.transactions || []).filter((tx) => tx.id !== id),
                      }
                    : prev
                )
              }
              onNotify={showNotice}
            />
          )}

          {/* 7. CLIENT 360 CRM, RISK SCORING & FOLLOW-UP HUB */}
          {activeSection === "customers" && (
            <MartCrmPanel
              isLiveBackend={Boolean(data?.isLiveBackend)}
              customerSummaries={customerSummaries}
              crmProfiles={crmProfiles}
              initialClientKey={crmJumpClientKey}
              onClearInitialClient={() => setCrmJumpClientKey(null)}
              onProfileSaved={(profile, isNew) =>
                setData((prev) => {
                  if (!prev) return prev;
                  const list = prev.crmProfiles || [];
                  return {
                    ...prev,
                    crmProfiles: isNew
                      ? [profile, ...list]
                      : list.map((p) => (p.id === profile.id ? profile : p)),
                  };
                })
              }
              onProfileDeleted={(id) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        crmProfiles: (prev.crmProfiles || []).filter((p) => p.id !== id),
                      }
                    : prev
                )
              }
              onLogCreated={(log) =>
                setData((prev) =>
                  prev ? { ...prev, crmLogs: [log, ...(prev.crmLogs || [])] } : prev
                )
              }
              onLogUpdated={(id, updates) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        crmLogs: (prev.crmLogs || []).map((l) =>
                          l.id === id ? { ...l, ...updates } : l
                        ),
                      }
                    : prev
                )
              }
              onLogDeleted={(id) =>
                setData((prev) =>
                  prev
                    ? {
                        ...prev,
                        crmLogs: (prev.crmLogs || []).filter((l) => l.id !== id),
                      }
                    : prev
                )
              }
              onNotify={showNotice}
            />
          )}
        </main>
      </div>

      {/* PRINTABLE CUSTOMER INVOICE MODAL */}
      {invoiceOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 print:hidden shrink-0">
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 truncate pr-2">
                {t.admin.invoice.titlePrefix} · {invoiceOrder.id}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary px-3.5 py-1.5 text-xs gap-1.5 min-h-[38px]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>{t.common.print}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  aria-label={t.common.close}
                  className="rounded-lg p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <MartLogo />
                  <div className="text-slate-500 mt-2">
                    {MART_CONTACT_EMAIL} · {MART_CONTACT_PHONE}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {invoiceOrder.id}
                  </div>
                  <div className="text-slate-500">
                    {formatMartDateTime(invoiceOrder.createdAt, lang)}
                  </div>
                  <div className="mt-1">
                    <StatusLabel
                      status={invoiceOrder.status}
                      label={t.orderStatuses[invoiceOrder.status] || invoiceOrder.status}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-500 font-semibold mb-1">{t.admin.invoice.billTo}</div>
                  <div className="font-semibold text-slate-900">{invoiceOrder.customerName}</div>
                  <div className="font-mono text-slate-700">{invoiceOrder.phone}</div>
                  <div className="text-slate-600 mt-0.5">{invoiceOrder.address}</div>
                </div>
                <div className="sm:text-right">
                  <div className="text-slate-500 font-semibold mb-1">
                    {t.admin.invoice.fulfillmentPayment}
                  </div>
                  <div>
                    {t.admin.invoice.areaLabel}: {invoiceOrder.deliveryArea}
                  </div>
                  <div>
                    {t.admin.invoice.paymentLabel}: {invoiceOrder.paymentMethod}
                    {invoiceOrder.paymentProvider ? ` (${invoiceOrder.paymentProvider})` : ""}
                  </div>
                  {invoiceOrder.transactionId && (
                    <div className="font-mono">
                      {t.admin.invoice.trxIdLabel}: {invoiceOrder.transactionId}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2 font-semibold">{t.admin.invoice.itemCol}</th>
                      <th className="py-2 font-semibold text-center">{t.admin.invoice.qtyCol}</th>
                      <th className="py-2 font-semibold text-right">{t.admin.invoice.amountCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parseOrderItems(invoiceOrder.itemsJson).length > 0 ? (
                      parseOrderItems(invoiceOrder.itemsJson).map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2">
                            <div className="font-semibold text-slate-900">
                              {pickLocalized(item.nameEn || item.name, item.nameBn, lang)}
                              {item.isWholesale && (
                                <span className="ml-1.5 text-[10px] font-semibold text-[#0B5336]">
                                  [{tvar.wholesaleCardHintPrefix}]
                                </span>
                              )}
                            </div>
                            {item.variant && (
                              <div className="text-slate-500">{item.variant}</div>
                            )}
                          </td>
                          <td className="py-2 text-center font-mono tabular-nums">
                            {toLocalizedDigits(item.quantity, lang)}
                          </td>
                          <td className="py-2 text-right font-mono font-semibold tabular-nums">
                            {formatMartPrice(item.lineTotal, lang)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2">{invoiceOrder.itemsSummary}</td>
                        <td className="py-2 text-center font-mono">
                          {toLocalizedDigits(invoiceOrder.totalItems, lang)}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {formatMartPrice(invoiceOrder.subtotal, lang)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>{t.admin.invoice.subtotalLabel}</span>
                  <span className="font-mono tabular-nums">
                    {formatMartPrice(invoiceOrder.subtotal, lang)}
                  </span>
                </div>
                {(Number(invoiceOrder.discountAmount) || 0) > 0 && (
                  <div className="flex justify-between text-[#0B5336] font-medium">
                    <span>
                      {tcop.discountRowLabel}
                      {invoiceOrder.discountCode ? ` (${invoiceOrder.discountCode})` : ""}
                    </span>
                    <span className="font-mono tabular-nums">
                      − {formatMartPrice(Number(invoiceOrder.discountAmount) || 0, lang)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>
                    {t.admin.invoice.deliveryPrefix} ({invoiceOrder.deliveryArea})
                  </span>
                  <span className="font-mono tabular-nums">
                    {formatMartPrice(invoiceOrder.deliveryCharge, lang)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>{t.admin.invoice.totalAmountLabel}</span>
                  <span className="font-mono text-[#0B5336] tabular-nums">
                    {formatMartPrice(invoiceOrder.totalAmount, lang)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ORDER DETAILS MODAL */}
      {editingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 shrink-0">
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 truncate pr-2">
                {t.admin.orders.editOrderTitle} · {editingOrder.id}
              </h2>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                aria-label={t.common.close}
                className="rounded-lg p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-500 hover:bg-slate-200 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderDetails} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.admin.orders.orderCustomerNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={orderDraft.customerName}
                    onChange={(e) =>
                      setOrderDraft({ ...orderDraft, customerName: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.admin.orders.orderPhoneLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={orderDraft.phone}
                    onChange={(e) => setOrderDraft({ ...orderDraft, phone: e.target.value })}
                    className="input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.admin.orders.orderAreaLabel}
                  </label>
                  <select
                    value={orderDraft.deliveryArea}
                    onChange={(e) => {
                      const area = e.target.value;
                      const defaultFee =
                        area === "Inside Dhaka"
                          ? String(Number(settingsForm.insideDhakaCharge) || 70)
                          : String(Number(settingsForm.outsideDhakaCharge) || 130);
                      setOrderDraft({
                        ...orderDraft,
                        deliveryArea: area,
                        deliveryCharge: defaultFee,
                      });
                    }}
                    className="input text-xs"
                  >
                    <option value="Inside Dhaka">{t.cart.insideDhaka}</option>
                    <option value="Outside Dhaka">{t.cart.outsideDhaka}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.admin.orders.orderDeliveryChargeLabel}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={orderDraft.deliveryCharge}
                    onChange={(e) =>
                      setOrderDraft({ ...orderDraft, deliveryCharge: e.target.value })
                    }
                    className="input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.admin.orders.orderDiscountCodeLabel}
                  </label>
                  <input
                    type="text"
                    value={orderDraft.discountCode}
                    onChange={(e) =>
                      setOrderDraft({
                        ...orderDraft,
                        discountCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="input font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.admin.orders.orderDiscountAmountLabel}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={orderDraft.discountAmount}
                    onChange={(e) =>
                      setOrderDraft({ ...orderDraft, discountAmount: e.target.value })
                    }
                    className="input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.orders.orderAddressLabel}
                </label>
                <textarea
                  rows={2}
                  required
                  value={orderDraft.address}
                  onChange={(e) => setOrderDraft({ ...orderDraft, address: e.target.value })}
                  className="input min-h-[70px] py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.admin.orders.orderPaymentMethodLabel}
                  </label>
                  <select
                    value={orderDraft.paymentMethod}
                    onChange={(e) =>
                      setOrderDraft({ ...orderDraft, paymentMethod: e.target.value })
                    }
                    className="input text-xs"
                  >
                    <option value="Cash on Delivery">{t.cart.codOption}</option>
                    <option value="Mobile Banking">{tqr.checkoutOnlineOption}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.admin.orders.orderPaymentProviderLabel}
                  </label>
                  <input
                    type="text"
                    value={orderDraft.paymentProvider}
                    onChange={(e) =>
                      setOrderDraft({ ...orderDraft, paymentProvider: e.target.value })
                    }
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.admin.orders.orderTrxIdLabel}
                  </label>
                  <input
                    type="text"
                    value={orderDraft.transactionId}
                    onChange={(e) =>
                      setOrderDraft({ ...orderDraft, transactionId: e.target.value })
                    }
                    className="input font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.orders.orderNotesLabel}
                </label>
                <input
                  type="text"
                  value={orderDraft.notes}
                  onChange={(e) => setOrderDraft({ ...orderDraft, notes: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="font-semibold text-slate-700">
                  {t.admin.orders.recalculatedTotalLabel}
                </span>
                <span className="font-mono text-base font-bold text-[#0B5336] tabular-nums">
                  {formatMartPrice(
                    Math.max(
                      0,
                      (Number(editingOrder.subtotal) || 0) -
                        (Math.max(0, Number(orderDraft.discountAmount) || 0))
                    ) + Math.max(0, Number(orderDraft.deliveryCharge) || 0),
                    lang
                  )}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingOrderDetails}
                  className="btn-primary px-5 py-2 text-xs disabled:opacity-60"
                >
                  {savingOrderDetails
                    ? t.admin.orders.savingOrderBtn
                    : t.admin.orders.saveOrderBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
