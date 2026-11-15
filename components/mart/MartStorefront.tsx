"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Banknote,
  ShieldCheck,
  RotateCcw,
  ShoppingCart,
  Eye,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowRight,
  Phone,
  Mail,
  Printer,
  PackageSearch,
  Clock,
  Check,
} from "lucide-react";
import { MartHeader } from "./MartHeader";
import { MartFooter } from "./MartFooter";
import {
  DEFAULT_MART_SETTINGS,
  fetchMartPublicData,
  formatMartBDT,
  getCachedMartPublicSnapshot,
  MART_CONTACT_EMAIL,
  MART_CONTACT_PHONE,
  MART_CONTACT_TEL,
  MartCategory,
  MartDeliveryArea,
  MartOrder,
  MartOrderItem,
  MartOrderStatus,
  MartPaymentMethod,
  MartProduct,
  MartSettings,
  normalizeMartImageUrl,
  parseOrderItems,
  parseProductVariants,
  placeMartOrder,
  trackMartOrder,
} from "@/lib/martApi";

const CART_STORAGE_KEY = "xeetrix_mart_cart_v1";

interface CartItem {
  key: string;
  productId: string;
  sku: string;
  name: string;
  variant: string;
  unitPrice: number;
  maxStock: number;
  imageUrl: string;
  quantity: number;
}

type SortOption = "featured" | "price_asc" | "price_desc" | "newest";

