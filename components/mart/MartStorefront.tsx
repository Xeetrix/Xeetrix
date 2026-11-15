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
  RotateCw,
} from "lucide-react";
import { MartHeader } from "./MartHeader";
import { MartFooter } from "./MartFooter";
import { useMartI18n } from "./MartI18nProvider";
import {
  DEFAULT_MART_SETTINGS,
  fetchMartPublicData,
  getCachedMartPublicSnapshot,
  MART_CONTACT_EMAIL,
  MART_CONTACT_PHONE,
  MART_CONTACT_TEL,
  MartApiError,
  MartCategory,
  MartDeliveryArea,
  MartLabel,
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
import {
  formatMartDate,
  formatMartDateTime,
  formatMartPrice,
  parseCsvSlugs,
  pickLocalized,
  toLocalizedDigits,
  translateMartError,
} from "@/lib/martI18n";

const CART_STORAGE_KEY = "xeetrix_mart_cart_v2";

interface CartItem {
  key: string;
  productId: string;
  sku: string;
  nameEn: string;
  nameBn: string;
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
  const { lang, t } = useMartI18n();

  const [products, setProducts] = useState<MartProduct[]>([]);
  const [categories, setCategories] = useState<MartCategory[]>([]);
  const [labels, setLabels] = useState<MartLabel[]>([]);
  const [settings, setSettings] = useState<MartSettings>(DEFAULT_MART_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Multi-Category, Label & Search Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
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
      setLabels(cached.labels || []);
      setSettings(cached.settings);
      setLoading(false);
    }

    fetchMartPublicData()
      .then((res) => {
        if (!mounted) return;
        setProducts(res.products);
        setCategories(res.categories);
        setLabels(res.labels || []);
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

  // Taxonomy Lookup Maps
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

  // Combine registered active categories with any category slugs attached to products
  const visibleCategories = useMemo(() => {
    const map = new Map<string, MartCategory>();
    categories.forEach((c) => map.set(c.slug, c));
    products.forEach((p) => {
      parseCsvSlugs(p.categories).forEach((slug) => {
        if (!map.has(slug)) {
          map.set(slug, {
            id: slug,
            slug,
            parentSlug: "",
            nameEn: slug,
            nameBn: slug,
            descriptionEn: "",
            descriptionBn: "",
            imageUrl: "",
            sortOrder: 999,
            active: true,
            createdAt: "",
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, products]);

  const visibleLabels = useMemo(() => {
    const map = new Map<string, MartLabel>();
    labels.forEach((l) => map.set(l.slug, l));
    products.forEach((p) => {
      parseCsvSlugs(p.labels).forEach((slug) => {
        if (!map.has(slug)) {
          map.set(slug, {
            id: slug,
            slug,
            nameEn: slug,
            nameBn: slug,
            descriptionEn: "",
            descriptionBn: "",
            tone: "emerald",
            sortOrder: 999,
            active: true,
            createdAt: "",
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [labels, products]);

  // Parent-child expansion so selecting a parent category matches child categories as well
  const expandedSelectedCategories = useMemo(() => {
    if (selectedCategories.length === 0) return new Set<string>();
    const allowed = new Set<string>(selectedCategories);
    let added = true;
    while (added) {
      added = false;
      visibleCategories.forEach((cat) => {
        if (cat.parentSlug && allowed.has(cat.parentSlug) && !allowed.has(cat.slug)) {
          allowed.add(cat.slug);
          added = true;
        }
      });
    }
    return allowed;
  }, [selectedCategories, visibleCategories]);

  function toggleCategoryFilter(slug: string) {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function toggleLabelFilter(slug: string) {
    setSelectedLabels((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function resetAllFilters() {
    setSelectedCategories([]);
    setSelectedLabels([]);
    setSearchQuery("");
  }

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      const prodCats = parseCsvSlugs(p.categories);
      const prodLabels = parseCsvSlugs(p.labels);

      const catOk =
        expandedSelectedCategories.size === 0 ||
        prodCats.some((cSlug) => expandedSelectedCategories.has(cSlug));

      const labelOk =
        selectedLabels.length === 0 ||
        prodLabels.some((lSlug) => selectedLabels.includes(lSlug));

      let searchOk = true;
      if (q) {
        const catTexts = prodCats
          .map((slug) => {
            const c = categoryMap.get(slug);
            return c ? `${c.nameEn} ${c.nameBn} ${c.slug}` : slug;
          })
          .join(" ");
        const lblTexts = prodLabels
          .map((slug) => {
            const l = labelMap.get(slug);
            return l ? `${l.nameEn} ${l.nameBn} ${l.slug}` : slug;
          })
          .join(" ");

        const haystack = [
          p.nameEn,
          p.nameBn,
          p.sku,
          p.descriptionEn,
          p.descriptionBn,
          catTexts,
          lblTexts,
        ]
          .join(" ")
          .toLowerCase();

        searchOk = haystack.includes(q);
      }

      return catOk && labelOk && searchOk;
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
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [
    products,
    expandedSelectedCategories,
    selectedLabels,
    searchQuery,
    sortBy,
    categoryMap,
    labelMap,
  ]);

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

  // Bilingual Settings Resolution
  const activePromoText = pickLocalized(settings.promoTextEn, settings.promoTextBn, lang);
  const activeHeroTitle = pickLocalized(settings.heroTitleEn, settings.heroTitleBn, lang);
  const activeHeroSubtitle = pickLocalized(settings.heroSubtitleEn, settings.heroSubtitleBn, lang);
  const activeHeroCta = pickLocalized(settings.heroCtaTextEn, settings.heroCtaTextBn, lang);

  function addToCart(product: MartProduct, variantChoice = "", qtyToAdd = 1, openDrawer = false) {
    if (product.stock <= 0) return;
    const localizedVariants = parseProductVariants(
      pickLocalized(product.variantsEn, product.variantsBn, lang)
    );
    const chosenVariant =
      variantChoice || (localizedVariants.length > 0 ? localizedVariants[0] : "");
    const itemKey = `${product.id}__${chosenVariant}`;
    const displayName = pickLocalized(product.nameEn, product.nameBn, lang, product.sku);

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
          nameEn: product.nameEn || product.nameBn,
          nameBn: product.nameBn || product.nameEn,
          variant: chosenVariant,
          unitPrice: product.price,
          maxStock: Math.max(1, product.stock),
          imageUrl: product.imageUrl,
          quantity: Math.min(Math.max(1, product.stock), qtyToAdd),
        },
      ];
    });

    setConfirmedInvoice(null);
    const bannerMsg = `${displayName} — ${t.catalog.addedToCartSuffix}`;
    setAddedBanner(bannerMsg);
    setTimeout(() => {
      setAddedBanner((prev) => (prev === bannerMsg ? null : prev));
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
    const variants = parseProductVariants(
      pickLocalized(product.variantsEn, product.variantsBn, lang)
    );
    setQuickViewProduct(product);
    setQuickViewVariant(variants.length > 0 ? variants[0] : "");
    setQuickViewQty(1);
  }

  async function handleCheckoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCheckoutError(null);

    if (cart.length === 0) {
      setCheckoutError(t.cart.errEmptyCart);
      return;
    }
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setCheckoutError(t.cart.errMissingDetails);
      return;
    }

    const orderItems: MartOrderItem[] = cart.map((item) => ({
      productId: item.productId,
      sku: item.sku,
      name: pickLocalized(item.nameEn, item.nameBn, lang),
      nameEn: item.nameEn,
      nameBn: item.nameBn,
      variant: item.variant,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.unitPrice * item.quantity,
      imageUrl: item.imageUrl,
    }));

    const paymentLabel =
      paymentMethod === "Mobile Banking"
        ? `${t.cart.mobileBankingOption} (${mobileChannel})`
        : t.cart.codOption;

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

      setCart([]);
      setCustomerName("");
      setPhone("");
      setAddress("");
      setNotes("");
      setTransactionId("");

      fetchMartPublicData(true)
        .then((fresh) => {
          setProducts(fresh.products);
          setCategories(fresh.categories);
          setLabels(fresh.labels || []);
          setSettings(fresh.settings);
        })
        .catch(() => {});
    } catch (err) {
      const apiErr = err as MartApiError;
      setCheckoutError(
        translateMartError(apiErr?.message, lang, apiErr?.code) || t.cart.errOrderFailed
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
      setTrackingError(t.track.errMissingFields);
      return;
    }

    setTrackingLoading(true);
    try {
      const order = await trackMartOrder(trackOrderId.trim(), trackPhone.trim());
      setTrackedOrder(order);
    } catch (err) {
      const apiErr = err as MartApiError;
      setTrackingError(
        translateMartError(apiErr?.message, lang, apiErr?.code) || t.track.errNotFound
      );
    } finally {
      setTrackingLoading(false);
    }
  }

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedLabels.length > 0 || searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Slim Top Promo Bar */}
      {activePromoText && (
        <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>{activePromoText}</span>
            <span aria-hidden="true" className="text-slate-500 hidden sm:inline">
              ·
            </span>
            <a
              href={MART_CONTACT_TEL}
              className="font-mono text-gold-400 hover:text-white transition-colors tabular-nums hidden sm:inline"
            >
              {t.common.helplineLabel}: {MART_CONTACT_PHONE}
            </a>
          </div>
        </div>
      )}

      {/* Standalone Mart Header */}
      <MartHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={visibleCategories}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategoryFilter}
        onClearCategories={() => setSelectedCategories([])}
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
            className="text-[#0B5336] underline font-bold ml-1 whitespace-nowrap"
          >
            {t.catalog.viewCart}
          </button>
        </div>
      )}

      <main className="flex-1">
        {/* Promotional Hero Section */}
        <section className="bg-slate-900 text-white border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5">
                <div className="text-xs font-semibold tracking-wide text-gold-400">
                  {t.hero.kicker}
                </div>
                <h1
                  className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]"
                  style={{ textWrap: "balance" }}
                >
                  {activeHeroTitle}
                </h1>
                <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
                  {activeHeroSubtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#mart-catalog"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0B5336] px-6 py-3 text-sm font-semibold text-white hover:bg-[#08412A] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>{activeHeroCta}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackOpen(true);
                      setTrackingError(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <PackageSearch className="h-4 w-4 text-gold-400" />
                    <span>{t.hero.trackExistingOrder}</span>
                  </button>
                </div>
              </div>

              {/* Delivery Charge Transparent Summary Box */}
              <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-4">
                <div className="text-xs font-semibold tracking-wide text-gold-400">
                  {t.hero.deliveryCardTitle}
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="text-slate-300">{t.hero.insideDhakaLabel}</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {formatMartPrice(insideDhakaFee, lang)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="text-slate-300">{t.hero.outsideDhakaLabel}</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {formatMartPrice(outsideDhakaFee, lang)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>{t.hero.directHelplineLabel}</span>
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
                  <div className="text-sm font-semibold text-slate-900">
                    {t.trust.fastDeliveryTitle}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.trust.fastDeliveryDesc}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.trust.codTitle}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.trust.codDesc}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {t.trust.authenticTitle}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.trust.authenticDesc}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {t.trust.easyReturnTitle}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.trust.easyReturnDesc}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Store Catalog Section */}
        <section id="mart-catalog" className="py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Combined Multi-Category & Label Filter Toolbar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
              {/* Row 1: Categories + Sort + Count */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-500">
                    {t.catalog.categoriesTitle}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[36px] border ${
                        selectedCategories.length === 0
                          ? "bg-[#0B5336] border-[#0B5336] text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {t.catalog.allCategories}
                    </button>
                    {visibleCategories.map((cat) => {
                      const active = selectedCategories.includes(cat.slug);
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => toggleCategoryFilter(cat.slug)}
                          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[36px] border ${
                            active
                              ? "bg-[#0B5336] border-[#0B5336] text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336]"
                          }`}
                        >
                          {pickLocalized(cat.nameEn, cat.nameBn, lang, cat.slug)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start lg:self-end">
                  <span className="text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
                    {toLocalizedDigits(filteredProducts.length, lang)}{" "}
                    {filteredProducts.length === 1
                      ? t.catalog.productSingular
                      : t.catalog.productPlural}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label={t.catalog.sortAria}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0B5336] min-h-[40px]"
                  >
                    <option value="featured">{t.catalog.sortFeatured}</option>
                    <option value="price_asc">{t.catalog.sortPriceAsc}</option>
                    <option value="price_desc">{t.catalog.sortPriceDesc}</option>
                    <option value="newest">{t.catalog.sortNewest}</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Collections & Labels */}
              {visibleLabels.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-500">
                      {t.catalog.labelsTitle}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedLabels([])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[34px] border ${
                          selectedLabels.length === 0
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {t.catalog.allLabels}
                      </button>
                      {visibleLabels.map((lbl) => {
                        const active = selectedLabels.includes(lbl.slug);
                        const activeClass =
                          lbl.tone === "gold"
                            ? "bg-gold-500 border-gold-500 text-slate-950"
                            : lbl.tone === "slate"
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-[#0B5336] border-[#0B5336] text-white";
                        return (
                          <button
                            key={lbl.slug}
                            type="button"
                            onClick={() => toggleLabelFilter(lbl.slug)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[34px] border ${
                              active
                                ? activeClass
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                            }`}
                          >
                            {pickLocalized(lbl.nameEn, lbl.nameBn, lang, lbl.slug)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 self-end"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>{t.catalog.clearFilters}</span>
                    </button>
                  )}
                </div>
              )}

              {visibleLabels.length === 0 && hasActiveFilters && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>{t.catalog.clearFilters}</span>
                  </button>
                </div>
              )}
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
                  <div className="text-xs font-semibold tracking-wide text-gold-600">
                    {t.catalog.emptyStoreKicker}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    {t.catalog.emptyStoreTitle}
                  </h2>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {t.catalog.emptyStoreDesc}
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
                  {t.catalog.noMatchTitle}
                </h2>
                <p className="text-sm text-slate-500">{t.catalog.noMatchDesc}</p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  {t.catalog.resetFiltersBtn}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const hasDiscount =
                    product.comparePrice > 0 && product.comparePrice > product.price;
                  const outOfStock = product.stock <= 0;
                  const prodName = pickLocalized(
                    product.nameEn,
                    product.nameBn,
                    lang,
                    product.sku
                  );
                  const prodDesc = pickLocalized(product.descriptionEn, product.descriptionBn, lang);
                  const variants = parseProductVariants(
                    pickLocalized(product.variantsEn, product.variantsBn, lang)
                  );

                  const catNames = parseCsvSlugs(product.categories).map((slug) => {
                    const c = categoryMap.get(slug);
                    return c ? pickLocalized(c.nameEn, c.nameBn, lang, slug) : slug;
                  });
                  const labelNames = parseCsvSlugs(product.labels).map((slug) => {
                    const l = labelMap.get(slug);
                    return l ? pickLocalized(l.nameEn, l.nameBn, lang, slug) : slug;
                  });

                  const kickerParts = [
                    ...(catNames.length > 0 ? catNames : [t.catalog.generalFallback]),
                    ...labelNames.slice(0, 1),
                  ];

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
                            alt={prodName}
                            className="transition-transform duration-200 group-hover:scale-[1.03]"
                          />
                        </button>

                        <div className="p-6 space-y-2.5">
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-[#0B5336] truncate">
                              {kickerParts.join(" · ")}
                            </span>
                            <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
                              {outOfStock
                                ? t.catalog.outOfStock
                                : `${toLocalizedDigits(product.stock, lang)} ${t.catalog.inStockSuffix}`}
                            </span>
                          </div>

                          <h2 className="font-display text-lg font-semibold text-slate-900 leading-snug">
                            <button
                              type="button"
                              onClick={() => openQuickView(product)}
                              className="text-left hover:text-[#0B5336] transition-colors"
                            >
                              {prodName}
                            </button>
                          </h2>

                          {variants.length > 0 && (
                            <div className="text-xs text-slate-500">
                              {t.catalog.optionsPrefix}: {variants.join(" · ")}
                            </div>
                          )}

                          {prodDesc && (
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                              {prodDesc}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                              {formatMartPrice(product.price, lang)}
                            </span>
                            {hasDiscount && (
                              <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                                {formatMartPrice(product.comparePrice, lang)}
                              </span>
                            )}
                          </div>
                          {product.sku && (
                            <div className="font-mono text-[11px] text-slate-400">
                              {t.common.sku}: {product.sku}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openQuickView(product)}
                            aria-label={`${t.catalog.quickViewAria} ${prodName}`}
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
                            <span>{outOfStock ? t.catalog.soldOut : t.catalog.addToCart}</span>
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
                {[
                  ...parseCsvSlugs(quickViewProduct.categories).map((slug) => {
                    const c = categoryMap.get(slug);
                    return c ? pickLocalized(c.nameEn, c.nameBn, lang, slug) : slug;
                  }),
                  ...parseCsvSlugs(quickViewProduct.labels).map((slug) => {
                    const l = labelMap.get(slug);
                    return l ? pickLocalized(l.nameEn, l.nameBn, lang, slug) : slug;
                  }),
                ].join(" · ")}
                {quickViewProduct.sku
                  ? ` · ${t.common.sku} ${quickViewProduct.sku}`
                  : ""}
              </div>
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                aria-label={t.quickView.closeAria}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6 aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                <ProductMedia
                  src={quickViewProduct.imageUrl}
                  alt={pickLocalized(quickViewProduct.nameEn, quickViewProduct.nameBn, lang)}
                />
              </div>

              <div className="md:col-span-6 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <h2
                    id="quick-view-title"
                    className="font-display text-2xl font-bold text-slate-900 leading-snug"
                  >
                    {pickLocalized(quickViewProduct.nameEn, quickViewProduct.nameBn, lang)}
                  </h2>

                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-2xl font-bold text-[#0B5336] tabular-nums">
                      {formatMartPrice(quickViewProduct.price, lang)}
                    </span>
                    {quickViewProduct.comparePrice > quickViewProduct.price && (
                      <span className="font-mono text-sm text-slate-400 line-through tabular-nums">
                        {formatMartPrice(quickViewProduct.comparePrice, lang)}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono text-slate-600 tabular-nums">
                    {t.quickView.availabilityLabel}:{" "}
                    <span
                      className={
                        quickViewProduct.stock > 0
                          ? "font-semibold text-[#0B5336]"
                          : "font-semibold text-red-600"
                      }
                    >
                      {quickViewProduct.stock > 0
                        ? `${toLocalizedDigits(quickViewProduct.stock, lang)} ${t.quickView.unitsInStockSuffix}`
                        : t.quickView.outOfStock}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed pt-1">
                    {pickLocalized(
                      quickViewProduct.descriptionEn,
                      quickViewProduct.descriptionBn,
                      lang,
                      t.quickView.defaultDesc
                    )}
                  </p>

                  {parseProductVariants(
                    pickLocalized(quickViewProduct.variantsEn, quickViewProduct.variantsBn, lang)
                  ).length > 0 && (
                    <div className="pt-2 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        {t.quickView.selectVariant}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {parseProductVariants(
                          pickLocalized(
                            quickViewProduct.variantsEn,
                            quickViewProduct.variantsBn,
                            lang
                          )
                        ).map((variant) => (
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
                    <span className="text-xs font-semibold text-slate-700">
                      {t.quickView.quantity}
                    </span>
                    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                        aria-label={t.quickView.decreaseQtyAria}
                        className="p-2 text-slate-600 hover:text-slate-900"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center font-mono text-sm font-bold tabular-nums">
                        {toLocalizedDigits(quickViewQty, lang)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuickViewQty((q) =>
                            Math.min(Math.max(1, quickViewProduct.stock), q + 1)
                          )
                        }
                        aria-label={t.quickView.increaseQtyAria}
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
                      <span>{t.quickView.addToCart}</span>
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
                      {quickViewProduct.stock <= 0 ? t.quickView.soldOut : t.quickView.buyNow}
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
                  {confirmedInvoice
                    ? t.cart.invoiceTitle
                    : `${t.cart.drawerTitle} (${toLocalizedDigits(cartCount, lang)})`}
                </h2>
                <p className="text-xs text-slate-500">
                  {confirmedInvoice
                    ? `${t.cart.invoiceRefPrefix}: ${confirmedInvoice.orderId}`
                    : t.cart.drawerSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label={t.cart.closeAria}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {confirmedInvoice ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#0B5336] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        {t.cart.orderSuccessTitle}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">{t.cart.orderSuccessDesc}</p>
                    </div>
                  </div>

                  <div
                    id="mart-customer-invoice"
                    className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="font-display text-base font-bold text-slate-900">
                          {t.cart.invoiceHeader}
                        </div>
                        <div className="text-slate-500">
                          {formatMartDateTime(confirmedInvoice.createdAt, lang)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-500">{t.cart.orderIdLabel}</div>
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
                          {t.cart.deliveryPrefix}:{" "}
                          <span className="font-semibold">
                            {confirmedInvoice.deliveryArea === "Inside Dhaka"
                              ? t.cart.insideDhaka
                              : t.cart.outsideDhaka}
                          </span>
                        </div>
                        <div>
                          {t.cart.paymentPrefix}:{" "}
                          <span className="font-semibold">{confirmedInvoice.paymentMethod}</span>
                        </div>
                        {confirmedInvoice.transactionId && (
                          <div className="font-mono text-slate-600">
                            {t.cart.trxIdPrefix}: {confirmedInvoice.transactionId}
                          </div>
                        )}
                      </div>
                    </div>

                    <table className="w-full text-left border-t border-slate-200">
                      <thead className="border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="py-2 font-semibold">{t.cart.itemCol}</th>
                          <th className="py-2 font-semibold text-center">{t.cart.qtyCol}</th>
                          <th className="py-2 font-semibold text-right">{t.cart.amountCol}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {confirmedInvoice.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-2">
                              <div className="font-medium text-slate-900">
                                {pickLocalized(it.nameEn || it.name, it.nameBn, lang)}
                              </div>
                              {it.variant && (
                                <div className="text-[11px] text-slate-500">{it.variant}</div>
                              )}
                            </td>
                            <td className="py-2 text-center font-mono tabular-nums">
                              {toLocalizedDigits(it.quantity, lang)}
                            </td>
                            <td className="py-2 text-right font-mono font-semibold tabular-nums">
                              {formatMartPrice(it.lineTotal, lang)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="border-t border-slate-200 pt-3 space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>{t.cart.subtotal}</span>
                        <span className="font-mono tabular-nums">
                          {formatMartPrice(confirmedInvoice.subtotal, lang)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>{t.cart.deliveryFee}</span>
                        <span className="font-mono tabular-nums">
                          {formatMartPrice(confirmedInvoice.deliveryCharge, lang)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                        <span>{t.cart.totalPayable}</span>
                        <span className="font-mono text-[#0B5336] tabular-nums">
                          {formatMartPrice(confirmedInvoice.totalAmount, lang)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="btn-outline flex-1 py-2.5 text-xs gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>{t.cart.printInvoice}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmedInvoice(null);
                        setCartOpen(false);
                      }}
                      className="btn-primary flex-1 py-2.5 text-xs"
                    >
                      {t.cart.continueShopping}
                    </button>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto" />
                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    {t.cart.emptyTitle}
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">{t.cart.emptyDesc}</p>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="btn-primary px-6 py-2.5 text-xs mt-2"
                  >
                    {t.cart.browseProducts}
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const itemTitle = pickLocalized(item.nameEn, item.nameBn, lang);
                      return (
                        <div
                          key={item.key}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="h-16 w-16 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                            <ProductMedia src={item.imageUrl} alt={itemTitle} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {itemTitle}
                            </div>
                            <div className="text-xs text-slate-500">
                              {item.variant ? `${item.variant} · ` : ""}
                              <span className="font-mono tabular-nums">
                                {formatMartPrice(item.unitPrice, lang)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.key, -1)}
                                  className="px-2 py-1 text-slate-600 hover:text-slate-900"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-7 text-center font-mono text-xs font-bold tabular-nums">
                                  {toLocalizedDigits(item.quantity, lang)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.key, 1)}
                                  className="px-2 py-1 text-slate-600 hover:text-slate-900"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                                  {formatMartPrice(item.unitPrice * item.quantity, lang)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeCartItem(item.key)}
                                  aria-label={`${t.cart.removeItemAria} ${itemTitle}`}
                                  className="text-slate-400 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Zone Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      {t.cart.deliveryZone}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryArea("Inside Dhaka")}
                        className={`rounded-xl border p-3 text-left transition-colors ${
                          deliveryArea === "Inside Dhaka"
                            ? "border-[#0B5336] bg-brand-50 text-slate-900"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <div className="text-xs font-semibold">{t.cart.insideDhaka}</div>
                        <div className="font-mono text-sm font-bold text-[#0B5336] tabular-nums mt-0.5">
                          {formatMartPrice(insideDhakaFee, lang)}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryArea("Outside Dhaka")}
                        className={`rounded-xl border p-3 text-left transition-colors ${
                          deliveryArea === "Outside Dhaka"
                            ? "border-[#0B5336] bg-brand-50 text-slate-900"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        <div className="text-xs font-semibold">{t.cart.outsideDhaka}</div>
                        <div className="font-mono text-sm font-bold text-[#0B5336] tabular-nums mt-0.5">
                          {formatMartPrice(outsideDhakaFee, lang)}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Checkout Customer & Payment Form */}
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4 border-t border-slate-200 pt-5">
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      {t.cart.customerDetailsTitle}
                    </h3>

                    {checkoutError && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{checkoutError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.cart.fullNameLabel}
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder={t.cart.fullNamePlaceholder}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {t.cart.phoneLabel}
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t.cart.phonePlaceholder}
                          className="input font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.cart.addressLabel}
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={t.cart.addressPlaceholder}
                        className="input min-h-[72px] py-2"
                      />
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        {t.cart.paymentMethodLabel}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Cash on Delivery")}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                            paymentMethod === "Cash on Delivery"
                              ? "border-[#0B5336] bg-[#0B5336] text-white"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {t.cart.codOption}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Mobile Banking")}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                            paymentMethod === "Mobile Banking"
                              ? "border-[#0B5336] bg-[#0B5336] text-white"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {t.cart.mobileBankingOption}
                        </button>
                      </div>

                      {paymentMethod === "Mobile Banking" && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                {t.cart.providerLabel}
                              </label>
                              <select
                                value={mobileChannel}
                                onChange={(e) => setMobileChannel(e.target.value)}
                                className="input min-h-[38px] py-1.5 text-xs"
                              >
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                                <option value="Rocket">Rocket</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                {t.cart.trxIdLabel}
                              </label>
                              <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder={t.cart.trxIdPlaceholder}
                                className="input min-h-[38px] py-1.5 text-xs font-mono"
                              />
                            </div>
                          </div>
                          {settings.mobileBankingNumber && (
                            <p className="text-[11px] text-slate-600">
                              {t.cart.sendMoneyPrefix}{" "}
                              <span className="font-mono font-bold text-slate-900">
                                {settings.mobileBankingNumber}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.cart.notesLabel}
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t.cart.notesPlaceholder}
                        className="input"
                      />
                    </div>

                    {/* Totals Summary */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>{t.cart.subtotal}</span>
                        <span className="font-mono tabular-nums">
                          {formatMartPrice(cartSubtotal, lang)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>
                          {t.cart.deliveryFee} (
                          {deliveryArea === "Inside Dhaka"
                            ? t.cart.insideDhaka
                            : t.cart.outsideDhaka}
                          )
                        </span>
                        <span className="font-mono tabular-nums">
                          {formatMartPrice(deliveryFee, lang)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>{t.cart.grandTotal}</span>
                        <span className="font-mono text-[#0B5336] tabular-nums">
                          {formatMartPrice(grandTotal, lang)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="btn-primary w-full py-3 text-sm"
                    >
                      {submittingOrder
                        ? t.cart.submittingOrder
                        : `${t.cart.confirmOrder} · ${formatMartPrice(grandTotal, lang)}`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER ORDER TRACKING MODAL */}
      {trackOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="track-order-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h2 id="track-order-title" className="font-display text-lg font-bold text-slate-900">
                  {t.track.modalTitle}
                </h2>
                <p className="text-xs text-slate-500">{t.track.modalSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setTrackOpen(false)}
                aria-label={t.track.closeAria}
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
                      {t.track.orderIdLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={trackOrderId}
                      onChange={(e) => setTrackOrderId(e.target.value)}
                      placeholder={t.track.orderIdPlaceholder}
                      className="input font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.track.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      value={trackPhone}
                      onChange={(e) => setTrackPhone(e.target.value)}
                      placeholder={t.track.phonePlaceholder}
                      className="input font-mono"
                    />
                  </div>
                </div>

                {trackingError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{trackingError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="btn-primary w-full py-2.5 text-xs gap-2"
                >
                  <PackageSearch className="h-4 w-4" />
                  <span>{trackingLoading ? t.track.searching : t.track.checkStatus}</span>
                </button>
              </form>

              {trackedOrder && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {trackedOrder.id}
                      </div>
                      <div className="text-slate-500">
                        {formatMartDate(trackedOrder.createdAt, lang)}
                      </div>
                    </div>
                    <div className="font-semibold text-[#0B5336]">
                      {t.orderStatuses[trackedOrder.status] || trackedOrder.status}
                    </div>
                  </div>

                  {trackedOrder.status === "Cancelled" ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-medium">
                      {t.track.cancelledAlert}
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {ORDER_STEPS.map((step, idx) => {
                        const currentIdx = ORDER_STEPS.indexOf(trackedOrder.status);
                        const completed = idx <= (currentIdx === -1 ? 0 : currentIdx);
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
                              {t.orderStatuses[step]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-3 space-y-1.5">
                    <div className="font-semibold text-slate-800">{t.track.orderedItemsTitle}</div>
                    {parseOrderItems(trackedOrder.itemsJson).length > 0 ? (
                      parseOrderItems(trackedOrder.itemsJson).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-600">
                          <span>
                            {pickLocalized(item.nameEn || item.name, item.nameBn, lang)}
                            {item.variant ? ` (${item.variant})` : ""} ×{" "}
                            {toLocalizedDigits(item.quantity, lang)}
                          </span>
                          <span className="font-mono tabular-nums">
                            {formatMartPrice(item.lineTotal, lang)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-600">{trackedOrder.itemsSummary}</div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>
                        {t.track.totalPayableLabel} ({trackedOrder.paymentMethod})
                      </span>
                      <span className="font-mono text-[#0B5336] tabular-nums">
                        {formatMartPrice(trackedOrder.totalAmount, lang)}
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
