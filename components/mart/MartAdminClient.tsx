"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Lock,
  LayoutDashboard,
  ShoppingCart,
  Package,
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
import {
  clearStoredMartAdminPass,
  createMartRecord,
  DEFAULT_MART_SETTINGS,
  deleteMartRecord,
  exportMartOrdersToCsv,
  fetchMartAdminData,
  fileToMartBase64,
  formatMartBDT,
  getStoredMartAdminPass,
  MartAdminBundle,
  MartCategory,
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

type MartAdminSection = "analytics" | "orders" | "products" | "settings" | "customers";

const MART_SESSION_KEY = "xeetrix_mart_admin_session_v1";

const ORDER_STATUSES: MartOrderStatus[] = [
  "Pending",
  "Confirmed",
  "Packaging",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function StatusLabel({ status }: { status: MartOrderStatus }) {
  const tone =
    status === "Delivered"
      ? "text-[#0B5336] font-semibold"
      : status === "Cancelled"
      ? "text-red-600 font-semibold"
      : status === "Pending"
      ? "text-gold-700 font-semibold"
      : "text-slate-800 font-semibold";
  return <span className={tone}>{status}</span>;
}

export function MartAdminClient() {
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

  // Product Form (Add or Edit)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodSku, setProdSku] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodComparePrice, setProdComparePrice] = useState("");
  const [prodStock, setProdStock] = useState("20");
  const [prodVariants, setProdVariants] = useState("");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodActive, setProdActive] = useState(true);
  const [uploadingProdImg, setUploadingProdImg] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Category Form
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImageUrl, setCatImageUrl] = useState("");
  const [uploadingCatImg, setUploadingCatImg] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

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
      const msg =
        err instanceof Error ? err.message : "Failed to sync store data from Google Sheets.";
      if (msg.toLowerCase().includes("unauthorized")) {
        handleLogout();
        setAuthError("Your admin session expired or passcode changed. Please unlock again.");
      } else {
        showNotice("error", msg);
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
      setAuthError(
        err instanceof Error ? err.message : "Invalid Mart Admin passcode. Please try again."
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
    setProdName("");
    setProdCategory("");
    setProdPrice("");
    setProdComparePrice("");
    setProdStock("20");
    setProdVariants("");
    setProdImageUrl("");
    setProdDesc("");
    setProdFeatured(false);
    setProdActive(true);
  }

  function startEditProduct(p: MartProduct) {
    setEditingProductId(p.id);
    setProdSku(p.sku || "");
    setProdName(p.name);
    setProdCategory(p.category || "");
    setProdPrice(String(p.price));
    setProdComparePrice(p.comparePrice ? String(p.comparePrice) : "");
    setProdStock(String(p.stock));
    setProdVariants(p.variants || "");
    setProdImageUrl(p.imageUrl || "");
    setProdDesc(p.description || "");
    setProdFeatured(Boolean(p.featured));
    setProdActive(Boolean(p.active));
    setActiveSection("products");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleProductImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!data?.isLiveBackend) {
      showNotice(
        "error",
        "Connect MART_SCRIPT_URL in environment variables to upload images to Google Drive."
      );
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
      showNotice("success", `Image uploaded to Google Drive (${uploaded.fileId}).`);
    } catch (err) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Failed to upload product image to Google Drive."
      );
    } finally {
      setUploadingProdImg(false);
      e.target.value = "";
    }
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.isLiveBackend) {
      showNotice("error", "Connect your Google Apps Script URL first to save products.");
      return;
    }
    if (!prodName.trim() || !prodPrice) {
      showNotice("error", "Product name and selling price are required.");
      return;
    }

    const payload = {
      sku: prodSku.trim() || `XM-${Date.now().toString().slice(-5)}`,
      name: prodName.trim(),
      category: prodCategory.trim() || "General",
      price: Number(prodPrice) || 0,
      comparePrice: Number(prodComparePrice) || 0,
      stock: Math.max(0, Number(prodStock) || 0),
      variants: prodVariants.trim(),
      imageUrl: prodImageUrl.trim(),
      description: prodDesc.trim(),
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
        showNotice("success", `Product ${editingProductId} updated in Mart_Products.`);
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
        showNotice("success", `Product ${res.id} published to Mart_Products.`);
      }
      resetProductForm();
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to save product.");
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
      showNotice(
        "success",
        `${p.name} marked ${field === "active" ? (nextVal ? "Active" : "Paused") : nextVal ? "Featured" : "Standard"}.`
      );
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to update product.");
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
      showNotice("error", err instanceof Error ? err.message : "Failed to update stock.");
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
      showNotice("success", `Product ${id} deleted from Mart_Products.`);
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to delete product.");
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
      showNotice("success", `Order ${orderId} updated to ${status}.`);
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to update order status.");
    }
  }

  async function handleCategoryImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!data?.isLiveBackend) {
      showNotice(
        "error",
        "Connect MART_SCRIPT_URL in environment variables to upload category images to Drive."
      );
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
      showNotice("success", `Category image saved to Drive (${uploaded.fileId}).`);
    } catch (err) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Failed to upload category image to Google Drive."
      );
    } finally {
      setUploadingCatImg(false);
      e.target.value = "";
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.isLiveBackend) {
      showNotice("error", "Connect Google Apps Script URL first to save categories.");
      return;
    }
    if (!catName.trim()) {
      showNotice("error", "Category name is required.");
      return;
    }

    const payload = {
      name: catName.trim(),
      slug: slugifyCategory(catName),
      description: catDesc.trim(),
      imageUrl: catImageUrl.trim(),
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
              ],
            }
          : prev
      );
      setCatName("");
      setCatDesc("");
      setCatImageUrl("");
      showNotice("success", `Category "${payload.name}" added to Mart_Categories.`);
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to create category.");
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
      showNotice("error", err instanceof Error ? err.message : "Failed to toggle category.");
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
      showNotice("success", `Category ${id} removed.`);
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to delete category.");
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.isLiveBackend) {
      showNotice("error", "Connect Google Apps Script URL first to save store settings.");
      return;
    }
    setSavingSettings(true);
    try {
      const updated = await updateMartStoreSettings(settingsForm);
      setSettingsForm(updated);
      setData((prev) => (prev ? { ...prev, settings: updated } : prev));
      showNotice("success", "Store settings & delivery charges saved to Mart_Settings.");
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to save store settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  const products = useMemo(() => data?.products || [], [data]);
  const categories = useMemo(() => data?.categories || [], [data]);
  const orders = useMemo(() => data?.orders || [], [data]);

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
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

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
        Initializing Xeetrix Mart Admin...
      </div>
    );
  }

  // Separate Mart Admin Password Gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Link href="/mart" className="inline-flex justify-center">
              <MartLogo />
            </Link>
            <h1 className="font-display text-2xl font-bold text-slate-900 pt-2">
              Store Admin Console
            </h1>
            <p className="text-sm text-slate-600">
              Sign in to manage products, inventory, orders, delivery rates, and customer analytics.
            </p>
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
                  Store Admin Passcode
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter store passcode"
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide passcode" : "Show passcode"}
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
                {authLoading ? "Verifying Passcode..." : "Unlock Store Admin"}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link href="/mart" className="inline-flex items-center gap-1.5 hover:text-[#0B5336]">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Storefront</span>
              </Link>
              <span>Independent Mart Portal</span>
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
    { id: "analytics", label: "Dashboard & KPIs", icon: LayoutDashboard },
    { id: "orders", label: "Order Management", icon: ShoppingCart },
    { id: "products", label: "Products & Inventory", icon: Package },
    { id: "settings", label: "Categories & Settings", icon: SlidersHorizontal },
    { id: "customers", label: "Customers & Reports", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Sidebar (264px) */}
      <aside className="w-full lg:w-[264px] shrink-0 bg-slate-900 text-slate-200 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/mart">
              <MartLogo inverted />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit</span>
            </button>
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
          <div className="text-xs text-slate-400">
            Store Sheet:{" "}
            <span
              className={
                data?.isLiveBackend
                  ? "text-emerald-400 font-semibold"
                  : "text-gold-400 font-semibold"
              }
            >
              {data?.isLiveBackend ? "Connected Live" : "Not Connected"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/mart"
              className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-center text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              View Store
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              Xeetrix Mart Admin /{" "}
              <span className="text-slate-900 font-medium">
                {navItems.find((n) => n.id === activeSection)?.label}
              </span>
            </div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              {navItems.find((n) => n.id === activeSection)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => exportMartOrdersToCsv(orders)}
              disabled={orders.length === 0}
              className="btn-outline px-4 py-2 text-xs gap-2 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={loadMartDashboard}
              disabled={loading}
              className="btn-primary px-4 py-2 text-xs gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Syncing..." : "Refresh Store"}</span>
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
              <button type="button" onClick={() => setToast(null)} className="text-xs underline ml-4">
                Dismiss
              </button>
            </div>
          </div>
        )}

        <main className="p-6 space-y-8 flex-1">
          {!data?.isLiveBackend && !loading && (
            <div className="rounded-xl border border-gold-200 bg-gold-50 px-5 py-4 text-xs text-gold-900">
              <strong>Standalone Backend Setup Required:</strong> Deploy{" "}
              <span className="font-mono">backend/mart/Code.gs</span> inside your Google Sheet (run{" "}
              <span className="font-mono">setupMartBackend</span>), then configure{" "}
              <span className="font-mono">MART_SCRIPT_URL</span> in Vercel Environment Variables so
              products, categories, orders, and Google Drive images sync live.
            </div>
          )}

          {/* 1. DASHBOARD ANALYTICS & KPIs */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">Total Revenue (Active)</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {formatMartBDT(analytics.totalRevenue)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tabular-nums">
                    Across {orders.filter((o) => o.status !== "Cancelled").length} valid orders
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">Today&apos;s Orders</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-[#0B5336] tabular-nums">
                    {analytics.todaysOrders}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tabular-nums">
                    {orders.length} all-time orders recorded
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">Pending &amp; Active</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-gold-600 tabular-nums">
                    {analytics.pendingOrders}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Pending, Confirmed &amp; Packaging
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">Delivered Orders</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {analytics.deliveredOrders}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tabular-nums">
                    {products.length} catalog SKUs · {categories.length} categories
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Order Pipeline Summary */}
                <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Order Fulfillment Overview
                  </h2>
                  <div className="space-y-3">
                    {ORDER_STATUSES.map((status) => {
                      const count = analytics.statusCounts[status];
                      const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">{status}</span>
                            <span className="font-mono text-slate-600 tabular-nums">
                              {count} ({pct}%)
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
                      <span>Low-Stock Alerts (≤ 5 units)</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveSection("products")}
                      className="text-xs font-semibold text-[#0B5336] hover:underline"
                    >
                      Manage Inventory
                    </button>
                  </div>

                  {analytics.lowStockProducts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      {products.length === 0
                        ? "No products added yet. Head to Products & Inventory to publish your first item."
                        : "All products have healthy stock levels."}
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {analytics.lowStockProducts.slice(0, 6).map((p) => (
                        <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                            <div className="font-mono text-[11px] text-slate-400">
                              SKU: {p.sku || p.id}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`font-mono font-bold tabular-nums ${
                                p.stock === 0 ? "text-red-600" : "text-gold-700"
                              }`}
                            >
                              {p.stock} left
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(p, 5)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold hover:bg-slate-50"
                            >
                              +5 Stock
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
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order ID, customer, phone..."
                    className="input pl-10 text-xs"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Order ID &amp; Date</th>
                        <th className="px-4 py-3 font-semibold">Customer &amp; Delivery</th>
                        <th className="px-4 py-3 font-semibold">Ordered Items</th>
                        <th className="px-4 py-3 font-semibold">Payment</th>
                        <th className="px-4 py-3 font-semibold text-right">Total</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                            No orders match your filter. Orders placed at /mart appear here live.
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
                                  {order.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString()
                                    : ""}
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
                                    Note: {order.notes}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 max-w-xs">
                                {parsedItems.length > 0 ? (
                                  <ul className="space-y-0.5 text-slate-700">
                                    {parsedItems.map((it, idx) => (
                                      <li key={idx}>
                                        {it.name}
                                        {it.variant ? ` (${it.variant})` : ""}{" "}
                                        <span className="font-mono text-slate-500">
                                          × {it.quantity}
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
                                    TrxID: {order.transactionId}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-mono tabular-nums">
                                <div className="font-bold text-slate-900">
                                  {formatMartBDT(order.totalAmount)}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  Del: {formatMartBDT(order.deliveryCharge)}
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
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setInvoiceOrder(order)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336]"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                  <span>Invoice</span>
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

          {/* 3. PRODUCTS & INVENTORY MANAGEMENT */}
          {activeSection === "products" && (
            <div className="space-y-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#0B5336]" />
                    <span>
                      {editingProductId
                        ? `Edit Product (${editingProductId})`
                        : "Add New Product to Mart_Products"}
                    </span>
                  </h2>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="e.g. Wireless Noise-Canceling Headphones"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        SKU Code
                      </label>
                      <input
                        type="text"
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value.toUpperCase())}
                        placeholder="e.g. XM-AUD-001"
                        className="input font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Category *
                      </label>
                      <input
                        type="text"
                        list="mart-category-options"
                        required
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        placeholder="Select or type category"
                        className="input"
                      />
                      <datalist id="mart-category-options">
                        {categories.map((c) => (
                          <option key={c.id} value={c.name} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Stock Quantity *
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Selling / Discount Price (BDT ৳) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="2450"
                        className="input font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Regular Price (BDT ৳)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={prodComparePrice}
                        onChange={(e) => setProdComparePrice(e.target.value)}
                        placeholder="3000"
                        className="input font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Variants / Sizes (Comma-separated, Optional)
                      </label>
                      <input
                        type="text"
                        value={prodVariants}
                        onChange={(e) => setProdVariants(e.target.value)}
                        placeholder="e.g. Matte Black, Silver or M, L, XL"
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    <div className="lg:col-span-8">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Product Image URL (Auto-filled on Google Drive Upload)
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
                          {uploadingProdImg ? "Uploading to Drive..." : "Upload Image to Drive"}
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Product Description
                    </label>
                    <textarea
                      rows={2}
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder="Detailed specifications, materials, warranty terms..."
                      className="input min-h-[76px] py-2"
                    />
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
                        <span>Visible in Storefront</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prodFeatured}
                          onChange={(e) => setProdFeatured(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0B5336]"
                        />
                        <span>Featured Product</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProduct}
                      className="btn-primary px-6 py-2.5 text-xs"
                    >
                      {savingProduct
                        ? "Saving Product..."
                        : editingProductId
                        ? "Save Product Changes"
                        : "Publish Product"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Catalog Table */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Inventory Catalog ({filteredProducts.length})
                  </h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Filter SKU, name, category..."
                      className="input min-h-[38px] py-1.5 pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Product &amp; SKU</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold text-right">Price</th>
                        <th className="px-4 py-3 font-semibold text-center">Stock</th>
                        <th className="px-4 py-3 font-semibold">Flags</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                            No products in Mart_Products yet. Use the form above to add your first
                            SKU.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                  {p.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={normalizeMartImageUrl(p.imageUrl)}
                                      alt={p.name}
                                      referrerPolicy="no-referrer"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : null}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{p.name}</div>
                                  <div className="font-mono text-[11px] text-slate-400">
                                    {p.sku || p.id}
                                    {p.variants ? ` · ${p.variants}` : ""}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{p.category}</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums">
                              <div className="font-bold text-slate-900">
                                {formatMartBDT(p.price)}
                              </div>
                              {p.comparePrice > p.price && (
                                <div className="text-[11px] text-slate-400 line-through">
                                  {formatMartBDT(p.comparePrice)}
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
                                  {p.stock}
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
                                  className={`rounded-lg px-2 py-1 text-[11px] font-semibold border ${
                                    p.active
                                      ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                                      : "border-slate-200 bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {p.active ? "Active" : "Paused"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductField(p, "featured")}
                                  title="Toggle Featured"
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
                                  className="inline-flex items-center gap-1 text-slate-700 hover:text-[#0B5336] font-medium"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
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

          {/* 4. CATEGORIES & STORE SETTINGS */}
          {activeSection === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Categories Panel */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Add Store Category (Mart_Categories)
                  </h2>
                  <form onSubmit={handleCreateCategory} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        placeholder="e.g. Electronics, Home Essentials"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={catDesc}
                        onChange={(e) => setCatDesc(e.target.value)}
                        placeholder="Brief category subtitle"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category Image URL (Auto-filled on Drive Upload)
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
                          <span>{uploadingCatImg ? "Uploading..." : "Drive Upload"}</span>
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
                      {savingCategory ? "Creating Category..." : "Create Category"}
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      Categories ({categories.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {categories.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No categories created yet.
                      </div>
                    ) : (
                      categories.map((cat) => (
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
                                  alt={cat.name}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">
                                {cat.name}
                              </div>
                              <div className="font-mono text-[11px] text-slate-400 truncate">
                                /{cat.slug}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleCategory(cat)}
                              className={`rounded-lg px-2 py-1 text-[11px] font-semibold border ${
                                cat.active
                                  ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                                  : "border-slate-200 bg-slate-100 text-slate-500"
                              }`}
                            >
                              {cat.active ? "Active" : "Hidden"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              aria-label={`Delete ${cat.name}`}
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

              {/* Storefront Banner & Delivery Charges */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-5 h-fit">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Storefront Hero &amp; Delivery Settings (Mart_Settings)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Control live promotional banners, delivery fees, and mobile banking instructions.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Top Announcement Banner Text
                    </label>
                    <input
                      type="text"
                      value={settingsForm.promoText}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, promoText: e.target.value })
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hero Headline
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroTitle}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroTitle: e.target.value })
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hero Subtitle
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.heroSubtitle}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })
                      }
                      className="input min-h-[72px] py-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hero CTA Text
                      </label>
                      <input
                        type="text"
                        value={settingsForm.heroCtaText}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, heroCtaText: e.target.value })
                        }
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Inside Dhaka Charge (৳)
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
                        Outside Dhaka Charge (৳)
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
                      Mobile Banking Merchant / Receiver Number (Optional)
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
                      placeholder="e.g. 017XXXXXXXX (bKash / Nagad Personal or Merchant)"
                      className="input font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="btn-primary px-6 py-2.5 text-xs"
                  >
                    {savingSettings ? "Saving Settings..." : "Save Store Settings"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 5. CUSTOMER CRM & SALES REPORT */}
          {activeSection === "customers" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Customer CRM &amp; Sales Export
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unique buyers aggregated from Mart_Orders with lifetime BDT spend and CSV
                    download.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => exportMartOrdersToCsv(orders)}
                  disabled={orders.length === 0}
                  className="btn-primary px-5 py-2.5 text-xs gap-2 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Sales Report (CSV)</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Customer</th>
                        <th className="px-4 py-3 font-semibold">Phone</th>
                        <th className="px-4 py-3 font-semibold">Latest Delivery Address</th>
                        <th className="px-4 py-3 font-semibold text-right">Orders</th>
                        <th className="px-4 py-3 font-semibold text-right">Total Spend</th>
                        <th className="px-4 py-3 font-semibold text-right">History</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                            No customer records yet. Completed checkout orders appear here.
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
                              {cust.orderCount}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-[#0B5336] tabular-nums">
                              {formatMartBDT(cust.totalSpend)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedCustomerPhone(cust.phone)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336]"
                              >
                                View Orders
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
                Order Invoice · {invoiceOrder.id}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary px-3.5 py-1.5 text-xs gap-1.5 min-h-[34px]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
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
                    Email: mart@xeetrix.com · Helpline: +880 965 803 6631
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-slate-900">
                    {invoiceOrder.id}
                  </div>
                  <div className="text-slate-500">
                    {invoiceOrder.createdAt
                      ? new Date(invoiceOrder.createdAt).toLocaleString()
                      : ""}
                  </div>
                  <div className="mt-1">
                    Status: <StatusLabel status={invoiceOrder.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-500 font-semibold mb-1">Bill / Ship To</div>
                  <div className="font-semibold text-slate-900">{invoiceOrder.customerName}</div>
                  <div className="font-mono text-slate-700">{invoiceOrder.phone}</div>
                  <div className="text-slate-600 mt-0.5">{invoiceOrder.address}</div>
                </div>
                <div className="sm:text-right">
                  <div className="text-slate-500 font-semibold mb-1">Fulfillment &amp; Payment</div>
                  <div>Area: {invoiceOrder.deliveryArea}</div>
                  <div>Payment: {invoiceOrder.paymentMethod}</div>
                  {invoiceOrder.transactionId && (
                    <div className="font-mono">TrxID: {invoiceOrder.transactionId}</div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2 font-semibold">Item</th>
                      <th className="py-2 font-semibold text-center">Qty</th>
                      <th className="py-2 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parseOrderItems(invoiceOrder.itemsJson).length > 0 ? (
                      parseOrderItems(invoiceOrder.itemsJson).map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2">
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            {item.variant && (
                              <div className="text-slate-500">{item.variant}</div>
                            )}
                          </td>
                          <td className="py-2 text-center font-mono tabular-nums">
                            {item.quantity}
                          </td>
                          <td className="py-2 text-right font-mono font-semibold tabular-nums">
                            {formatMartBDT(item.lineTotal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2">{invoiceOrder.itemsSummary}</td>
                        <td className="py-2 text-center font-mono">{invoiceOrder.totalItems}</td>
                        <td className="py-2 text-right font-mono">
                          {formatMartBDT(invoiceOrder.subtotal)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">
                    {formatMartBDT(invoiceOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery ({invoiceOrder.deliveryArea})</span>
                  <span className="font-mono tabular-nums">
                    {formatMartBDT(invoiceOrder.deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="font-mono text-[#0B5336] tabular-nums">
                    {formatMartBDT(invoiceOrder.totalAmount)}
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
                    <StatusLabel status={ord.status} />
                  </div>
                  <div className="text-slate-600">{ord.itemsSummary}</div>
                  <div className="flex justify-between font-mono text-slate-500 pt-1">
                    <span>
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : ""}
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatMartBDT(ord.totalAmount)}
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