function ProductMedia({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const resolved = normalizeMartImageUrl(src);

  if (!resolved || failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400 p-6 text-center ${className}`}
      >
        <Package className="h-10 w-10 text-slate-300 mb-2" />
        <span className="text-xs font-medium text-slate-500 line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

const ORDER_STEPS: MartOrderStatus[] = [
  "Pending",
  "Confirmed",
  "Packaging",
  "Shipped",
  "Delivered",
];

export function MartStorefront() {
  const [products, setProducts] = useState<MartProduct[]>([]);
  const [categories, setCategories] = useState<MartCategory[]>([]);
  const [settings, setSettings] = useState<MartSettings>(DEFAULT_MART_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Cart & Drawer State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedBanner, setAddedBanner] = useState<string | null>(null);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<MartProduct | null>(null);
  const [quickViewVariant, setQuickViewVariant] = useState("");
  const [quickViewQty, setQuickViewQty] = useState(1);

  // Checkout State
  const [deliveryArea, setDeliveryArea] = useState<MartDeliveryArea>("Inside Dhaka");
  const [paymentMethod, setPaymentMethod] = useState<MartPaymentMethod>("Cash on Delivery");
  const [mobileChannel, setMobileChannel] = useState("bKash");
  const [transactionId, setTransactionId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedInvoice, setConfirmedInvoice] = useState<{
    orderId: string;
    customerName: string;
    phone: string;
    address: string;
    deliveryArea: MartDeliveryArea;
    deliveryCharge: number;
    subtotal: number;
    totalAmount: number;
    paymentMethod: string;
    transactionId: string;
    items: MartOrderItem[];
    createdAt: string;
  } | null>(null);

  // Track Order Modal State
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<MartOrder | null>(null);

  // Hydrate Storefront Live Data (Instant SWR Snapshot Cache + Proxy Revalidation, Zero Dummy Data)
  useEffect(() => {
    let mounted = true;
    const cached = getCachedMartPublicSnapshot();
    if (cached) {
      setProducts(cached.products);
      setCategories(cached.categories);
      setSettings(cached.settings);
      setLoading(false);
    }

    fetchMartPublicData()
      .then((res) => {
        if (!mounted) return;
        setProducts(res.products);
        setCategories(res.categories);
        setSettings(res.settings);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Hydrate Local Cart
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCart(parsed as CartItem[]);
        }
      }
    } catch {
      // Ignore storage access restrictions
    }
    setCartHydrated(true);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota issues
    }
  }, [cart, cartHydrated]);

  const categoryTabs = useMemo(() => {
    const fromCategoriesTab = categories.map((c) => c.name).filter(Boolean);
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    const merged = Array.from(new Set([...fromCategoriesTab, ...fromProducts]));
    return ["All", ...merged];
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      const catOk = selectedCategory === "All" || p.category === selectedCategory;
      const searchOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return catOk && searchOk;
    });

    if (sortBy === "price_asc") {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price_desc") {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "newest") {
      return [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    // featured first
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [products, selectedCategory, searchQuery, sortBy]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const insideDhakaFee = Math.max(0, Number(settings.insideDhakaCharge) || 70);
  const outsideDhakaFee = Math.max(0, Number(settings.outsideDhakaCharge) || 130);
  const deliveryFee =
    cart.length === 0
      ? 0
      : deliveryArea === "Inside Dhaka"
      ? insideDhakaFee
      : outsideDhakaFee;
  const grandTotal = cartSubtotal + deliveryFee;

  function addToCart(product: MartProduct, variantChoice = "", qtyToAdd = 1, openDrawer = false) {
    if (product.stock <= 0) return;
    const variants = parseProductVariants(product.variants);
    const chosenVariant = variantChoice || (variants.length > 0 ? variants[0] : "");
    const itemKey = `${product.id}__${chosenVariant}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.key === itemKey);
      if (existing) {
        return prev.map((i) =>
          i.key === itemKey
            ? { ...i, quantity: Math.min(Math.max(1, product.stock), i.quantity + qtyToAdd) }
            : i
        );
      }
      return [
        ...prev,
        {
          key: itemKey,
          productId: product.id,
          sku: product.sku,
          name: product.name,
          variant: chosenVariant,
          unitPrice: product.price,
          maxStock: Math.max(1, product.stock),
          imageUrl: product.imageUrl,
          quantity: Math.min(Math.max(1, product.stock), qtyToAdd),
        },
      ];
    });

    setConfirmedInvoice(null);
    setAddedBanner(`${product.name} added to cart`);
    setTimeout(() => {
      setAddedBanner((prev) => (prev === `${product.name} added to cart` ? null : prev));
    }, 3000);

    if (openDrawer) {
      setCartOpen(true);
    }
  }

  function updateCartQuantity(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.key !== key) return item;
          const next = item.quantity + delta;
          if (next <= 0) return null;
          return { ...item, quantity: Math.min(item.maxStock, next) };
        })
        .filter((x): x is CartItem => x !== null)
    );
  }

  function removeCartItem(key: string) {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }

  function openQuickView(product: MartProduct) {
    const variants = parseProductVariants(product.variants);
    setQuickViewProduct(product);
    setQuickViewVariant(variants.length > 0 ? variants[0] : "");
    setQuickViewQty(1);
  }

  async function handleCheckoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCheckoutError(null);

    if (cart.length === 0) {
      setCheckoutError("Your shopping cart is empty.");
      return;
    }
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setCheckoutError("Please enter your full name, phone number, and delivery address.");
      return;
    }

    const orderItems: MartOrderItem[] = cart.map((item) => ({
      productId: item.productId,
      sku: item.sku,
      name: item.name,
      variant: item.variant,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.unitPrice * item.quantity,
      imageUrl: item.imageUrl,
    }));

    const paymentLabel =
      paymentMethod === "Mobile Banking"
        ? `Mobile Banking (${mobileChannel})`
        : "Cash on Delivery";

    setSubmittingOrder(true);
    try {
      const res = await placeMartOrder({
        items: orderItems,
        subtotal: cartSubtotal,
        deliveryArea,
        deliveryCharge: deliveryFee,
        totalAmount: grandTotal,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        paymentMethod,
        transactionId: paymentMethod === "Mobile Banking" ? transactionId.trim() : "",
        notes:
          paymentMethod === "Mobile Banking" && mobileChannel
            ? `[${mobileChannel}] ${notes.trim()}`.trim()
            : notes.trim(),
      });

      setConfirmedInvoice({
        orderId: res.id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryArea,
        deliveryCharge: deliveryFee,
        subtotal: cartSubtotal,
        totalAmount: grandTotal,
        paymentMethod: paymentLabel,
        transactionId: paymentMethod === "Mobile Banking" ? transactionId.trim() : "",
        items: orderItems,
        createdAt: new Date().toISOString(),
      });

      // Reset cart & form
      setCart([]);
      setCustomerName("");
      setPhone("");
      setAddress("");
      setNotes("");
      setTransactionId("");

      // Sync updated product stock immediately in background
      fetchMartPublicData(true)
        .then((fresh) => {
          setProducts(fresh.products);
          setCategories(fresh.categories);
          setSettings(fresh.settings);
        })
        .catch(() => {});
    } catch (err) {
      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Order could not be placed. Please try again or call +880 965 803 6631."
      );
    } finally {
      setSubmittingOrder(false);
    }
  }

  async function handleTrackOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTrackingError(null);
    setTrackedOrder(null);
    if (!trackOrderId.trim() || !trackPhone.trim()) {
      setTrackingError("Please enter both your Order ID and phone number.");
      return;
    }

    setTrackingLoading(true);
    try {
      const order = await trackMartOrder(trackOrderId.trim(), trackPhone.trim());
      setTrackedOrder(order);
    } catch (err) {
      setTrackingError(
        err instanceof Error ? err.message : "Unable to retrieve order status right now."
      );
    } finally {
      setTrackingLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Slim Top Promo Bar (<= 40px) */}
      {settings.promoText && (
        <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>{settings.promoText}</span>
            <span aria-hidden="true" className="text-slate-500 hidden sm:inline">
              ·
            </span>
            <a
              href={MART_CONTACT_TEL}
              className="font-mono text-gold-400 hover:text-white transition-colors tabular-nums hidden sm:inline"
            >
              Helpline: {MART_CONTACT_PHONE}
            </a>
          </div>
        </div>
      )}

      {/* Standalone Mart Header */}
      <MartHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categoryTabs}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenTrackOrder={() => {
          setTrackOpen(true);
          setTrackingError(null);
        }}
      />

      {/* Cart Feedback Toast */}
      {addedBanner && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 shadow-elevated">
          <CheckCircle2 className="h-4 w-4 text-[#0B5336] shrink-0" />
          <span>{addedBanner}</span>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="text-[#0B5336] underline font-bold ml-1"
          >
            View Cart
          </button>
        </div>
      )}

      <main className="flex-1">
        {/* Promotional Hero Section */}
        <section className="bg-slate-900 text-white border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                  Xeetrix Mart · Official Online Store
                </div>
                <h1
                  className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]"
                  style={{ textWrap: "balance" }}
                >
                  {settings.heroTitle}
                </h1>
                <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
                  {settings.heroSubtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#mart-catalog"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0B5336] px-6 py-3 text-sm font-semibold text-white hover:bg-[#08412A] transition-colors"
                  >
                    <span>{settings.heroCtaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackOpen(true);
                      setTrackingError(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    <PackageSearch className="h-4 w-4 text-gold-400" />
                    <span>Track Existing Order</span>
                  </button>
                </div>
              </div>

              {/* Delivery Charge Transparent Summary Box */}
              <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-gold-400">
                  Transparent Delivery Rates
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="text-slate-300">Inside Dhaka Metro</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {formatMartBDT(insideDhakaFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="text-slate-300">Outside Dhaka (Nationwide)</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {formatMartBDT(outsideDhakaFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Direct Store Helpline</span>
                    <a
                      href={MART_CONTACT_TEL}
                      className="font-mono font-semibold text-emerald-300 hover:text-white tabular-nums"
                    >
                      {MART_CONTACT_PHONE}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges Strip */}
        <section className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Fast Delivery</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    24–48h inside Dhaka, 2–4 days nationwide
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Cash on Delivery (COD)
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Pay at doorstep or via Mobile Banking
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    100% Authentic Products
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Quality checked prior to courier dispatch
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Easy Return</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    7-day hassle-free replacement policy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Store Catalog Section */}
        <section id="mart-catalog" className="py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl">
                {categoryTabs.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                      selectedCategory === cat
                        ? "bg-[#0B5336] text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
                  {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort products"
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0B5336] min-h-[40px]"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Sort: Newest First</option>
                </select>
              </div>
            </div>

            {/* Catalog Loading / Empty / Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="h-[420px] rounded-2xl border border-slate-200 bg-white animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Zero Dummy Data — Clean Empty Storefront State */
              <div className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-16 text-center max-w-3xl mx-auto space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[#0B5336]">
                  <Package className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                    Store Launching Soon
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    New Products Arriving Soon
                  </h2>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    Our curated catalog is currently being stocked with verified essentials and
                    electronics. Please check back shortly or reach out directly for wholesale and
                    early order inquiries.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`mailto:${MART_CONTACT_EMAIL}`}
                    className="btn-outline px-5 py-2.5 text-xs gap-2"
                  >
                    <Mail className="h-4 w-4 text-[#0B5336]" />
                    <span>{MART_CONTACT_EMAIL}</span>
                  </a>
                  <a
                    href={MART_CONTACT_TEL}
                    className="btn-primary px-5 py-2.5 text-xs gap-2 font-mono tabular-nums"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{MART_CONTACT_PHONE}</span>
                  </a>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
                <Package className="h-10 w-10 text-slate-300 mx-auto" />
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  No Matching Products Found
                </h2>
                <p className="text-sm text-slate-500">
                  Try clearing your search query or selecting another category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const hasDiscount =
                    product.comparePrice > 0 && product.comparePrice > product.price;
                  const outOfStock = product.stock <= 0;
                  const variants = parseProductVariants(product.variants);

                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => openQuickView(product)}
                          className="block w-full aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100 text-left"
                        >
                          <ProductMedia
                            src={product.imageUrl}
                            alt={product.name}
                            className="transition-transform duration-200 group-hover:scale-[1.03]"
                          />
                        </button>

                        <div className="p-6 space-y-2.5">
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                            <span className="font-semibold uppercase tracking-wider text-[#0B5336] truncate">
                              {product.category || "General"}
                              {product.featured ? " · Featured" : ""}
                            </span>
                            <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
                              {outOfStock ? "Out of stock" : `${product.stock} in stock`}
                            </span>
                          </div>

                          <h2 className="font-display text-lg font-semibold text-slate-900 leading-snug">
                            <button
                              type="button"
                              onClick={() => openQuickView(product)}
                              className="text-left hover:text-[#0B5336] transition-colors"
                            >
                              {product.name}
                            </button>
                          </h2>

                          {variants.length > 0 && (
                            <div className="text-xs text-slate-500">
                              Options: {variants.join(" · ")}
                            </div>
                          )}

                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                              {formatMartBDT(product.price)}
                            </span>
                            {hasDiscount && (
                              <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                                {formatMartBDT(product.comparePrice)}
                              </span>
                            )}
                          </div>
                          {product.sku && (
                            <div className="font-mono text-[11px] text-slate-400">
                              SKU: {product.sku}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openQuickView(product)}
                            aria-label={`Quick view ${product.name}`}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:border-[#0B5336] hover:text-[#0B5336] transition-colors min-h-[40px] min-w-[40px]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            disabled={outOfStock}
                            onClick={() => addToCart(product, "", 1, false)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B5336] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#08412A] disabled:opacity-50 transition-colors min-h-[40px] whitespace-nowrap"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>{outOfStock ? "Sold Out" : "Add to Cart"}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <MartFooter
        onOpenTrackOrder={() => {
          setTrackOpen(true);
          setTrackingError(null);
        }}
      />

      {/* PRODUCT QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="text-xs font-semibold text-slate-500">
                {quickViewProduct.category}
                {quickViewProduct.sku ? ` · SKU ${quickViewProduct.sku}` : ""}
              </div>
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                aria-label="Close product quick view"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6 aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                <ProductMedia src={quickViewProduct.imageUrl} alt={quickViewProduct.name} />
              </div>

              <div className="md:col-span-6 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <h2
                    id="quick-view-title"
                    className="font-display text-2xl font-bold text-slate-900 leading-snug"
                  >
                    {quickViewProduct.name}
                  </h2>

                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-2xl font-bold text-[#0B5336] tabular-nums">
                      {formatMartBDT(quickViewProduct.price)}
                    </span>
                    {quickViewProduct.comparePrice > quickViewProduct.price && (
                      <span className="font-mono text-sm text-slate-400 line-through tabular-nums">
                        {formatMartBDT(quickViewProduct.comparePrice)}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono text-slate-600 tabular-nums">
                    Availability:{" "}
                    <span
                      className={
                        quickViewProduct.stock > 0
                          ? "font-semibold text-[#0B5336]"
                          : "font-semibold text-red-600"
                      }
                    >
                      {quickViewProduct.stock > 0
                        ? `${quickViewProduct.stock} units in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed pt-1">
                    {quickViewProduct.description || "Verified product from Xeetrix Mart."}
                  </p>

                  {parseProductVariants(quickViewProduct.variants).length > 0 && (
                    <div className="pt-2 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Select Variant / Size
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {parseProductVariants(quickViewProduct.variants).map((variant) => (
                          <button
                            key={variant}
                            type="button"
                            onClick={() => setQuickViewVariant(variant)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                              quickViewVariant === variant
                                ? "border-[#0B5336] bg-[#0B5336] text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {variant}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Quantity</span>
                    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="p-2 text-slate-600 hover:text-slate-900"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center font-mono text-sm font-bold tabular-nums">
                        {quickViewQty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuickViewQty((q) =>
                            Math.min(Math.max(1, quickViewProduct.stock), q + 1)
                          )
                        }
                        aria-label="Increase quantity"
                        className="p-2 text-slate-600 hover:text-slate-900"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={quickViewProduct.stock <= 0}
                      onClick={() => {
                        addToCart(quickViewProduct, quickViewVariant, quickViewQty, false);
                        setQuickViewProduct(null);
                      }}
                      className="btn-outline py-3 text-xs gap-1.5 disabled:opacity-50"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      type="button"
                      disabled={quickViewProduct.stock <= 0}
                      onClick={() => {
                        addToCart(quickViewProduct, quickViewVariant, quickViewQty, true);
                        setQuickViewProduct(null);
                      }}
                      className="btn-primary py-3 text-xs disabled:opacity-50"
                    >
                      {quickViewProduct.stock <= 0 ? "Sold Out" : "Buy Now"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER CART & MULTI-PRODUCT CHECKOUT DRAWER */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
        >
          <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 id="cart-drawer-title" className="font-display text-lg font-bold text-slate-900">
                  {confirmedInvoice ? "Order Invoice" : `Shopping Cart (${cartCount})`}
                </h2>
                <p className="text-xs text-slate-500">
                  {confirmedInvoice
                    ? `Reference: ${confirmedInvoice.orderId}`
                    : "Review items & complete delivery checkout"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart drawer"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {confirmedInvoice ? (
                /* Post-Order Printable Invoice Summary */
                <div className="space-y-5">
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#0B5336] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Order Placed Successfully
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Save your Order ID below to track live fulfillment status anytime.
                      </p>
                    </div>
                  </div>

                  <div
                    id="mart-customer-invoice"
                    className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="font-display text-base font-bold text-slate-900">
                          Xeetrix Mart Invoice
                        </div>
                        <div className="text-slate-500">
                          {new Date(confirmedInvoice.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-500">Order ID</div>
                        <div className="font-mono text-sm font-bold text-[#0B5336]">
                          {confirmedInvoice.orderId}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {confirmedInvoice.customerName}
                        </div>
                        <div className="font-mono">{confirmedInvoice.phone}</div>
                        <div className="text-slate-600 mt-0.5">{confirmedInvoice.address}</div>
                      </div>
                      <div className="sm:text-right">
                        <div>
                          Delivery:{" "}
                          <span className="font-semibold">{confirmedInvoice.deliveryArea}</span>
                        </div>
                        <div>
                          Payment:{" "}
                          <span className="font-semibold">{confirmedInvoice.paymentMethod}</span>
                        </div>
                        {confirmedInvoice.transactionId && (
                          <div className="font-mono text-slate-600">
                            TrxID: {confirmedInvoice.transactionId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3 space-y-2">
                      {confirmedInvoice.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-semibold text-slate-900">{item.name}</span>
                            {item.variant && (
                              <span className="text-slate-500"> ({item.variant})</span>
                            )}
                            <span className="font-mono text-slate-500"> × {item.quantity}</span>
                          </div>
                          <span className="font-mono font-semibold text-slate-900 tabular-nums">
                            {formatMartBDT(item.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200 pt-3 space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-mono tabular-nums">
                          {formatMartBDT(confirmedInvoice.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery ({confirmedInvoice.deliveryArea})</span>
                        <span className="font-mono tabular-nums">
                          {formatMartBDT(confirmedInvoice.deliveryCharge)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-100">
                        <span>Total Payable</span>
                        <span className="font-mono text-[#0B5336] tabular-nums">
                          {formatMartBDT(confirmedInvoice.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="btn-outline py-2.5 text-xs gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackOrderId(confirmedInvoice.orderId);
                        setTrackPhone(confirmedInvoice.phone);
                        setCartOpen(false);
                        setTrackOpen(true);
                      }}
                      className="btn-primary py-2.5 text-xs gap-2"
                    >
                      <PackageSearch className="h-4 w-4" />
                      <span>Track Order Status</span>
                    </button>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto" />
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      Your Cart Is Empty
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Add products from the catalog to calculate delivery charges and check out.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="btn-primary px-6 py-2.5 text-xs"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-3 bg-white"
                      >
                        <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          <ProductMedia src={item.imageUrl} alt={item.name} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.variant ? `${item.variant} · ` : ""}
                            <span className="font-mono tabular-nums">
                              {formatMartBDT(item.unitPrice)} each
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.key, -1)}
                                aria-label="Decrease item quantity"
                                className="p-1.5 text-slate-600 hover:text-slate-900"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center font-mono text-xs font-bold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.key, 1)}
                                aria-label="Increase item quantity"
                                className="p-1.5 text-slate-600 hover:text-slate-900"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                                {formatMartBDT(item.unitPrice * item.quantity)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeCartItem(item.key)}
                                aria-label={`Remove ${item.name}`}
                                className="text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-4 border-t border-slate-200">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Delivery &amp; Payment Details
                    </h3>

                    {checkoutError && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{checkoutError}</span>
                      </div>
                    )}

                    {/* Delivery Area */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Delivery Area *
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(["Inside Dhaka", "Outside Dhaka"] as MartDeliveryArea[]).map((area) => {
                          const fee = area === "Inside Dhaka" ? insideDhakaFee : outsideDhakaFee;
                          const selected = deliveryArea === area;
                          return (
                            <button
                              key={area}
                              type="button"
                              onClick={() => setDeliveryArea(area)}
                              className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                                selected
                                  ? "border-[#0B5336] bg-brand-50 text-[#0B5336]"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              <div className="text-xs font-semibold">{area}</div>
                              <div className="font-mono text-[11px] opacity-80 tabular-nums">
                                Charge: {formatMartBDT(fee)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Customer name"
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="input font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Delivery Address *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House, Road, Area, Thana, District"
                        className="input min-h-[72px] py-2"
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Payment Method *
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(["Cash on Delivery", "Mobile Banking"] as MartPaymentMethod[]).map(
                          (method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setPaymentMethod(method)}
                              className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                                paymentMethod === method
                                  ? "border-[#0B5336] bg-brand-50 text-[#0B5336]"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              {method}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {paymentMethod === "Mobile Banking" && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                        {settings.mobileBankingNumber && (
                          <div className="text-xs text-slate-700">
                            Send payment via bKash / Nagad / Rocket to:{" "}
                            <span className="font-mono font-bold text-[#0B5336]">
                              {settings.mobileBankingNumber}
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Channel
                            </label>
                            <select
                              value={mobileChannel}
                              onChange={(e) => setMobileChannel(e.target.value)}
                              className="input min-h-[40px] py-1.5 text-xs"
                            >
                              <option value="bKash">bKash</option>
                              <option value="Nagad">Nagad</option>
                              <option value="Rocket">Rocket</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Transaction ID (Optional)
                            </label>
                            <input
                              type="text"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              placeholder="e.g. TXN8A92K1"
                              className="input min-h-[40px] py-1.5 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Order Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Delivery instructions or landmark"
                        className="input"
                      />
                    </div>

                    {/* Totals Summary */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Items Subtotal</span>
                        <span className="font-mono font-semibold tabular-nums">
                          {formatMartBDT(cartSubtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery Charge ({deliveryArea})</span>
                        <span className="font-mono font-semibold tabular-nums">
                          {formatMartBDT(deliveryFee)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>Total Payable</span>
                        <span className="font-mono text-base text-[#0B5336] tabular-nums">
                          {formatMartBDT(grandTotal)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="btn-primary w-full py-3.5 text-sm disabled:opacity-60"
                    >
                      {submittingOrder
                        ? "Submitting Order..."
                        : `Place Order · ${formatMartBDT(grandTotal)}`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRACK ORDER MODAL */}
      {trackOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="track-modal-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h2 id="track-modal-title" className="font-display text-lg font-bold text-slate-900">
                  Track Your Order
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your Order ID and phone number used during checkout.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackOpen(false)}
                aria-label="Close track order modal"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <form onSubmit={handleTrackOrderSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Order ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={trackOrderId}
                      onChange={(e) => setTrackOrderId(e.target.value.toUpperCase())}
                      placeholder="e.g. XM-123456-789"
                      className="input font-mono uppercase text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={trackPhone}
                      onChange={(e) => setTrackPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="input font-mono text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="btn-primary w-full py-2.5 text-xs"
                >
                  {trackingLoading ? "Checking Order Status..." : "Check Order Status"}
                </button>
              </form>

              {trackingError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{trackingError}</span>
                </div>
              )}

              {trackedOrder && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {trackedOrder.id}
                      </div>
                      <div className="text-slate-500">
                        Placed{" "}
                        {trackedOrder.createdAt
                          ? new Date(trackedOrder.createdAt).toLocaleDateString()
                          : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-500">Current Status</div>
                      <div
                        className={`font-semibold text-sm ${
                          trackedOrder.status === "Cancelled"
                            ? "text-red-600"
                            : "text-[#0B5336]"
                        }`}
                      >
                        {trackedOrder.status}
                      </div>
                    </div>
                  </div>

                  {/* Step Timeline */}
                  {trackedOrder.status === "Cancelled" ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-medium">
                      This order has been cancelled. Contact {MART_CONTACT_PHONE} for assistance.
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {ORDER_STEPS.map((step, idx) => {
                        const activeIdx = ORDER_STEPS.indexOf(trackedOrder.status);
                        const completed = activeIdx >= idx;
                        return (
                          <div key={step} className="text-center space-y-1.5">
                            <div
                              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold ${
                                completed
                                  ? "border-[#0B5336] bg-[#0B5336] text-white"
                                  : "border-slate-300 bg-white text-slate-400"
                              }`}
                            >
                              {completed ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                            </div>
                            <div
                              className={`text-[10px] font-semibold ${
                                completed ? "text-slate-900" : "text-slate-400"
                              }`}
                            >
                              {step}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Items & Amount */}
                  <div className="border-t border-slate-200 pt-3 space-y-1.5">
                    <div className="font-semibold text-slate-800">Ordered Items</div>
                    {parseOrderItems(trackedOrder.itemsJson).length > 0 ? (
                      parseOrderItems(trackedOrder.itemsJson).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-600">
                          <span>
                            {item.name}
                            {item.variant ? ` (${item.variant})` : ""} × {item.quantity}
                          </span>
                          <span className="font-mono tabular-nums">
                            {formatMartBDT(item.lineTotal)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-600">{trackedOrder.itemsSummary}</div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Payable ({trackedOrder.paymentMethod})</span>
                      <span className="font-mono text-[#0B5336] tabular-nums">
                        {formatMartBDT(trackedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
