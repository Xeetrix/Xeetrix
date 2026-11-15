"use client";

import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { MartLogo } from "./MartLogo";
import { MartLanguageSwitcher } from "./MartLanguageSwitcher";
import { useMartI18n } from "./MartI18nProvider";
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
  MartLabel,
  MartLabelTone,
  MartOrder,
  MartOrderStatus,
  MartProduct,
  MartSettings,
  normalizeMartImageUrl,
  parseOrderItems,
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

type MartAdminSection =
  | "analytics"
  | "orders"
  | "products"
  | "taxonomy"
  | "settings"
  | "customers";

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

  const [authenticated, setAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<MartAdminSection>("analytics");
  const [data, setData] = useState<MartAdminBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Order Filters & Printable Invoice Modal
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"All" | MartOrderStatus>("All");
  const [invoiceOrder, setInvoiceOrder] = useState<MartOrder | null>(null);

  // Product Form (Add or Edit — Bilingual + Multi-Category + Multi-Label)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodSku, setProdSku] = useState("");
  const [prodNameEn, setProdNameEn] = useState("");
  const [prodNameBn, setProdNameBn] = useState("");
  const [prodCategories, setProdCategories] = useState<string[]>([]);
  const [prodLabels, setProdLabels] = useState<string[]>([]);
  const [prodPrice, setProdPrice] = useState("");
  const [prodComparePrice, setProdComparePrice] = useState("");
  const [prodStock, setProdStock] = useState("20");
  const [prodVariantsEn, setProdVariantsEn] = useState("");
  const [prodVariantsBn, setProdVariantsBn] = useState("");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodDescEn, setProdDescEn] = useState("");
  const [prodDescBn, setProdDescBn] = useState("");
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodActive, setProdActive] = useState(true);
  const [uploadingProdImg, setUploadingProdImg] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Category Form (Mart_Categories)
  const [catNameEn, setCatNameEn] = useState("");
  const [catNameBn, setCatNameBn] = useState("");
  const [catParentSlug, setCatParentSlug] = useState("");
  const [catSortOrder, setCatSortOrder] = useState("0");
  const [catDescEn, setCatDescEn] = useState("");
  const [catDescBn, setCatDescBn] = useState("");
  const [catImageUrl, setCatImageUrl] = useState("");
  const [uploadingCatImg, setUploadingCatImg] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  // Label Form (Mart_Labels)
  const [lblNameEn, setLblNameEn] = useState("");
  const [lblNameBn, setLblNameBn] = useState("");
  const [lblTone, setLblTone] = useState<MartLabelTone>("emerald");
  const [lblSortOrder, setLblSortOrder] = useState("0");
  const [lblDescEn, setLblDescEn] = useState("");
  const [lblDescBn, setLblDescBn] = useState("");
  const [savingLabel, setSavingLabel] = useState(false);

  // Store Settings Form
  const [settingsForm, setSettingsForm] = useState<MartSettings>(DEFAULT_MART_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);

  // Customer CRM Detail Modal
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null);

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
    setProdStock("20");
    setProdVariantsEn("");
    setProdVariantsBn("");
    setProdImageUrl("");
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
    setProdStock(String(p.stock));
    setProdVariantsEn(p.variantsEn || "");
    setProdVariantsBn(p.variantsBn || "");
    setProdImageUrl(p.imageUrl || "");
    setProdDescEn(p.descriptionEn || "");
    setProdDescBn(p.descriptionBn || "");
    setProdFeatured(Boolean(p.featured));
    setProdActive(Boolean(p.active));
    setActiveSection("products");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
      const base64Data = await fileToMartBase64(file);
      const uploaded = await uploadMartImageToDrive({
        fileName: file.name,
        mimeType: file.type || "image/jpeg",
        base64Data,
        folderType: "products",
      });
      setProdImageUrl(uploaded.url);
      showNotice("success", `${t.admin.products.msgImageUploaded} (${uploaded.fileId})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setUploadingProdImg(false);
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

    const payload = {
      sku: prodSku.trim() || `XM-${Date.now().toString().slice(-5)}`,
      nameEn: prodNameEn.trim() || prodNameBn.trim(),
      nameBn: prodNameBn.trim(),
      categories: prodCategories.join(","),
      labels: prodLabels.join(","),
      price: Number(prodPrice) || 0,
      comparePrice: Number(prodComparePrice) || 0,
      stock: Math.max(0, Number(prodStock) || 0),
      variantsEn: prodVariantsEn.trim(),
      variantsBn: prodVariantsBn.trim(),
      imageUrl: prodImageUrl.trim(),
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
    field: "active" | "featured"
  ) {
    if (!data?.isLiveBackend) return;
    const nextVal = !p[field];
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

  async function handleOrderStatusChange(orderId: string, status: MartOrderStatus) {
    if (!data?.isLiveBackend) return;
    try {
      await updateMartRecord("Mart_Orders", orderId, { status });
      setData((prev) =>
        prev
          ? {
              ...prev,
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

  async function handleCreateCategory(e: React.FormEvent) {
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
    const payload = {
      nameEn: baseEn,
      nameBn: catNameBn.trim(),
      slug: slugifyCategory(baseEn),
      parentSlug: catParentSlug.trim(),
      descriptionEn: catDescEn.trim(),
      descriptionBn: catDescBn.trim(),
      imageUrl: catImageUrl.trim(),
      sortOrder: Number(catSortOrder) || 0,
      active: true,
    };

    setSavingCategory(true);
    try {
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
      setCatNameEn("");
      setCatNameBn("");
      setCatParentSlug("");
      setCatSortOrder("0");
      setCatDescEn("");
      setCatDescBn("");
      setCatImageUrl("");
      showNotice("success", t.admin.taxonomy.msgCatCreated);
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
      showNotice("success", t.admin.taxonomy.msgCatDeleted);
    } catch (err) {
      const apiErr = err as MartApiError;
      showNotice("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleCreateLabel(e: React.FormEvent) {
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
    const payload = {
      nameEn: baseEn,
      nameBn: lblNameBn.trim(),
      slug: slugifyCategory(baseEn),
      descriptionEn: lblDescEn.trim(),
      descriptionBn: lblDescBn.trim(),
      tone: lblTone,
      sortOrder: Number(lblSortOrder) || 0,
      active: true,
    };

    setSavingLabel(true);
    try {
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
      setLblNameEn("");
      setLblNameBn("");
      setLblTone("emerald");
      setLblSortOrder("0");
      setLblDescEn("");
      setLblDescBn("");
      showNotice("success", t.admin.taxonomy.msgLblCreated);
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
  const orders = useMemo(() => data?.orders || [], [data]);

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

  const analytics = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const activeOrders = orders.filter((o) => o.status !== "Cancelled");
    const totalRevenue = activeOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
    const todaysOrders = orders.filter((o) => (o.createdAt || "").slice(0, 10) === todayKey).length;
    const pendingOrders = orders.filter(
      (o) => o.status === "Pending" || o.status === "Confirmed" || o.status === "Packaging"
    ).length;
    const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
    const lowStockProducts = products.filter((p) => p.stock <= 5);

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
      return [p.nameEn, p.nameBn, p.sku, catNames, lblNames]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [products, productSearch, categoryMap, labelMap]);

  const customers = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone: string;
        address: string;
        orderCount: number;
        totalSpend: number;
        lastOrderDate: string;
        orders: MartOrder[];
      }
    >();

    orders.forEach((o) => {
      const phoneKey = (o.phone || "").replace(/\s+/g, "").trim() || o.customerName;
      const existing = map.get(phoneKey);
      const validSpend = o.status !== "Cancelled" ? Number(o.totalAmount) || 0 : 0;
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpend += validSpend;
        existing.orders.push(o);
        if (o.createdAt > existing.lastOrderDate) {
          existing.lastOrderDate = o.createdAt;
          existing.address = o.address;
          existing.name = o.customerName;
        }
      } else {
        map.set(phoneKey, {
          name: o.customerName,
          phone: o.phone,
          address: o.address,
          orderCount: 1,
          totalSpend: validSpend,
          lastOrderDate: o.createdAt,
          orders: [o],
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [orders]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.phone === selectedCustomerPhone) || null,
    [customers, selectedCustomerPhone]
  );

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

  const navItems: {
    id: MartAdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "analytics", label: t.admin.nav.analytics, icon: LayoutDashboard },
    { id: "orders", label: t.admin.nav.orders, icon: ShoppingCart },
    { id: "products", label: t.admin.nav.products, icon: Package },
    { id: "taxonomy", label: t.admin.nav.taxonomy, icon: Tags },
    { id: "settings", label: t.admin.nav.settings, icon: SlidersHorizontal },
    { id: "customers", label: t.admin.nav.customers, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Sidebar (264px) */}
      <aside className="w-full lg:w-[264px] shrink-0 bg-slate-900 text-slate-200 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between gap-2">
            <Link href="/mart">
              <MartLogo inverted />
            </Link>
            <div className="flex items-center gap-2 lg:hidden">
              <MartLanguageSwitcher inverted />
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white whitespace-nowrap"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t.admin.exitBtn}</span>
              </button>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? "bg-[#0B5336] text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-5 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-400">
              {t.admin.sheetStatusLabel}:{" "}
              <span
                className={
                  data?.isLiveBackend
                    ? "text-emerald-400 font-semibold"
                    : "text-gold-400 font-semibold"
                }
              >
                {data?.isLiveBackend ? t.admin.connectedLive : t.admin.notConnected}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <MartLanguageSwitcher inverted />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/mart"
              className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-center text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white whitespace-nowrap"
            >
              {t.admin.viewStoreBtn}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t.admin.logoutBtn}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              {t.admin.breadcrumbRoot} /{" "}
              <span className="text-slate-900 font-medium">
                {navItems.find((n) => n.id === activeSection)?.label}
              </span>
            </div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              {navItems.find((n) => n.id === activeSection)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <MartLanguageSwitcher className="hidden lg:inline-flex" />

            <button
              type="button"
              onClick={() => exportMartOrdersToCsv(orders, lang)}
              disabled={orders.length === 0}
              className="btn-outline px-4 py-2 text-xs gap-2 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.admin.exportCsv}</span>
            </button>

            <button
              type="button"
              onClick={loadMartDashboard}
              disabled={loading}
              className="btn-primary px-4 py-2 text-xs gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? t.admin.syncing : t.admin.refreshStore}</span>
            </button>
          </div>
        </header>

        {toast && (
          <div className="mx-6 mt-4">
            <div
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium ${
                toast.type === "success"
                  ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{toast.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-xs underline ml-4 whitespace-nowrap"
              >
                {t.admin.dismiss}
              </button>
            </div>
          </div>
        )}

        <main className="p-6 space-y-8 flex-1">
          {!data?.isLiveBackend && !loading && (
            <div className="rounded-xl border border-gold-200 bg-gold-50 px-5 py-4 text-xs text-gold-900">
              <strong>{t.admin.setupAlertTitle}</strong> {t.admin.setupAlertBody}
            </div>
          )}

          {/* 1. DASHBOARD ANALYTICS & KPIs */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
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

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Order Pipeline Summary */}
                <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
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

                {/* Low Stock Alerts */}
                <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-gold-600" />
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
              </div>
            </div>
          )}

          {/* 2. ORDER MANAGEMENT */}
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
                <div className="overflow-x-auto">
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
                          return (
                            <tr key={order.id} className="hover:bg-slate-50 align-top">
                              <td className="px-4 py-3">
                                <div className="font-mono font-bold text-slate-900">{order.id}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {formatMartDate(order.createdAt, lang)}
                                </div>
                              </td>
                              <td className="px-4 py-3 max-w-xs">
                                <div className="font-semibold text-slate-900">
                                  {order.customerName}
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
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-slate-700">{order.itemsSummary}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-800">
                                  {order.paymentMethod}
                                </div>
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
                                <button
                                  type="button"
                                  onClick={() => setInvoiceOrder(order)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                  <span>{t.admin.orders.invoiceBtn}</span>
                                </button>
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

          {/* 3. PRODUCTS & INVENTORY MANAGEMENT (BILINGUAL + MULTI-CATEGORY + LABELS) */}
          {activeSection === "products" && (
            <div className="space-y-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#0B5336]" />
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
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline"
                    >
                      {t.admin.products.cancelEdit}
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-5">
                  {/* Dual EN + BN Names + SKU + Stock */}
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
                      <input
                        type="number"
                        min={0}
                        required
                        value={prodStock}
                        onChange={(e) => setProdStock(e.target.value)}
                        className="input font-mono"
                      />
                    </div>
                  </div>

                  {/* Prices + EN/BN Variants */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.admin.products.variantsEnLabel}
                      </label>
                      <input
                        type="text"
                        value={prodVariantsEn}
                        onChange={(e) => setProdVariantsEn(e.target.value)}
                        placeholder={t.admin.products.variantsEnPlaceholder}
                        className="input"
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
                        className="input"
                      />
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

                  {/* Image Upload + URL */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    <div className="lg:col-span-8">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t.admin.products.imageUrlLabel}
                      </label>
                      <input
                        type="text"
                        value={prodImageUrl}
                        onChange={(e) => setProdImageUrl(e.target.value)}
                        placeholder="https://lh3.googleusercontent.com/d/..."
                        className="input font-mono text-xs"
                      />
                    </div>

                    <div className="lg:col-span-4">
                      <label className="btn-outline w-full px-4 py-2.5 text-xs gap-2 cursor-pointer">
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

              {/* Catalog Table */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
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
                      className="input min-h-[38px] py-1.5 pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">
                          {t.admin.products.colProductSku}
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          {t.admin.products.colTaxonomy}
                        </th>
                        <th className="px-4 py-3 font-semibold text-right">
                          {t.admin.products.colPrice}
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
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
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

                          return (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                    {p.imageUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={normalizeMartImageUrl(p.imageUrl)}
                                        alt={displayProdName}
                                        referrerPolicy="no-referrer"
                                        className="h-full w-full object-cover"
                                      />
                                    ) : null}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900">
                                      {displayProdName}
                                    </div>
                                    <div className="font-mono text-[11px] text-slate-400">
                                      {p.sku || p.id}
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
                              <td className="px-4 py-3 text-right font-mono tabular-nums">
                                <div className="font-bold text-slate-900">
                                  {formatMartPrice(p.price, lang)}
                                </div>
                                {p.comparePrice > p.price && (
                                  <div className="text-[11px] text-slate-400 line-through">
                                    {formatMartPrice(p.comparePrice, lang)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
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
                                      p.stock <= 5 ? "text-red-600" : "text-slate-900"
                                    }`}
                                  >
                                    {toLocalizedDigits(p.stock, lang)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockAdjust(p, 1)}
                                    className="rounded border border-slate-200 px-1.5 py-0.5 font-mono hover:bg-slate-100"
                                  >
                                    +
                                  </button>
                                </div>
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
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    {t.admin.taxonomy.catAddTitle}
                  </h2>
                  <form onSubmit={handleCreateCategory} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.admin.taxonomy.catNameEnLabel}
                        </label>
                        <input
                          type="text"
                          value={catNameEn}
                          onChange={(e) => setCatNameEn(e.target.value)}
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
                          {categories.map((cat) => (
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
                    </div>

                    <button
                      type="submit"
                      disabled={savingCategory}
                      className="btn-primary w-full py-2.5 text-xs"
                    >
                      {savingCategory
                        ? t.admin.taxonomy.catCreatingBtn
                        : t.admin.taxonomy.catCreateBtn}
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
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
                            className="px-6 py-3 flex items-center justify-between gap-3 text-xs"
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
                                <div className="font-mono text-[11px] text-slate-400 truncate">
                                  /{cat.slug}
                                  {parent
                                    ? ` · ${t.admin.taxonomy.catParentPrefix} ${pickLocalized(
                                        parent.nameEn,
                                        parent.nameBn,
                                        lang
                                      )}`
                                    : ""}
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
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    {t.admin.taxonomy.lblAddTitle}
                  </h2>
                  <form onSubmit={handleCreateLabel} className="space-y-3">
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
                        ? t.admin.taxonomy.lblCreatingBtn
                        : t.admin.taxonomy.lblCreateBtn}
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
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
                          className="px-6 py-3 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {lbl.nameEn}
                              {lbl.nameBn ? ` · ${lbl.nameBn}` : ""}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400 truncate">
                              #{lbl.slug} · {lbl.tone}
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
            <div className="max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
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

          {/* 6. CUSTOMER CRM & SALES REPORT */}
          {activeSection === "customers" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    {t.admin.customers.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{t.admin.customers.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => exportMartOrdersToCsv(orders, lang)}
                  disabled={orders.length === 0}
                  className="btn-primary px-5 py-2.5 text-xs gap-2 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>{t.admin.customers.downloadCsvBtn}</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">{t.admin.customers.colCustomer}</th>
                        <th className="px-4 py-3 font-semibold">{t.admin.customers.colPhone}</th>
                        <th className="px-4 py-3 font-semibold">{t.admin.customers.colAddress}</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          {t.admin.customers.colOrders}
                        </th>
                        <th className="px-4 py-3 font-semibold text-right">
                          {t.admin.customers.colSpend}
                        </th>
                        <th className="px-4 py-3 font-semibold text-right">
                          {t.admin.customers.colHistory}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                            {t.admin.customers.emptyCustomers}
                          </td>
                        </tr>
                      ) : (
                        customers.map((cust) => (
                          <tr key={cust.phone} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-900">{cust.name}</td>
                            <td className="px-4 py-3 font-mono text-slate-700">{cust.phone}</td>
                            <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                              {cust.address}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                              {toLocalizedDigits(cust.orderCount, lang)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-[#0B5336] tabular-nums">
                              {formatMartPrice(cust.totalSpend, lang)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedCustomerPhone(cust.phone)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                              >
                                {t.admin.customers.viewOrdersBtn}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRINTABLE CUSTOMER INVOICE MODAL */}
      {invoiceOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50 print:hidden">
              <h2 className="font-display text-base font-bold text-slate-900">
                {t.admin.invoice.titlePrefix} · {invoiceOrder.id}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary px-3.5 py-1.5 text-xs gap-1.5 min-h-[34px]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>{t.common.print}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  aria-label={t.common.close}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
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

      {/* CUSTOMER ORDER HISTORY MODAL */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  {selectedCustomer.name}
                </h2>
                <p className="font-mono text-xs text-slate-500">{selectedCustomer.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerPhone(null)}
                aria-label={t.admin.customers.ordersModalCloseAria}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 text-xs">
              {selectedCustomer.orders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-xl border border-slate-200 p-4 space-y-1.5 bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                    <StatusLabel
                      status={ord.status}
                      label={t.orderStatuses[ord.status] || ord.status}
                    />
                  </div>
                  <div className="text-slate-600">{ord.itemsSummary}</div>
                  <div className="flex justify-between font-mono text-slate-500 pt-1">
                    <span>{formatMartDate(ord.createdAt, lang)}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatMartPrice(ord.totalAmount, lang)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
