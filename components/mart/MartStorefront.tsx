"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  Phone,
  Mail,
  Printer,
  PackageSearch,
  Clock,
  Check,
  RotateCw,
  Download,
  Copy,
  Ticket,
  QrCode,
  Layers,
  Link2,
  ExternalLink,
} from "lucide-react";
import { MartHeader } from "./MartHeader";
import { MartFooter } from "./MartFooter";
import { useMartI18n } from "./MartI18nProvider";
import { MART_ENTERPRISE_DICTIONARY } from "@/lib/martEnterpriseI18n";
import {
  buildMartProductUrl,
  DEFAULT_MART_SETTINGS,
  fetchMartPublicData,
  findMartProductBySlugOrSku,
  findMatchingVariant,
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
  MartProductColor,
  MartSettings,
  normalizeMartImageUrl,
  parseGalleryUrls,
  parseOrderItems,
  parseProductColors,
  parseProductSizes,
  parseProductVariants,
  parseVariationMatrix,
  placeMartOrder,
  resolveProductPricing,
  trackMartOrder,
  validateMartCoupon,
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
import {
  getEffectiveProductStock,
  getProductOrderableMaxQty,
  isProductOrderable,
} from "@/lib/martOps";
import { runMartSmartSearch } from "@/lib/martSearchEngine";
import {
  trackMartAddToCart,
  trackMartInitiateCheckout,
  trackMartPurchase,
  trackMartSearch,
  trackMartViewContent,
} from "@/lib/martMetaPixel";

const CART_STORAGE_KEY = "xeetrix_mart_cart_v2";
const CUSTOMER_PREF_STORAGE_KEY = "xeetrix_mart_customer_pref_v1";

interface CartItem {
  key: string;
  productId: string;
  sku: string;
  variantSku?: string;
  nameEn: string;
  nameBn: string;
  variant: string;
  colorName?: string;
  sizeName?: string;
  unitPrice: number;
  maxStock: number;
  fulfillmentType?: "own_stock" | "dropship";
  wholesaleMinQty?: number;
  wholesalePrice?: number;
  imageUrl: string;
  quantity: number;
}

type SortOption = "featured" | "price_asc" | "price_desc" | "newest";
type OnlineChannel = "bkash_qr" | "bangla_qr" | "manual";

function ProductMedia({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const resolved = normalizeMartImageUrl(src);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-slate-50 text-slate-400 p-6 text-center ${className}`}
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
      className={`h-full w-full object-contain ${className}`}
    />
  );
}

function CategoryMedia({
  src,
  alt,
  active = false,
  sizeClass = "h-9 w-9",
  iconClass = "h-4 w-4",
}: {
  src: string;
  alt: string;
  active?: boolean;
  sizeClass?: string;
  iconClass?: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = normalizeMartImageUrl(src);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) {
    return (
      <div
        className={`flex ${sizeClass} items-center justify-center rounded-lg shrink-0 ${
          active ? "bg-white/15 text-white" : "bg-slate-100 text-[#0B5336]"
        }`}
      >
        <Layers className={iconClass} />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} overflow-hidden rounded-lg shrink-0 border ${
        active ? "border-white/30 bg-white/10" : "border-slate-200 bg-slate-100"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

const ORDER_STEPS: MartOrderStatus[] = [
  "Pending",
  "Confirmed",
  "Packaging",
  "Shipped",
  "Delivered",
];

export function MartStorefront({
  focusedProductSlug,
}: {
  focusedProductSlug?: string;
} = {}) {
  const router = useRouter();
  const { lang, t } = useMartI18n();
  const ent = MART_ENTERPRISE_DICTIONARY[lang];
  const tvar = ent.variations;
  const tcop = ent.coupons;
  const tqr = ent.qrPayment;

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
  const [cardSelectedColorByProdId, setCardSelectedColorByProdId] = useState<
    Record<string, MartProductColor>
  >({});

  // Cart & Drawer State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [hasSavedPref, setHasSavedPref] = useState(false);
  const [addedBanner, setAddedBanner] = useState<string | null>(null);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<MartProduct | null>(null);
  const [quickViewActiveImage, setQuickViewActiveImage] = useState("");
  const [quickViewSelectedColor, setQuickViewSelectedColor] =
    useState<MartProductColor | null>(null);
  const [quickViewSelectedSize, setQuickViewSelectedSize] = useState("");
  const [quickViewVariant, setQuickViewVariant] = useState("");
  const [quickViewQty, setQuickViewQty] = useState(1);

  // Dedicated Product Detail Page (PDP) State
  const [pdpActiveImage, setPdpActiveImage] = useState("");
  const [pdpSelectedColor, setPdpSelectedColor] = useState<MartProductColor | null>(null);
  const [pdpSelectedSize, setPdpSelectedSize] = useState("");
  const [pdpVariant, setPdpVariant] = useState("");
  const [pdpQty, setPdpQty] = useState(1);
  const [copiedLinkProdId, setCopiedLinkProdId] = useState<string | null>(null);

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    minOrderAmount: number;
    discountType: "percent" | "fixed";
    discountValue: number;
    maxDiscount: number;
  } | null>(null);

  // Checkout State
  const [deliveryArea, setDeliveryArea] = useState<MartDeliveryArea>("Inside Dhaka");
  const [paymentMethod, setPaymentMethod] = useState<MartPaymentMethod>("Cash on Delivery");
  const [onlineChannel, setOnlineChannel] = useState<OnlineChannel>("bkash_qr");
  const [manualChannel, setManualChannel] = useState<"Nagad" | "Rocket">("Nagad");
  const [copiedAccountNo, setCopiedAccountNo] = useState(false);
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
    discountCode?: string;
    discountAmount?: number;
    totalAmount: number;
    paymentMethod: string;
    paymentProvider?: string;
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

  // Hydrate initial ?q= search query parameter if present (supports Schema.org SearchAction & shared search links)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get("q");
      if (qParam && qParam.trim()) {
        setSearchQuery(qParam.trim());
      }
    } catch {
      // Ignore URLSearchParams errors
    }
  }, []);

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

  // Hydrate Local Cart & Saved Delivery Details
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCart(parsed as CartItem[]);
        }
      }
      const prefRaw = localStorage.getItem(CUSTOMER_PREF_STORAGE_KEY);
      if (prefRaw) {
        const pref = JSON.parse(prefRaw) as {
          customerName?: string;
          phone?: string;
          address?: string;
          deliveryArea?: MartDeliveryArea;
        };
        if (pref.customerName) setCustomerName(pref.customerName);
        if (pref.phone) setPhone(pref.phone);
        if (pref.address) setAddress(pref.address);
        if (pref.deliveryArea === "Inside Dhaka" || pref.deliveryArea === "Outside Dhaka") {
          setDeliveryArea(pref.deliveryArea);
        }
        if (pref.customerName || pref.phone || pref.address) {
          setHasSavedPref(true);
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

  useEffect(() => {
    if (!cartHydrated) return;
    if (!customerName.trim() && !phone.trim() && !address.trim()) return;
    try {
      localStorage.setItem(
        CUSTOMER_PREF_STORAGE_KEY,
        JSON.stringify({
          customerName,
          phone,
          address,
          deliveryArea,
        })
      );
    } catch {
      // Ignore storage quota issues
    }
  }, [cartHydrated, customerName, phone, address, deliveryArea]);

  function clearSavedCustomerPref() {
    try {
      localStorage.removeItem(CUSTOMER_PREF_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setCustomerName("");
    setPhone("");
    setAddress("");
    setHasSavedPref(false);
  }

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

  // Hierarchy, Product Counts & 3-Tier Category Cover Thumbnail Resolver
  const childCategoriesByParent = useMemo(() => {
    const map = new Map<string, MartCategory[]>();
    visibleCategories.forEach((cat) => {
      if (!cat.parentSlug) return;
      const list = map.get(cat.parentSlug) || [];
      list.push(cat);
      map.set(cat.parentSlug, list);
    });
    return map;
  }, [visibleCategories]);

  const categoryDescendantsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    visibleCategories.forEach((root) => {
      const set = new Set<string>([root.slug]);
      let added = true;
      while (added) {
        added = false;
        visibleCategories.forEach((c) => {
          if (c.parentSlug && set.has(c.parentSlug) && !set.has(c.slug)) {
            set.add(c.slug);
            added = true;
          }
        });
      }
      map.set(root.slug, set);
    });
    return map;
  }, [visibleCategories]);

  const categoryCountsMap = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleCategories.forEach((cat) => {
      const allowed = categoryDescendantsMap.get(cat.slug) || new Set([cat.slug]);
      counts[cat.slug] = products.filter((p) =>
        parseCsvSlugs(p.categories).some((cSlug) => allowed.has(cSlug))
      ).length;
    });
    return counts;
  }, [visibleCategories, categoryDescendantsMap, products]);

  const categoryThumbMap = useMemo(() => {
    const thumbs: Record<string, string> = {};
    visibleCategories.forEach((cat) => {
      const explicitCover = normalizeMartImageUrl(cat.imageUrl);
      if (explicitCover) {
        thumbs[cat.slug] = explicitCover;
        return;
      }
      const allowed = categoryDescendantsMap.get(cat.slug) || new Set([cat.slug]);
      const matchProd = products.find(
        (p) =>
          Boolean(normalizeMartImageUrl(p.imageUrl)) &&
          parseCsvSlugs(p.categories).some((cSlug) => allowed.has(cSlug))
      );
      thumbs[cat.slug] = matchProd ? normalizeMartImageUrl(matchProd.imageUrl) : "";
    });
    return thumbs;
  }, [visibleCategories, categoryDescendantsMap, products]);

  const activeCategoryObj = useMemo(() => {
    if (selectedCategories.length !== 1) return null;
    const slug = selectedCategories[0];
    return visibleCategories.find((c) => c.slug === slug) || categoryMap.get(slug) || null;
  }, [selectedCategories, visibleCategories, categoryMap]);

  const activeCategoryParent = useMemo(() => {
    if (!activeCategoryObj?.parentSlug) return null;
    return (
      visibleCategories.find((c) => c.slug === activeCategoryObj.parentSlug) ||
      categoryMap.get(activeCategoryObj.parentSlug) ||
      null
    );
  }, [activeCategoryObj, visibleCategories, categoryMap]);

  const activeCategoryChildren = useMemo(() => {
    if (!activeCategoryObj) return [];
    return childCategoriesByParent.get(activeCategoryObj.slug) || [];
  }, [activeCategoryObj, childCategoriesByParent]);

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
    if (focusedProductSlug) {
      router.push("/mart");
      return;
    }
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

  const focusedProduct = useMemo(
    () => findMartProductBySlugOrSku(products, focusedProductSlug),
    [products, focusedProductSlug]
  );

  const lastTrackedPdpIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!focusedProduct) return;
    const colors = parseProductColors(focusedProduct.colorsJson);
    const sizes = parseProductSizes(focusedProduct.sizesList);
    const gallery = parseGalleryUrls(focusedProduct.galleryUrls, focusedProduct.imageUrl);
    const legacyVariants = parseProductVariants(
      pickLocalized(focusedProduct.variantsEn, focusedProduct.variantsBn, lang)
    );
    const firstColor = colors[0] || null;
    setPdpSelectedColor(firstColor);
    setPdpSelectedSize(sizes[0] || "");
    setPdpActiveImage(firstColor?.imageUrl || gallery[0] || focusedProduct.imageUrl || "");
    setPdpVariant(
      colors.length === 0 && sizes.length === 0 && legacyVariants.length > 0
        ? legacyVariants[0]
        : ""
    );
    setPdpQty(1);
    if (lastTrackedPdpIdRef.current !== focusedProduct.id) {
      lastTrackedPdpIdRef.current = focusedProduct.id;
      trackMartViewContent({
        id: focusedProduct.id,
        sku: focusedProduct.sku,
        nameEn: focusedProduct.nameEn,
        nameBn: focusedProduct.nameBn,
        price: focusedProduct.price,
        categories: focusedProduct.categories,
      });
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedProduct?.id, lang]);

  const relatedProducts = useMemo(() => {
    if (!focusedProduct) return [];
    const targetCats = new Set(parseCsvSlugs(focusedProduct.categories));
    const targetLabels = new Set(parseCsvSlugs(focusedProduct.labels));
    const candidates = products.filter((p) => p.id !== focusedProduct.id);
    const scored = candidates.map((p) => {
      const pCats = parseCsvSlugs(p.categories);
      const pLabels = parseCsvSlugs(p.labels);
      let score = 0;
      pCats.forEach((c) => {
        if (targetCats.has(c)) score += 3;
      });
      pLabels.forEach((l) => {
        if (targetLabels.has(l)) score += 2;
      });
      if (p.featured) score += 1;
      return { product: p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6).map((s) => s.product);
  }, [focusedProduct, products]);

  function navigateToProductPage(product: MartProduct) {
    router.push(buildMartProductUrl(product));
  }

  function handleCopyProductLink(product: MartProduct, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (typeof window === "undefined") return;
    const fullUrl = `${window.location.origin}${buildMartProductUrl(product)}`;
    try {
      navigator.clipboard.writeText(fullUrl);
    } catch {
      // Ignore clipboard permission errors
    }
    setCopiedLinkProdId(product.id);
    setAddedBanner(t.quickView.linkCopiedBtn);
    setTimeout(() => {
      setCopiedLinkProdId((prev) => (prev === product.id ? null : prev));
    }, 2200);
    setTimeout(() => {
      setAddedBanner((prev) => (prev === t.quickView.linkCopiedBtn ? null : prev));
    }, 2500);
  }

  const smartSearchBundle = useMemo(
    () =>
      runMartSmartSearch({
        query: searchQuery,
        products,
        categories: visibleCategories,
        labels: visibleLabels,
        lang,
      }),
    [searchQuery, products, visibleCategories, visibleLabels, lang]
  );

  useEffect(() => {
    const clean = searchQuery.trim();
    if (clean.length < 2) return;
    const timer = setTimeout(() => {
      trackMartSearch(clean, smartSearchBundle.matchedProducts.length);
    }, 650);
    return () => clearTimeout(timer);
  }, [searchQuery, smartSearchBundle.matchedProducts.length]);

  const filteredProducts = useMemo(() => {
    const hasSearch = searchQuery.trim().length > 0;
    const baseList = hasSearch ? smartSearchBundle.matchedProducts : products;

    const list = baseList.filter((p) => {
      const prodCats = parseCsvSlugs(p.categories);
      const prodLabels = parseCsvSlugs(p.labels);

      const catOk =
        expandedSelectedCategories.size === 0 ||
        prodCats.some((cSlug) => expandedSelectedCategories.has(cSlug));

      const labelOk =
        selectedLabels.length === 0 ||
        prodLabels.some((lSlug) => selectedLabels.includes(lSlug));

      return catOk && labelOk;
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
    if (hasSearch) {
      // Preserve relevance ranking from smart search engine when sorting by featured
      return list;
    }
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [
    products,
    smartSearchBundle.matchedProducts,
    expandedSelectedCategories,
    selectedLabels,
    searchQuery,
    sortBy,
  ]);

  const productMap = useMemo(() => {
    const map = new Map<string, MartProduct>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  function resolveCartLiveState(item: CartItem) {
    const liveProd = productMap.get(item.productId);
    const liveNameEn = liveProd ? liveProd.nameEn || liveProd.nameBn : item.nameEn;
    const liveNameBn = liveProd ? liveProd.nameBn || liveProd.nameEn : item.nameBn;
    const liveTitle = pickLocalized(liveNameEn, liveNameBn, lang);

    if (!liveProd) {
      return {
        liveProd: undefined,
        matchedCell: undefined,
        liveNameEn,
        liveNameBn,
        liveTitle,
        isLiveAvailable: loading && products.length === 0,
        liveMaxStock: item.maxStock,
      };
    }

    const matrix = parseVariationMatrix(liveProd.variationMatrixJson);
    const matchedCell = findMatchingVariant(matrix, item.colorName, item.sizeName);
    const variantMissing =
      matrix.length > 0 && (Boolean(item.colorName) || Boolean(item.sizeName)) && !matchedCell;

    const variantOrderable = matchedCell
      ? matchedCell.active && (liveProd.fulfillmentType === "dropship" || matchedCell.stock > 0)
      : !variantMissing;

    const isLiveAvailable = isProductOrderable(liveProd) && variantOrderable;
    const rawCap = getProductOrderableMaxQty(liveProd, matchedCell);
    const liveMaxStock = isLiveAvailable ? Math.max(1, rawCap) : item.maxStock;

    return {
      liveProd,
      matchedCell,
      liveNameEn,
      liveNameBn,
      liveTitle,
      isLiveAvailable,
      liveMaxStock,
    };
  }

  function resolveCartItemUnit(item: CartItem): {
    effectiveUnitPrice: number;
    isWholesaleApplied: boolean;
    minWholesaleQty: number;
    wholesaleRate: number;
  } {
    const liveProd = productMap.get(item.productId);
    const minQty = liveProd
      ? Number(liveProd.wholesaleMinQty) || 0
      : Number(item.wholesaleMinQty) || 0;
    const wholesaleRate = liveProd
      ? Number(liveProd.wholesalePrice) || 0
      : Number(item.wholesalePrice) || 0;

    let basePrice = item.unitPrice;
    if (liveProd) {
      const matrix = parseVariationMatrix(liveProd.variationMatrixJson);
      const cell = findMatchingVariant(matrix, item.colorName, item.sizeName);
      basePrice =
        cell && cell.priceOverride > 0 ? cell.priceOverride : Number(liveProd.price) || item.unitPrice;
    }

    const isWholesaleApplied = minQty > 0 && wholesaleRate > 0 && item.quantity >= minQty;
    return {
      effectiveUnitPrice: isWholesaleApplied ? wholesaleRate : basePrice,
      isWholesaleApplied,
      minWholesaleQty: minQty,
      wholesaleRate,
    };
  }

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const { effectiveUnitPrice } = resolveCartItemUnit(item);
        return sum + effectiveUnitPrice * item.quantity;
      }, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, productMap]
  );

  const effectiveDiscount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal <= 0) return 0;
    if (appliedCoupon.minOrderAmount > 0 && cartSubtotal < appliedCoupon.minOrderAmount) {
      return 0;
    }
    let raw = 0;
    if (appliedCoupon.discountType === "fixed") {
      raw = appliedCoupon.discountValue;
    } else {
      raw = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount > 0) {
        raw = Math.min(raw, appliedCoupon.maxDiscount);
      }
    }
    return Math.min(cartSubtotal, Math.max(0, raw));
  }, [appliedCoupon, cartSubtotal]);

  const insideDhakaFee = Math.max(0, Number(settings.insideDhakaCharge) || 70);
  const outsideDhakaFee = Math.max(0, Number(settings.outsideDhakaCharge) || 130);
  const deliveryFee =
    cart.length === 0
      ? 0
      : deliveryArea === "Inside Dhaka"
      ? insideDhakaFee
      : outsideDhakaFee;
  const grandTotal = Math.max(0, cartSubtotal - effectiveDiscount) + deliveryFee;

  // Bilingual Settings Resolution
  const activePromoText = pickLocalized(settings.promoTextEn, settings.promoTextBn, lang);
  const activeHeroTitle = pickLocalized(settings.heroTitleEn, settings.heroTitleBn, lang);
  const activeHeroSubtitle = pickLocalized(settings.heroSubtitleEn, settings.heroSubtitleBn, lang);
  const activeHeroCta = pickLocalized(settings.heroCtaTextEn, settings.heroCtaTextBn, lang);

  function addToCart(
    product: MartProduct,
    options?: {
      variantChoice?: string;
      color?: MartProductColor | null;
      size?: string;
      qtyToAdd?: number;
      openDrawer?: boolean;
      overrideImage?: string;
    }
  ) {
    if (!isProductOrderable(product)) return;
    const colors = parseProductColors(product.colorsJson);
    const sizes = parseProductSizes(product.sizesList);
    const matrix = parseVariationMatrix(product.variationMatrixJson);

    const selectedColor = options?.color !== undefined ? options.color : colors[0] || null;
    const selectedSize = options?.size !== undefined ? options.size : sizes[0] || "";
    const matchedCell = findMatchingVariant(matrix, selectedColor?.nameEn, selectedSize);

    if (matchedCell && !matchedCell.active) return;

    const maxCap = Math.max(1, getProductOrderableMaxQty(product, matchedCell));
    if (product.fulfillmentType !== "dropship" && matchedCell && matchedCell.stock <= 0) {
      return;
    }

    const localizedVariants = parseProductVariants(
      pickLocalized(product.variantsEn, product.variantsBn, lang)
    );
    const colorLabel = selectedColor
      ? pickLocalized(selectedColor.nameEn, selectedColor.nameBn, lang)
      : "";
    const structuredVariant = [colorLabel, selectedSize].filter(Boolean).join(" / ");
    const chosenVariant =
      structuredVariant ||
      options?.variantChoice ||
      (localizedVariants.length > 0 ? localizedVariants[0] : "");

    const qtyToAdd = Math.max(1, options?.qtyToAdd || 1);
    const unitPricing = resolveProductPricing(product, matchedCell, 1);
    const itemKey = `${product.id}__${selectedColor?.nameEn || ""}__${selectedSize}__${
      options?.variantChoice || ""
    }`;
    const displayName = pickLocalized(product.nameEn, product.nameBn, lang, product.sku);
    const resolvedImage =
      options?.overrideImage || selectedColor?.imageUrl || product.imageUrl;

    setCart((prev) => {
      const existing = prev.find((i) => i.key === itemKey);
      if (existing) {
        return prev.map((i) =>
          i.key === itemKey
            ? {
                ...i,
                maxStock: maxCap,
                wholesaleMinQty: product.wholesaleMinQty,
                wholesalePrice: product.wholesalePrice,
                quantity: Math.min(maxCap, i.quantity + qtyToAdd),
              }
            : i
        );
      }
      return [
        ...prev,
        {
          key: itemKey,
          productId: product.id,
          sku: matchedCell?.sku || product.sku,
          variantSku: matchedCell?.sku || "",
          nameEn: product.nameEn || product.nameBn,
          nameBn: product.nameBn || product.nameEn,
          variant: chosenVariant,
          colorName: selectedColor?.nameEn || "",
          sizeName: selectedSize || "",
          unitPrice: unitPricing.baseUnitPrice,
          maxStock: maxCap,
          fulfillmentType: product.fulfillmentType === "dropship" ? "dropship" : "own_stock",
          wholesaleMinQty: product.wholesaleMinQty,
          wholesalePrice: product.wholesalePrice,
          imageUrl: resolvedImage,
          quantity: Math.min(maxCap, qtyToAdd),
        },
      ];
    });

    setConfirmedInvoice(null);
    trackMartAddToCart({
      id: product.id,
      sku: matchedCell?.sku || product.sku,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      unitPrice: unitPricing.baseUnitPrice,
      quantity: Math.min(maxCap, qtyToAdd),
      variant: chosenVariant,
    });
    const bannerMsg = `${displayName} — ${t.catalog.addedToCartSuffix}`;
    setAddedBanner(bannerMsg);
    setTimeout(() => {
      setAddedBanner((prev) => (prev === bannerMsg ? null : prev));
    }, 3000);

    if (options?.openDrawer) {
      setCheckoutStep(1);
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
          const { liveMaxStock, isLiveAvailable } = resolveCartLiveState(item);
          const cap = isLiveAvailable ? liveMaxStock : item.quantity;
          return {
            ...item,
            maxStock: liveMaxStock,
            quantity: Math.min(Math.max(1, cap), next),
          };
        })
        .filter((x): x is CartItem => x !== null)
    );
  }

  function removeCartItem(key: string) {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }

  function updateCartItemVariant(
    itemKey: string,
    next: { color?: MartProductColor | null; size?: string; legacyVariant?: string }
  ) {
    const current = cart.find((i) => i.key === itemKey);
    if (!current) return;
    const liveProd = productMap.get(current.productId);
    if (!liveProd || !isProductOrderable(liveProd)) return;

    const colors = parseProductColors(liveProd.colorsJson);
    const sizes = parseProductSizes(liveProd.sizesList);
    const matrix = parseVariationMatrix(liveProd.variationMatrixJson);

    const nextColor =
      next.color !== undefined
        ? next.color
        : colors.find(
            (c) => c.nameEn.trim().toLowerCase() === (current.colorName || "").trim().toLowerCase()
          ) ||
          colors[0] ||
          null;
    const nextSize =
      next.size !== undefined ? next.size : current.sizeName || sizes[0] || "";
    const nextLegacy =
      next.legacyVariant !== undefined
        ? next.legacyVariant
        : !nextColor && !nextSize
        ? current.variant
        : "";

    const matchedCell = findMatchingVariant(matrix, nextColor?.nameEn, nextSize);
    if (matchedCell) {
      if (!matchedCell.active) return;
      if (liveProd.fulfillmentType !== "dropship" && matchedCell.stock <= 0) return;
    }

    const maxCap = Math.max(1, getProductOrderableMaxQty(liveProd, matchedCell));
    const colorLabel = nextColor ? pickLocalized(nextColor.nameEn, nextColor.nameBn, lang) : "";
    const structuredVariant = [colorLabel, nextSize].filter(Boolean).join(" / ");
    const chosenVariant = structuredVariant || nextLegacy;
    const unitPricing = resolveProductPricing(liveProd, matchedCell, 1);
    const newKey = `${liveProd.id}__${nextColor?.nameEn || ""}__${nextSize}__${nextLegacy}`;
    const resolvedImage = nextColor?.imageUrl || liveProd.imageUrl || current.imageUrl;

    setCart((prev) => {
      const duplicateTarget = prev.find((i) => i.key === newKey && i.key !== itemKey);
      if (duplicateTarget) {
        return prev
          .filter((i) => i.key !== itemKey)
          .map((i) =>
            i.key === newKey
              ? {
                  ...i,
                  sku: matchedCell?.sku || liveProd.sku,
                  variantSku: matchedCell?.sku || "",
                  variant: chosenVariant,
                  colorName: nextColor?.nameEn || "",
                  sizeName: nextSize,
                  unitPrice: unitPricing.baseUnitPrice,
                  maxStock: maxCap,
                  imageUrl: resolvedImage,
                  quantity: Math.min(maxCap, i.quantity + current.quantity),
                }
              : i
          );
      }

      return prev.map((i) =>
        i.key === itemKey
          ? {
              ...i,
              key: newKey,
              sku: matchedCell?.sku || liveProd.sku,
              variantSku: matchedCell?.sku || "",
              variant: chosenVariant,
              colorName: nextColor?.nameEn || "",
              sizeName: nextSize,
              unitPrice: unitPricing.baseUnitPrice,
              maxStock: maxCap,
              imageUrl: resolvedImage,
              quantity: Math.min(maxCap, i.quantity),
            }
          : i
      );
    });
  }

  function openQuickView(product: MartProduct, initialColor?: MartProductColor | null) {
    const colors = parseProductColors(product.colorsJson);
    const sizes = parseProductSizes(product.sizesList);
    const gallery = parseGalleryUrls(product.galleryUrls, product.imageUrl);
    const legacyVariants = parseProductVariants(
      pickLocalized(product.variantsEn, product.variantsBn, lang)
    );
    const firstColor =
      initialColor && colors.some((c) => c.id === initialColor.id)
        ? initialColor
        : colors[0] || null;
    setQuickViewProduct(product);
    setQuickViewSelectedColor(firstColor);
    setQuickViewSelectedSize(sizes[0] || "");
    setQuickViewActiveImage(firstColor?.imageUrl || gallery[0] || product.imageUrl || "");
    setQuickViewVariant(
      colors.length === 0 && sizes.length === 0 && legacyVariants.length > 0
        ? legacyVariants[0]
        : ""
    );
    setQuickViewQty(1);
    trackMartViewContent({
      id: product.id,
      sku: product.sku,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      price: product.price,
      categories: product.categories,
    });
  }

  async function handleApplyCoupon() {
    setCouponError(null);
    const clean = couponInput.trim().toUpperCase();
    if (!clean) {
      setCouponError(tcop.errReasons.MISSING_COUPON_CODE);
      return;
    }
    setCouponLoading(true);
    try {
      const res = await validateMartCoupon(clean, cartSubtotal);
      if (!res.valid) {
        const reasonKey = (res.reasonCode || "DEFAULT") as keyof typeof tcop.errReasons;
        const msg = tcop.errReasons[reasonKey] || tcop.errReasons.DEFAULT;
        setCouponError(
          reasonKey === "COUPON_MIN_ORDER_NOT_MET" && res.minOrderAmount
            ? `${msg} (${formatMartPrice(res.minOrderAmount, lang)})`
            : msg
        );
        return;
      }
      setAppliedCoupon({
        code: res.coupon?.code || clean,
        discountAmount: res.discountAmount,
        minOrderAmount: Number(res.coupon?.minOrderAmount) || 0,
        discountType: res.coupon?.discountType === "fixed" ? "fixed" : "percent",
        discountValue: Number(res.coupon?.discountValue) || 0,
        maxDiscount: Number(res.coupon?.maxDiscount) || 0,
      });
      setCouponInput(res.coupon?.code || clean);
    } catch (err) {
      const apiErr = err as MartApiError;
      setCouponError(translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setCouponLoading(false);
    }
  }

  function handleCopyPaymentNumber(text: string) {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedAccountNo(true);
      setTimeout(() => setCopiedAccountNo(false), 2000);
    } catch {
      // Ignore clipboard permission errors
    }
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

    const hasUnavailableCartItem = cart.some((item) => {
      const liveState = resolveCartLiveState(item);
      if (!liveState.isLiveAvailable) return true;
      return liveState.liveProd?.fulfillmentType !== "dropship" && item.quantity > liveState.liveMaxStock;
    });
    if (hasUnavailableCartItem) {
      setCheckoutError(t.cart.cartUnavailableCheckoutErr);
      return;
    }

    const orderItems: MartOrderItem[] = cart.map((item) => {
      const { effectiveUnitPrice, isWholesaleApplied } = resolveCartItemUnit(item);
      const { liveProd, matchedCell, liveNameEn, liveNameBn, liveTitle } = resolveCartLiveState(item);
      return {
        productId: item.productId,
        sku: matchedCell?.sku || liveProd?.sku || item.sku,
        variantSku: matchedCell?.sku || item.variantSku || "",
        name: liveTitle,
        nameEn: liveNameEn,
        nameBn: liveNameBn,
        variant: item.variant,
        colorName: item.colorName || "",
        sizeName: item.sizeName || "",
        isWholesale: isWholesaleApplied,
        unitPrice: effectiveUnitPrice,
        quantity: item.quantity,
        lineTotal: effectiveUnitPrice * item.quantity,
        fulfillmentType: liveProd?.fulfillmentType || item.fulfillmentType || "own_stock",
        imageUrl: item.imageUrl,
      };
    });

    const activeProvider =
      paymentMethod === "Mobile Banking"
        ? onlineChannel === "bkash_qr"
          ? tqr.bkashQrTab
          : onlineChannel === "bangla_qr"
          ? tqr.banglaQrTab
          : manualChannel
        : "";

    const serverProviderValue =
      paymentMethod === "Mobile Banking"
        ? onlineChannel === "bkash_qr"
          ? "bKash Merchant QR"
          : onlineChannel === "bangla_qr"
          ? "Bangla QR"
          : manualChannel
        : "";

    const paymentLabel =
      paymentMethod === "Mobile Banking"
        ? `${tqr.checkoutOnlineOption} (${activeProvider})`
        : t.cart.codOption;

    setSubmittingOrder(true);
    try {
      const res = await placeMartOrder({
        items: orderItems,
        subtotal: cartSubtotal,
        discountCode: effectiveDiscount > 0 && appliedCoupon ? appliedCoupon.code : "",
        discountAmount: effectiveDiscount,
        deliveryArea,
        deliveryCharge: deliveryFee,
        totalAmount: grandTotal,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        paymentMethod,
        paymentProvider: serverProviderValue,
        transactionId: paymentMethod === "Mobile Banking" ? transactionId.trim() : "",
        notes:
          paymentMethod === "Mobile Banking" && serverProviderValue
            ? `[${serverProviderValue}] ${notes.trim()}`.trim()
            : notes.trim(),
      });

      const srv = res.record;
      const confirmedItems = srv?.itemsJson ? parseOrderItems(srv.itemsJson) : orderItems;

      setConfirmedInvoice({
        orderId: res.id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryArea,
        deliveryCharge: srv ? Number(srv.deliveryCharge) || deliveryFee : deliveryFee,
        subtotal: srv ? Number(srv.subtotal) || cartSubtotal : cartSubtotal,
        discountCode: srv?.discountCode ?? (effectiveDiscount > 0 ? appliedCoupon?.code : ""),
        discountAmount:
          srv?.discountAmount !== undefined ? Number(srv.discountAmount) || 0 : effectiveDiscount,
        totalAmount: srv ? Number(srv.totalAmount) || grandTotal : grandTotal,
        paymentMethod: paymentLabel,
        paymentProvider: srv?.paymentProvider || serverProviderValue,
        transactionId: paymentMethod === "Mobile Banking" ? transactionId.trim() : "",
        items: confirmedItems.length > 0 ? confirmedItems : orderItems,
        createdAt: new Date().toISOString(),
      });

      trackMartPurchase({
        orderId: res.id,
        items: (confirmedItems.length > 0 ? confirmedItems : orderItems).map((it) => ({
          sku: it.variantSku || it.sku,
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
        totalAmount: srv ? Number(srv.totalAmount) || grandTotal : grandTotal,
      });

      setCart([]);
      setCheckoutStep(1);
      setAppliedCoupon(null);
      setCouponInput("");
      setNotes("");
      setTransactionId("");
      if (customerName.trim() || phone.trim() || address.trim()) {
        setHasSavedPref(true);
      }

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

  function renderProductCard(product: MartProduct) {
    const hasDiscount =
      product.comparePrice > 0 && product.comparePrice > product.price;
    const isDropship = product.fulfillmentType === "dropship";
    const outOfStock = !isProductOrderable(product);
    const effectiveStock = getEffectiveProductStock(product);
    const colors = parseProductColors(product.colorsJson);
    const sizes = parseProductSizes(product.sizesList);
    const hasWholesale = product.wholesaleMinQty > 0 && product.wholesalePrice > 0;
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

    const selectedRawColor = cardSelectedColorByProdId[product.id];
    const activeCardColor =
      selectedRawColor && colors.some((c) => c.id === selectedRawColor.id)
        ? selectedRawColor
        : null;
    const cardDisplayImage = activeCardColor?.imageUrl || product.imageUrl;

    return (
      <article
        key={product.id}
        role="link"
        tabIndex={0}
        onClick={() => navigateToProductPage(product)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigateToProductPage(product);
          }
        }}
        className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-card hover:shadow-elevated hover:border-[#0B5336]/40 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#0B5336]"
      >
        <div>
          <div className="block w-full aspect-square bg-white p-2.5 sm:p-3 overflow-hidden border-b border-slate-100 text-left">
            <ProductMedia
              src={cardDisplayImage}
              alt={prodName}
              className="transition-transform duration-200 group-hover:scale-[1.03]"
            />
          </div>

          <div className="p-3 sm:p-5 lg:p-6 space-y-1.5 sm:space-y-2.5">
            <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-xs text-slate-500">
              <span className="font-semibold text-[#0B5336] truncate">
                {kickerParts.join(" · ")}
              </span>
              <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
                {outOfStock
                  ? t.catalog.outOfStock
                  : isDropship
                  ? t.catalog.availableToOrder
                  : `${toLocalizedDigits(effectiveStock, lang)} ${t.catalog.inStockSuffix}`}
              </span>
            </div>

            <h2 className="font-display text-sm sm:text-lg font-semibold text-slate-900 group-hover:text-[#0B5336] transition-colors leading-snug line-clamp-2">
              {prodName}
            </h2>

            {colors.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                {colors.slice(0, 5).map((clr) => {
                  const clrTitle = pickLocalized(clr.nameEn, clr.nameBn, lang);
                  const isChosen = activeCardColor?.id === clr.id;
                  return (
                    <button
                      key={clr.id}
                      type="button"
                      title={clrTitle}
                      aria-label={clrTitle}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCardSelectedColorByProdId((prev) => ({
                          ...prev,
                          [product.id]: clr,
                        }));
                      }}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                        isChosen
                          ? "ring-2 ring-[#0B5336] bg-brand-50"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: clr.hex || "#0B5336" }}
                      />
                    </button>
                  );
                })}
                {colors.length > 5 && (
                  <span className="font-mono text-[10px] text-slate-400 px-0.5">
                    +{toLocalizedDigits(colors.length - 5, lang)}
                  </span>
                )}
                {activeCardColor && (
                  <span className="text-[11px] font-medium text-[#0B5336] truncate max-w-[110px]">
                    {pickLocalized(
                      activeCardColor.nameEn,
                      activeCardColor.nameBn,
                      lang
                    )}
                  </span>
                )}
                {!activeCardColor && sizes.length > 0 && (
                  <span className="hidden sm:inline text-[11px] text-slate-500 ml-0.5 truncate">
                    · {sizes.slice(0, 4).join(", ")}
                  </span>
                )}
              </div>
            )}

            {colors.length === 0 && variants.length > 0 && (
              <div className="text-[11px] sm:text-xs text-slate-500 truncate">
                {t.catalog.optionsPrefix}: {variants.join(" · ")}
              </div>
            )}

            {prodDesc && (
              <p className="hidden sm:line-clamp-2 text-sm text-slate-600 leading-relaxed">
                {prodDesc}
              </p>
            )}

            {hasWholesale && (
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#0B5336] font-mono tabular-nums truncate">
                {tvar.wholesaleCardHintPrefix}:{" "}
                {formatMartPrice(product.wholesalePrice, lang)} (
                {toLocalizedDigits(product.wholesaleMinQty, lang)}+)
              </div>
            )}
          </div>
        </div>

        <div className="px-3 pb-3 pt-2.5 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="font-mono text-base sm:text-xl font-bold text-slate-900 tabular-nums">
                {formatMartPrice(product.price, lang)}
              </span>
              {hasDiscount && (
                <span className="font-mono text-[11px] sm:text-xs text-slate-400 line-through tabular-nums">
                  {formatMartPrice(product.comparePrice, lang)}
                </span>
              )}
            </div>
            {product.sku && (
              <div className="hidden sm:block font-mono text-[11px] text-slate-400">
                {t.common.sku}: {product.sku}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openQuickView(product, activeCardColor);
              }}
              aria-label={`${t.catalog.quickViewAria} ${prodName}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-[#0B5336] hover:text-[#0B5336] transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              type="button"
              disabled={outOfStock}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, {
                  color: activeCardColor || colors[0] || null,
                  qtyToAdd: 1,
                  openDrawer: false,
                  overrideImage:
                    activeCardColor?.imageUrl ||
                    colors[0]?.imageUrl ||
                    product.imageUrl,
                });
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B5336] px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold text-white hover:bg-[#08412A] disabled:opacity-50 transition-colors min-h-[40px] sm:min-h-[44px] whitespace-nowrap"
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {outOfStock ? t.catalog.soldOut : t.catalog.addToCart}
              </span>
            </button>
          </div>
        </div>
      </article>
    );
  }

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
        onSearchChange={(val) => {
          setSearchQuery(val);
        }}
        categories={visibleCategories}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategoryFilter}
        onClearCategories={() => {
          setSelectedCategories([]);
          if (focusedProductSlug) {
            router.push("/mart");
          }
        }}
        categoryThumbs={categoryThumbMap}
        categoryCounts={categoryCountsMap}
        cartCount={cartCount}
        onOpenCart={() => {
          setCheckoutStep(1);
          setCartOpen(true);
        }}
        onOpenTrackOrder={() => {
          setTrackOpen(true);
          setTrackingError(null);
        }}
        searchBundle={smartSearchBundle}
        onSelectProductSuggestion={(prod) => navigateToProductPage(prod)}
        onAddToCartFromSearch={(prod) =>
          addToCart(prod, {
            qtyToAdd: 1,
            openDrawer: false,
            overrideImage: prod.imageUrl,
          })
        }
        onCommitSearch={(term) => {
          if (focusedProductSlug && term.trim()) {
            router.push(`/mart?q=${encodeURIComponent(term.trim())}`);
          }
        }}
      />

      {/* Cart Feedback Toast */}
      {addedBanner && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 shadow-elevated"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="h-4 w-4 text-[#0B5336] shrink-0" />
            <span className="truncate">{addedBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setCheckoutStep(1);
              setCartOpen(true);
            }}
            className="text-[#0B5336] underline font-bold ml-1 whitespace-nowrap shrink-0 min-h-[32px]"
          >
            {t.catalog.viewCart}
          </button>
        </div>
      )}

      <main id="main-content" className="flex-1">
        {focusedProductSlug ? (
          /* DEDICATED FULL PRODUCT DETAIL PAGE (/mart/p/[slug]) */
          <section className="py-6 sm:py-10 lg:py-12 pb-28 sm:pb-14">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
              {loading && !focusedProduct ? (
                <div className="space-y-6">
                  <div className="h-10 w-56 rounded-xl bg-white border border-slate-200 animate-pulse" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                    <div className="lg:col-span-6 aspect-square rounded-2xl bg-white border border-slate-200 animate-pulse" />
                    <div className="lg:col-span-6 h-[480px] rounded-2xl bg-white border border-slate-200 animate-pulse" />
                  </div>
                </div>
              ) : !focusedProduct ? (
                <div className="space-y-8">
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[#0B5336]">
                      <Package className="h-7 w-7" />
                    </div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                      {t.quickView.productNotFoundTitle}
                    </h1>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      {t.quickView.productNotFoundDesc}
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/mart"
                        className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>{t.quickView.backToStoreBtn}</span>
                      </Link>
                    </div>
                  </div>

                  {products.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                        {t.quickView.relatedProductsTitle}
                      </h2>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
                        {products.slice(0, 6).map((prod) => renderProductCard(prod))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                (() => {
                  const pGallery = parseGalleryUrls(
                    focusedProduct.galleryUrls,
                    focusedProduct.imageUrl
                  );
                  const pColors = parseProductColors(focusedProduct.colorsJson);
                  const pSizes = parseProductSizes(focusedProduct.sizesList);
                  const pMatrix = parseVariationMatrix(focusedProduct.variationMatrixJson);
                  const activeCell = findMatchingVariant(
                    pMatrix,
                    pdpSelectedColor?.nameEn,
                    pdpSelectedSize
                  );
                  const pPricing = resolveProductPricing(focusedProduct, activeCell, pdpQty);
                  const pMaxQty = Math.max(
                    1,
                    getProductOrderableMaxQty(focusedProduct, activeCell)
                  );
                  const pVariantOut =
                    !isProductOrderable(focusedProduct) ||
                    (activeCell
                      ? !activeCell.active ||
                        (focusedProduct.fulfillmentType !== "dropship" &&
                          activeCell.stock <= 0)
                      : false);
                  const pMinWholesale = Number(focusedProduct.wholesaleMinQty) || 0;
                  const pWholesalePrice = Number(focusedProduct.wholesalePrice) || 0;
                  const legacyVars = parseProductVariants(
                    pickLocalized(focusedProduct.variantsEn, focusedProduct.variantsBn, lang)
                  );
                  const activeDisplayStock = activeCell
                    ? activeCell.stock
                    : getEffectiveProductStock(focusedProduct);
                  const pName = pickLocalized(
                    focusedProduct.nameEn,
                    focusedProduct.nameBn,
                    lang,
                    focusedProduct.sku
                  );
                  const pDesc = pickLocalized(
                    focusedProduct.descriptionEn,
                    focusedProduct.descriptionBn,
                    lang,
                    t.quickView.defaultDesc
                  );
                  const pCategories = parseCsvSlugs(focusedProduct.categories).map((slug) => {
                    const c = categoryMap.get(slug);
                    return {
                      slug,
                      title: c ? pickLocalized(c.nameEn, c.nameBn, lang, slug) : slug,
                    };
                  });
                  const pLabels = parseCsvSlugs(focusedProduct.labels).map((slug) => {
                    const l = labelMap.get(slug);
                    return l ? pickLocalized(l.nameEn, l.nameBn, lang, slug) : slug;
                  });
                  const saveAmount =
                    pPricing.comparePrice > pPricing.unitPrice
                      ? pPricing.comparePrice - pPricing.unitPrice
                      : 0;
                  const isLinkCopied = copiedLinkProdId === focusedProduct.id;

                  return (
                    <>
                      {/* Top Breadcrumb & Share Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-3.5">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <Link
                            href="/mart"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] transition-colors min-h-[38px]"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>{t.quickView.backToStoreBtn}</span>
                          </Link>
                          {pCategories.map((cat) => (
                            <span
                              key={cat.slug}
                              className="hidden sm:inline-flex items-center rounded-lg bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs font-semibold text-[#0B5336]"
                            >
                              {cat.title}
                            </span>
                          ))}
                          {pLabels.map((lbl) => (
                            <span
                              key={lbl}
                              className="hidden md:inline-flex items-center rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
                            >
                              {lbl}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleCopyProductLink(focusedProduct, e)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors min-h-[38px] ${
                            isLinkCopied
                              ? "border-[#0B5336] bg-brand-50 text-[#0B5336]"
                              : "border-slate-200 bg-white text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336]"
                          }`}
                        >
                          {isLinkCopied ? (
                            <Check className="h-3.5 w-3.5 text-[#0B5336]" />
                          ) : (
                            <Link2 className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {isLinkCopied
                              ? t.quickView.linkCopiedBtn
                              : t.quickView.copyLinkBtn}
                          </span>
                        </button>
                      </div>

                      {/* 2-Column Contiguous Purchase Module */}
                      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-card">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                          {/* Left Column: 1:1 Uncropped White-Canvas Gallery */}
                          <div className="lg:col-span-6 space-y-3.5">
                            <div className="aspect-square rounded-2xl bg-white p-4 sm:p-6 overflow-hidden border border-slate-200">
                              <ProductMedia
                                src={pdpActiveImage || focusedProduct.imageUrl}
                                alt={pName}
                              />
                            </div>

                            {pGallery.length > 1 && (
                              <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1">
                                {pGallery.map((imgUrl, idx) => {
                                  const active =
                                    imgUrl === (pdpActiveImage || focusedProduct.imageUrl);
                                  return (
                                    <button
                                      key={`${imgUrl}-${idx}`}
                                      type="button"
                                      onClick={() => setPdpActiveImage(imgUrl)}
                                      className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-white p-1.5 overflow-hidden border-2 shrink-0 transition-colors ${
                                        active
                                          ? "border-[#0B5336]"
                                          : "border-slate-200 hover:border-slate-400"
                                      }`}
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={normalizeMartImageUrl(imgUrl)}
                                        alt={pName}
                                        referrerPolicy="no-referrer"
                                        className="h-full w-full object-contain"
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Right Column: Title, Price, Variants, Quantity & Direct Buy Now */}
                          <div className="lg:col-span-6 space-y-5">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                                <span className="font-semibold text-[#0B5336]">
                                  {[
                                    ...(pCategories.length > 0
                                      ? pCategories.map((c) => c.title)
                                      : [t.catalog.generalFallback]),
                                    ...pLabels,
                                  ].join(" · ")}
                                </span>
                                {(activeCell?.sku || focusedProduct.sku) && (
                                  <span className="font-mono text-xs text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1">
                                    {t.common.sku}: {activeCell?.sku || focusedProduct.sku}
                                  </span>
                                )}
                              </div>

                              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
                                {pName}
                              </h1>
                            </div>

                            {/* Price & Savings Block */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                              <div className="flex flex-wrap items-baseline gap-3">
                                <span className="font-mono text-2xl sm:text-3xl font-bold text-[#0B5336] tabular-nums">
                                  {formatMartPrice(pPricing.unitPrice, lang)}
                                </span>
                                {pPricing.comparePrice > pPricing.unitPrice && (
                                  <span className="font-mono text-sm sm:text-base text-slate-400 line-through tabular-nums">
                                    {formatMartPrice(pPricing.comparePrice, lang)}
                                  </span>
                                )}
                                {saveAmount > 0 && (
                                  <span className="rounded-lg bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs font-mono font-semibold text-[#0B5336] tabular-nums">
                                    {t.quickView.saveAmountPrefix}{" "}
                                    {formatMartPrice(saveAmount, lang)}
                                  </span>
                                )}
                                {pPricing.isWholesale && (
                                  <span className="rounded-lg bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs font-semibold text-[#0B5336]">
                                    {tvar.wholesaleActiveBadge}
                                  </span>
                                )}
                              </div>

                              {pMinWholesale > 0 &&
                                pWholesalePrice > 0 &&
                                !pPricing.isWholesale && (
                                  <div className="rounded-xl border border-brand-200 bg-white px-3 py-2 text-xs font-medium text-[#0B5336] font-mono tabular-nums">
                                    {tvar.wholesaleUnlockPrefix}{" "}
                                    {toLocalizedDigits(pMinWholesale, lang)}{" "}
                                    {tvar.wholesaleUnlockMiddle}{" "}
                                    <strong>{formatMartPrice(pWholesalePrice, lang)}</strong>{" "}
                                    {tvar.wholesaleUnitSuffix}
                                  </div>
                                )}

                              <div className="text-xs font-mono text-slate-600 tabular-nums pt-0.5">
                                {t.quickView.availabilityLabel}:{" "}
                                <span
                                  className={
                                    !pVariantOut
                                      ? "font-semibold text-[#0B5336]"
                                      : "font-semibold text-red-600"
                                  }
                                >
                                  {pVariantOut
                                    ? t.quickView.outOfStock
                                    : focusedProduct.fulfillmentType === "dropship"
                                    ? t.quickView.availableReady
                                    : `${toLocalizedDigits(activeDisplayStock, lang)} ${t.quickView.unitsInStockSuffix}`}
                                </span>
                              </div>
                            </div>

                            {/* Color Swatches */}
                            {pColors.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-700">
                                  {tvar.selectColorLabel}:{" "}
                                  <span className="text-slate-900">
                                    {pdpSelectedColor
                                      ? pickLocalized(
                                          pdpSelectedColor.nameEn,
                                          pdpSelectedColor.nameBn,
                                          lang
                                        )
                                      : ""}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {pColors.map((clr) => {
                                    const selected = pdpSelectedColor?.id === clr.id;
                                    const label = pickLocalized(clr.nameEn, clr.nameBn, lang);
                                    return (
                                      <button
                                        key={clr.id}
                                        type="button"
                                        onClick={() => {
                                          setPdpSelectedColor(clr);
                                          if (clr.imageUrl) {
                                            setPdpActiveImage(clr.imageUrl);
                                          }
                                        }}
                                        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors min-h-[42px] ${
                                          selected
                                            ? "border-[#0B5336] bg-brand-50 text-[#0B5336]"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                                        }`}
                                      >
                                        <span
                                          className="h-4 w-4 rounded-full border border-slate-300 shrink-0"
                                          style={{ backgroundColor: clr.hex || "#0B5336" }}
                                        />
                                        <span>{label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Size Matrix Chips */}
                            {pSizes.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-700">
                                  {tvar.selectSizeLabel}:{" "}
                                  <span className="font-mono text-slate-900">
                                    {pdpSelectedSize}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {pSizes.map((sz) => {
                                    const cell = findMatchingVariant(
                                      pMatrix,
                                      pdpSelectedColor?.nameEn,
                                      sz
                                    );
                                    const cellDisabled =
                                      cell &&
                                      (!cell.active ||
                                        (focusedProduct.fulfillmentType !== "dropship" &&
                                          cell.stock <= 0));
                                    const selected = pdpSelectedSize === sz;
                                    return (
                                      <button
                                        key={sz}
                                        type="button"
                                        onClick={() => setPdpSelectedSize(sz)}
                                        className={`rounded-xl border px-4 py-2 text-xs font-mono font-semibold transition-colors min-h-[42px] min-w-[48px] ${
                                          selected
                                            ? "border-[#0B5336] bg-[#0B5336] text-white"
                                            : cellDisabled
                                            ? "border-slate-200 bg-slate-100 text-slate-400 line-through"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                                        }`}
                                      >
                                        {sz}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Legacy Single-Line Variants Fallback */}
                            {pColors.length === 0 &&
                              pSizes.length === 0 &&
                              legacyVars.length > 0 && (
                                <div className="space-y-2">
                                  <label className="block text-xs font-semibold text-slate-700">
                                    {t.quickView.selectVariant}
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {legacyVars.map((variant) => (
                                      <button
                                        key={variant}
                                        type="button"
                                        onClick={() => setPdpVariant(variant)}
                                        className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors min-h-[42px] ${
                                          pdpVariant === variant
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

                            {pVariantOut && isProductOrderable(focusedProduct) && (
                              <p className="text-xs font-medium text-red-600">
                                {tvar.selectedVariantOutOfStock}
                              </p>
                            )}

                            {/* Quantity Stepper + Add to Cart + Direct Buy Now */}
                            <div className="pt-2 space-y-3 border-t border-slate-200">
                              <div className="flex items-center justify-between gap-4">
                                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                                  <button
                                    type="button"
                                    onClick={() => setPdpQty((q) => Math.max(1, q - 1))}
                                    aria-label={t.quickView.decreaseQtyAria}
                                    className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-slate-600 hover:text-slate-900"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-12 text-center font-mono text-sm font-bold tabular-nums">
                                    {toLocalizedDigits(pdpQty, lang)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPdpQty((q) => Math.min(pMaxQty, q + 1))
                                    }
                                    aria-label={t.quickView.increaseQtyAria}
                                    className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-slate-600 hover:text-slate-900"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="text-right">
                                  <div className="text-[11px] text-slate-500">
                                    {t.cart.subtotal}
                                  </div>
                                  <div className="font-mono text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
                                    {formatMartPrice(pPricing.unitPrice * pdpQty, lang)}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  disabled={pVariantOut}
                                  onClick={() =>
                                    addToCart(focusedProduct, {
                                      variantChoice: pdpVariant,
                                      color: pdpSelectedColor,
                                      size: pdpSelectedSize,
                                      qtyToAdd: pdpQty,
                                      openDrawer: false,
                                      overrideImage:
                                        pdpSelectedColor?.imageUrl ||
                                        focusedProduct.imageUrl,
                                    })
                                  }
                                  className="btn-outline py-3 text-xs sm:text-sm gap-2 disabled:opacity-50 min-h-[48px]"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  <span>{t.quickView.addToCart}</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={pVariantOut}
                                  onClick={() =>
                                    addToCart(focusedProduct, {
                                      variantChoice: pdpVariant,
                                      color: pdpSelectedColor,
                                      size: pdpSelectedSize,
                                      qtyToAdd: pdpQty,
                                      openDrawer: true,
                                      overrideImage:
                                        pdpSelectedColor?.imageUrl ||
                                        focusedProduct.imageUrl,
                                    })
                                  }
                                  className="btn-primary py-3 text-xs sm:text-sm gap-2 disabled:opacity-50 min-h-[48px]"
                                >
                                  <span>
                                    {pVariantOut ? t.quickView.soldOut : t.quickView.buyNow}
                                  </span>
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Transparent Delivery Charge & Helpline Box */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs">
                              <div className="font-semibold text-slate-800 flex items-center gap-2">
                                <Truck className="h-4 w-4 text-[#0B5336]" />
                                <span>{t.hero.deliveryCardTitle}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2.5">
                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center justify-between">
                                  <span className="text-slate-600">
                                    {t.hero.insideDhakaLabel}
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                                    {formatMartPrice(insideDhakaFee, lang)}
                                  </span>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center justify-between">
                                  <span className="text-slate-600">
                                    {t.hero.outsideDhakaLabel}
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                                    {formatMartPrice(outsideDhakaFee, lang)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 pt-1">
                                <span>{t.hero.directHelplineLabel}</span>
                                <a
                                  href={MART_CONTACT_TEL}
                                  className="font-mono font-semibold text-[#0B5336] hover:underline tabular-nums"
                                >
                                  {MART_CONTACT_PHONE}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Full Product Overview & Description Section */}
                      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 space-y-3 shadow-card">
                        <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                          {t.quickView.specificationsTitle}
                        </h2>
                        <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                          {pDesc}
                        </div>
                      </div>

                      {/* Related Products Section */}
                      {relatedProducts.length > 0 && (
                        <div className="space-y-4 sm:space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                            <div>
                              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                                {t.quickView.relatedProductsTitle}
                              </h2>
                              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                {t.quickView.relatedProductsSubtitle}
                              </p>
                            </div>
                            <Link
                              href="/mart"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5336] hover:underline"
                            >
                              <span>{t.quickView.backToStoreBtn}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
                            {relatedProducts.map((prod) => renderProductCard(prod))}
                          </div>
                        </div>
                      )}

                      {/* Sticky Mobile Bottom Purchase Bar */}
                      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-xs px-3 py-2.5 shadow-elevated">
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="min-w-0">
                            <div className="text-[10px] text-slate-500 truncate">{pName}</div>
                            <div className="font-mono text-base font-bold text-[#0B5336] tabular-nums">
                              {formatMartPrice(pPricing.unitPrice * pdpQty, lang)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={pVariantOut}
                              onClick={() =>
                                addToCart(focusedProduct, {
                                  variantChoice: pdpVariant,
                                  color: pdpSelectedColor,
                                  size: pdpSelectedSize,
                                  qtyToAdd: pdpQty,
                                  openDrawer: false,
                                  overrideImage:
                                    pdpSelectedColor?.imageUrl || focusedProduct.imageUrl,
                                })
                              }
                              className="btn-outline px-3 py-2 text-xs gap-1.5 disabled:opacity-50 min-h-[42px]"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              <span>{t.quickView.addToCart}</span>
                            </button>
                            <button
                              type="button"
                              disabled={pVariantOut}
                              onClick={() =>
                                addToCart(focusedProduct, {
                                  variantChoice: pdpVariant,
                                  color: pdpSelectedColor,
                                  size: pdpSelectedSize,
                                  qtyToAdd: pdpQty,
                                  openDrawer: true,
                                  overrideImage:
                                    pdpSelectedColor?.imageUrl || focusedProduct.imageUrl,
                                })
                              }
                              className="btn-primary px-4 py-2 text-xs disabled:opacity-50 min-h-[42px]"
                            >
                              {pVariantOut ? t.quickView.soldOut : t.quickView.buyNow}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()
              )}
            </div>
          </section>
        ) : (
          <>
        {/* Compact Promotional Hero Section */}
        <section className="bg-slate-900 text-white border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
              <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                <div className="text-[11px] sm:text-xs font-semibold tracking-wide text-gold-400">
                  {t.hero.kicker}
                </div>
                <h1
                  className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.16]"
                  style={{ textWrap: "balance" }}
                >
                  {activeHeroTitle}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {activeHeroSubtitle}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                  <a
                    href="#mart-catalog"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B5336] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-[#08412A] transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
                  >
                    <PackageSearch className="h-4 w-4 text-gold-400" />
                    <span>{t.hero.trackExistingOrder}</span>
                  </button>
                </div>
              </div>

              {/* Delivery Charge Transparent Summary Box (Compact 2-Col Strip on Mobile) */}
              <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-800/60 p-4 sm:p-5 lg:p-6 space-y-3">
                <div className="text-[11px] sm:text-xs font-semibold tracking-wide text-gold-400">
                  {t.hero.deliveryCardTitle}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 text-xs sm:text-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between lg:pb-3 lg:border-b border-slate-700 rounded-xl lg:rounded-none bg-slate-900/40 lg:bg-transparent p-2.5 lg:p-0">
                    <span className="text-slate-300 text-[11px] sm:text-sm">{t.hero.insideDhakaLabel}</span>
                    <span className="font-mono font-bold text-white tabular-nums text-sm sm:text-base lg:text-sm mt-0.5 lg:mt-0">
                      {formatMartPrice(insideDhakaFee, lang)}
                    </span>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between lg:pb-3 lg:border-b border-slate-700 rounded-xl lg:rounded-none bg-slate-900/40 lg:bg-transparent p-2.5 lg:p-0">
                    <span className="text-slate-300 text-[11px] sm:text-sm">{t.hero.outsideDhakaLabel}</span>
                    <span className="font-mono font-bold text-white tabular-nums text-sm sm:text-base lg:text-sm mt-0.5 lg:mt-0">
                      {formatMartPrice(outsideDhakaFee, lang)}
                    </span>
                  </div>
                </div>
                <div className="hidden lg:flex items-center justify-between text-xs text-slate-400 pt-1">
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
        </section>

        {/* Trust Badges Strip (Compact 2x2 on Mobile) */}
        <section className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                    {t.trust.fastDeliveryTitle}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {t.trust.fastDeliveryDesc}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <Banknote className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                    {t.trust.codTitle}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {t.trust.codDesc}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                    {t.trust.authenticTitle}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {t.trust.authenticDesc}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336] shrink-0">
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                    {t.trust.easyReturnTitle}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {t.trust.easyReturnDesc}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Store Catalog Section */}
        <section id="mart-catalog" className="py-6 sm:py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
            {/* Combined Horizontal Sliding Category & Label Filter Toolbar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 space-y-3.5">
              {/* Row 1: Sliding Categories + Sort + Count */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {t.catalog.categoriesTitle}
                    </span>
                    <span className="lg:hidden text-[11px] text-slate-500 font-mono tabular-nums whitespace-nowrap">
                      {toLocalizedDigits(filteredProducts.length, lang)}{" "}
                      {filteredProducts.length === 1
                        ? t.catalog.productSingular
                        : t.catalog.productPlural}
                    </span>
                  </div>
                  <div className="flex lg:flex-wrap items-center gap-2.5 overflow-x-auto snap-x scrollbar-none pb-1 lg:pb-0">
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      className={`inline-flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 snap-start min-h-[48px] border ${
                        selectedCategories.length === 0
                          ? "bg-[#0B5336] border-[#0B5336] text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
                          selectedCategories.length === 0
                            ? "bg-white/15 text-white"
                            : "bg-white text-[#0B5336] border border-slate-200"
                        }`}
                      >
                        <Layers className="h-4 w-4" />
                      </span>
                      <span>{t.catalog.allCategories}</span>
                      <span
                        className={`font-mono text-[11px] tabular-nums ${
                          selectedCategories.length === 0 ? "text-emerald-100" : "text-slate-400"
                        }`}
                      >
                        {toLocalizedDigits(products.length, lang)}
                      </span>
                    </button>
                    {visibleCategories.map((cat) => {
                      const active = selectedCategories.includes(cat.slug);
                      const catTitle = pickLocalized(cat.nameEn, cat.nameBn, lang, cat.slug);
                      const catThumb = categoryThumbMap[cat.slug] || "";
                      const catCount = categoryCountsMap[cat.slug] ?? 0;
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => toggleCategoryFilter(cat.slug)}
                          className={`inline-flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 snap-start min-h-[48px] border ${
                            active
                              ? "bg-[#0B5336] border-[#0B5336] text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336]"
                          }`}
                        >
                          <CategoryMedia
                            src={catThumb}
                            alt={catTitle}
                            active={active}
                            sizeClass="h-9 w-9"
                            iconClass="h-4 w-4"
                          />
                          <span>{catTitle}</span>
                          <span
                            className={`font-mono text-[11px] tabular-nums ${
                              active ? "text-emerald-100" : "text-slate-400"
                            }`}
                          >
                            {toLocalizedDigits(catCount, lang)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 lg:self-end">
                  <span className="hidden lg:inline text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
                    {toLocalizedDigits(filteredProducts.length, lang)}{" "}
                    {filteredProducts.length === 1
                      ? t.catalog.productSingular
                      : t.catalog.productPlural}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label={t.catalog.sortAria}
                    className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0B5336] min-h-[42px]"
                  >
                    <option value="featured">{t.catalog.sortFeatured}</option>
                    <option value="price_asc">{t.catalog.sortPriceAsc}</option>
                    <option value="price_desc">{t.catalog.sortPriceDesc}</option>
                    <option value="newest">{t.catalog.sortNewest}</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Collections & Labels Sliding Rail */}
              {visibleLabels.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-500">
                      {t.catalog.labelsTitle}
                    </div>
                    <div className="flex lg:flex-wrap items-center gap-2 overflow-x-auto snap-x scrollbar-none pb-1 lg:pb-0">
                      <button
                        type="button"
                        onClick={() => setSelectedLabels([])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 snap-start min-h-[38px] border ${
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 snap-start min-h-[38px] border ${
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
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 self-start sm:self-end min-h-[38px]"
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap min-h-[38px]"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>{t.catalog.clearFilters}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Contextual Active Category Cover Banner */}
            {!loading && activeCategoryObj && (() => {
              const activeTitle = pickLocalized(
                activeCategoryObj.nameEn,
                activeCategoryObj.nameBn,
                lang,
                activeCategoryObj.slug
              );
              const activeDesc = pickLocalized(
                activeCategoryObj.descriptionEn,
                activeCategoryObj.descriptionBn,
                lang
              );
              const activeThumb = categoryThumbMap[activeCategoryObj.slug] || "";
              const parentTitle = activeCategoryParent
                ? pickLocalized(
                    activeCategoryParent.nameEn,
                    activeCategoryParent.nameBn,
                    lang,
                    activeCategoryParent.slug
                  )
                : "";

              return (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-xs">
                  <CategoryMedia
                    src={activeThumb}
                    alt={activeTitle}
                    sizeClass="h-20 w-24 sm:h-24 sm:w-32"
                    iconClass="h-8 w-8"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        {activeCategoryParent && (
                          <button
                            type="button"
                            onClick={() => setSelectedCategories([activeCategoryParent.slug])}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] min-h-[30px]"
                          >
                            <ArrowLeft className="h-3 w-3" />
                            <span>{parentTitle}</span>
                          </button>
                        )}
                        <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 truncate">
                          {activeTitle}
                        </h2>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#0B5336] bg-brand-50 border border-brand-200 rounded-lg px-2.5 py-1 tabular-nums whitespace-nowrap">
                        {toLocalizedDigits(filteredProducts.length, lang)}{" "}
                        {filteredProducts.length === 1
                          ? t.catalog.productSingular
                          : t.catalog.productPlural}
                      </span>
                    </div>

                    {activeDesc && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {activeDesc}
                      </p>
                    )}

                    {activeCategoryChildren.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {t.catalog.subcategoriesLabel}:
                        </span>
                        {activeCategoryChildren.map((child) => {
                          const childTitle = pickLocalized(
                            child.nameEn,
                            child.nameBn,
                            lang,
                            child.slug
                          );
                          const childCount = categoryCountsMap[child.slug] ?? 0;
                          return (
                            <button
                              key={child.slug}
                              type="button"
                              onClick={() => setSelectedCategories([child.slug])}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 pl-1 pr-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#0B5336] hover:bg-white hover:text-[#0B5336] transition-colors min-h-[34px]"
                            >
                              <CategoryMedia
                                src={categoryThumbMap[child.slug] || ""}
                                alt={childTitle}
                                sizeClass="h-6 w-6"
                                iconClass="h-3 w-3"
                              />
                              <span>{childTitle}</span>
                              <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                                ({toLocalizedDigits(childCount, lang)})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Smart Search "Did You Mean?" Correction Banner */}
            {!loading && searchQuery.trim().length > 0 && smartSearchBundle.didYouMean && (
              <div className="rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <RotateCcw className="h-4 w-4 text-[#0B5336] shrink-0" />
                  <span className="text-slate-700 font-medium">
                    {t.catalog.didYouMeanBannerPrefix}:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery(smartSearchBundle.didYouMean!.suggestedTerm)
                    }
                    className="rounded-lg bg-[#0B5336] px-3 py-1 text-xs font-bold text-white hover:bg-[#08412A] transition-colors"
                  >
                    {smartSearchBundle.didYouMean.suggestedTerm}
                  </button>
                </div>
                {smartSearchBundle.autoCompleteTerms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {smartSearchBundle.autoCompleteTerms.slice(0, 3).map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSearchQuery(term)}
                        className="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#0B5336] hover:bg-brand-50 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Catalog Loading / Empty / 2-Column Mobile Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="h-[290px] sm:h-[400px] rounded-2xl border border-slate-200 bg-white animate-pulse"
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
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-3">
                  <Package className="h-10 w-10 text-slate-300 mx-auto" />
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    {t.catalog.noMatchTitle}
                  </h2>
                  <p className="text-sm text-slate-600">{t.catalog.noMatchDesc}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {smartSearchBundle.didYouMean && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearchQuery(smartSearchBundle.didYouMean!.suggestedTerm)
                        }
                        className="btn-primary px-4 py-2 text-xs gap-1.5"
                      >
                        <span>
                          {t.catalog.didYouMeanBannerPrefix}:{" "}
                          {smartSearchBundle.didYouMean.suggestedTerm}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="btn-outline px-4 py-2 text-xs"
                    >
                      {t.catalog.resetFiltersBtn}
                    </button>
                  </div>
                </div>

                {smartSearchBundle.fallbackProducts.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-xs sm:text-sm font-semibold text-slate-700">
                      {t.catalog.showingClosestMatchesBanner}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
                      {smartSearchBundle.fallbackProducts.map((product) =>
                        renderProductCard(product)
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
                {filteredProducts.map((product) => renderProductCard(product))}
              </div>
            )}
          </div>
        </section>
          </>
        )}
      </main>

      <MartFooter
        onOpenTrackOrder={() => {
          setTrackOpen(true);
          setTrackingError(null);
        }}
      />

      {/* PRODUCT QUICK VIEW MODAL WITH GALLERY, COLOR SWATCHES, SIZES & WHOLESALE PRICING */}
      {quickViewProduct && (() => {
        const qGallery = parseGalleryUrls(
          quickViewProduct.galleryUrls,
          quickViewProduct.imageUrl
        );
        const qColors = parseProductColors(quickViewProduct.colorsJson);
        const qSizes = parseProductSizes(quickViewProduct.sizesList);
        const qMatrix = parseVariationMatrix(quickViewProduct.variationMatrixJson);
        const activeCell = findMatchingVariant(
          qMatrix,
          quickViewSelectedColor?.nameEn,
          quickViewSelectedSize
        );
        const qPricing = resolveProductPricing(quickViewProduct, activeCell, quickViewQty);
        const qMaxQty = Math.max(1, getProductOrderableMaxQty(quickViewProduct, activeCell));
        const qVariantOut =
          !isProductOrderable(quickViewProduct) ||
          (activeCell
            ? !activeCell.active ||
              (quickViewProduct.fulfillmentType !== "dropship" && activeCell.stock <= 0)
            : false);
        const qMinWholesale = Number(quickViewProduct.wholesaleMinQty) || 0;
        const qWholesalePrice = Number(quickViewProduct.wholesalePrice) || 0;
        const legacyVars = parseProductVariants(
          pickLocalized(quickViewProduct.variantsEn, quickViewProduct.variantsBn, lang)
        );
        const activeDisplayStock = activeCell
          ? activeCell.stock
          : getEffectiveProductStock(quickViewProduct);

        return (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-view-title"
          >
            <div className="w-full max-w-3xl rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
              {/* Mobile Sheet Drag Handle */}
              <div className="sm:hidden pt-2.5 pb-1 bg-slate-50 flex justify-center shrink-0">
                <div className="w-10 h-1.5 rounded-full bg-slate-300" />
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 shrink-0">
                <div className="text-xs font-semibold text-slate-500 truncate pr-2">
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
                  {(activeCell?.sku || quickViewProduct.sku)
                    ? ` · ${t.common.sku} ${activeCell?.sku || quickViewProduct.sku}`
                    : ""}
                </div>
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(null)}
                  aria-label={t.quickView.closeAria}
                  className="inline-flex items-center justify-center rounded-xl min-h-[40px] min-w-[40px] text-slate-500 hover:bg-slate-200 hover:text-slate-900 shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
                {/* Multi-Image Gallery Viewer */}
                <div className="md:col-span-6 space-y-3">
                  <div className="aspect-square rounded-xl bg-white p-3 overflow-hidden border border-slate-200">
                    <ProductMedia
                      src={quickViewActiveImage || quickViewProduct.imageUrl}
                      alt={pickLocalized(quickViewProduct.nameEn, quickViewProduct.nameBn, lang)}
                    />
                  </div>
                  {qGallery.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                      {qGallery.map((imgUrl, idx) => {
                        const active = imgUrl === (quickViewActiveImage || quickViewProduct.imageUrl);
                        return (
                          <button
                            key={`${imgUrl}-${idx}`}
                            type="button"
                            onClick={() => setQuickViewActiveImage(imgUrl)}
                            className={`h-14 w-14 rounded-lg bg-white p-1 overflow-hidden border-2 shrink-0 transition-colors ${
                              active ? "border-[#0B5336]" : "border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={normalizeMartImageUrl(imgUrl)}
                              alt={pickLocalized(
                                quickViewProduct.nameEn,
                                quickViewProduct.nameBn,
                                lang
                              )}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-contain"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Product Details + Interactive Variations */}
                <div className="md:col-span-6 space-y-3">
                  <h2
                    id="quick-view-title"
                    className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug"
                  >
                    {pickLocalized(quickViewProduct.nameEn, quickViewProduct.nameBn, lang)}
                  </h2>

                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-2xl font-bold text-[#0B5336] tabular-nums">
                      {formatMartPrice(qPricing.unitPrice, lang)}
                    </span>
                    {qPricing.comparePrice > qPricing.unitPrice && (
                      <span className="font-mono text-sm text-slate-400 line-through tabular-nums">
                        {formatMartPrice(qPricing.comparePrice, lang)}
                      </span>
                    )}
                    {qPricing.isWholesale && (
                      <span className="rounded bg-brand-50 border border-brand-200 px-2 py-0.5 text-[11px] font-semibold text-[#0B5336]">
                        {tvar.wholesaleActiveBadge}
                      </span>
                    )}
                  </div>

                  {qMinWholesale > 0 && qWholesalePrice > 0 && !qPricing.isWholesale && (
                    <div className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[11px] font-medium text-[#0B5336] font-mono tabular-nums">
                      {tvar.wholesaleUnlockPrefix}{" "}
                      {toLocalizedDigits(qMinWholesale, lang)} {tvar.wholesaleUnlockMiddle}{" "}
                      <strong>{formatMartPrice(qWholesalePrice, lang)}</strong>{" "}
                      {tvar.wholesaleUnitSuffix}
                    </div>
                  )}

                  <div className="text-xs font-mono text-slate-600 tabular-nums">
                    {t.quickView.availabilityLabel}:{" "}
                    <span
                      className={
                        !qVariantOut
                          ? "font-semibold text-[#0B5336]"
                          : "font-semibold text-red-600"
                      }
                    >
                      {qVariantOut
                        ? t.quickView.outOfStock
                        : quickViewProduct.fulfillmentType === "dropship"
                        ? t.quickView.availableReady
                        : `${toLocalizedDigits(activeDisplayStock, lang)} ${t.quickView.unitsInStockSuffix}`}
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

                  {/* Structured Color Swatches */}
                  {qColors.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <div className="text-xs font-semibold text-slate-700">
                        {tvar.selectColorLabel}:{" "}
                        <span className="text-slate-900">
                          {quickViewSelectedColor
                            ? pickLocalized(
                                quickViewSelectedColor.nameEn,
                                quickViewSelectedColor.nameBn,
                                lang
                              )
                            : ""}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {qColors.map((clr) => {
                          const selected = quickViewSelectedColor?.id === clr.id;
                          const label = pickLocalized(clr.nameEn, clr.nameBn, lang);
                          return (
                            <button
                              key={clr.id}
                              type="button"
                              onClick={() => {
                                setQuickViewSelectedColor(clr);
                                if (clr.imageUrl) {
                                  setQuickViewActiveImage(clr.imageUrl);
                                }
                              }}
                              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors min-h-[40px] ${
                                selected
                                  ? "border-[#0B5336] bg-brand-50 text-[#0B5336]"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                              }`}
                            >
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0"
                                style={{ backgroundColor: clr.hex || "#0B5336" }}
                              />
                              <span>{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Structured Size Matrix Chips */}
                  {qSizes.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <div className="text-xs font-semibold text-slate-700">
                        {tvar.selectSizeLabel}:{" "}
                        <span className="font-mono text-slate-900">{quickViewSelectedSize}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {qSizes.map((sz) => {
                          const cell = findMatchingVariant(
                            qMatrix,
                            quickViewSelectedColor?.nameEn,
                            sz
                          );
                          const cellDisabled =
                            cell &&
                            (!cell.active ||
                              (quickViewProduct.fulfillmentType !== "dropship" &&
                                cell.stock <= 0));
                          const selected = quickViewSelectedSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setQuickViewSelectedSize(sz)}
                              className={`rounded-xl border px-3.5 py-2 text-xs font-mono font-semibold transition-colors min-h-[40px] min-w-[44px] ${
                                selected
                                  ? "border-[#0B5336] bg-[#0B5336] text-white"
                                  : cellDisabled
                                  ? "border-slate-200 bg-slate-100 text-slate-400 line-through"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Legacy Single-Line Variants Fallback (when no colors/sizes configured) */}
                  {qColors.length === 0 && qSizes.length === 0 && legacyVars.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        {t.quickView.selectVariant}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {legacyVars.map((variant) => (
                          <button
                            key={variant}
                            type="button"
                            onClick={() => setQuickViewVariant(variant)}
                            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors min-h-[40px] ${
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

                  {qVariantOut && isProductOrderable(quickViewProduct) && (
                    <p className="text-xs font-medium text-red-600">
                      {tvar.selectedVariantOutOfStock}
                    </p>
                  )}
                </div>
              </div>

              {/* Sticky Thumb-Zone Purchase Footer */}
              <div className="border-t border-slate-200 bg-white px-4 sm:px-6 py-3 sm:py-4 space-y-3 shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                      aria-label={t.quickView.decreaseQtyAria}
                      className="inline-flex items-center justify-center min-h-[42px] min-w-[42px] text-slate-600 hover:text-slate-900"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-bold tabular-nums">
                      {toLocalizedDigits(quickViewQty, lang)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickViewQty((q) => Math.min(qMaxQty, q + 1))}
                      aria-label={t.quickView.increaseQtyAria}
                      className="inline-flex items-center justify-center min-h-[42px] min-w-[42px] text-slate-600 hover:text-slate-900"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">{t.cart.subtotal}</div>
                    <div className="font-mono text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                      {formatMartPrice(qPricing.unitPrice * quickViewQty, lang)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    disabled={qVariantOut}
                    onClick={() => {
                      addToCart(quickViewProduct, {
                        variantChoice: quickViewVariant,
                        color: quickViewSelectedColor,
                        size: quickViewSelectedSize,
                        qtyToAdd: quickViewQty,
                        openDrawer: false,
                        overrideImage:
                          quickViewSelectedColor?.imageUrl || quickViewProduct.imageUrl,
                      });
                      setQuickViewProduct(null);
                    }}
                    className="btn-outline py-2.5 text-xs gap-1.5 disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>{t.quickView.addToCart}</span>
                  </button>

                  <button
                    type="button"
                    disabled={qVariantOut}
                    onClick={() => {
                      addToCart(quickViewProduct, {
                        variantChoice: quickViewVariant,
                        color: quickViewSelectedColor,
                        size: quickViewSelectedSize,
                        qtyToAdd: quickViewQty,
                        openDrawer: true,
                        overrideImage:
                          quickViewSelectedColor?.imageUrl || quickViewProduct.imageUrl,
                      });
                      setQuickViewProduct(null);
                    }}
                    className="btn-primary py-2.5 text-xs disabled:opacity-50"
                  >
                    {qVariantOut ? t.quickView.soldOut : t.quickView.buyNow}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => handleCopyProductLink(quickViewProduct, e)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B5336] transition-colors py-1"
                  >
                    {copiedLinkProdId === quickViewProduct.id ? (
                      <Check className="h-3.5 w-3.5 text-[#0B5336]" />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {copiedLinkProdId === quickViewProduct.id
                        ? t.quickView.linkCopiedBtn
                        : t.quickView.copyLinkBtn}
                    </span>
                  </button>

                  <Link
                    href={buildMartProductUrl(quickViewProduct)}
                    onClick={() => setQuickViewProduct(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5336] hover:underline py-1"
                  >
                    <span>{t.quickView.viewFullPageBtn}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SLIDE-OVER 2-STEP CART & MULTI-PRODUCT CHECKOUT DRAWER */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
        >
          <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="min-w-0 pr-2">
                <h2 id="cart-drawer-title" className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
                  {confirmedInvoice
                    ? t.cart.invoiceTitle
                    : `${t.cart.drawerTitle} (${toLocalizedDigits(cartCount, lang)})`}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                  {confirmedInvoice
                    ? `${t.cart.invoiceRefPrefix}: ${confirmedInvoice.orderId}`
                    : t.cart.drawerSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label={t.cart.closeAria}
                className="inline-flex items-center justify-center rounded-xl min-h-[44px] min-w-[44px] text-slate-500 hover:bg-slate-200 hover:text-slate-900 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 2-Step Checkout Progress Bar */}
            {!confirmedInvoice && cart.length > 0 && (
              <div className="grid grid-cols-2 border-b border-slate-200 bg-white px-4 sm:px-6 py-2 gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setCheckoutStep(1)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold text-center transition-colors min-h-[40px] ${
                    checkoutStep === 1
                      ? "bg-[#0B5336] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t.cart.stepBagLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutStep(2)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold text-center transition-colors min-h-[40px] ${
                    checkoutStep === 2
                      ? "bg-[#0B5336] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t.cart.stepCheckoutLabel}
                </button>
              </div>
            )}

            {confirmedInvoice ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:p-5 flex items-start gap-3">
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
                  className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 text-xs"
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
                        <span className="font-semibold">
                          {confirmedInvoice.paymentMethod}
                        </span>
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
                              {it.isWholesale && (
                                <span className="ml-1.5 text-[10px] font-semibold text-[#0B5336]">
                                  [{tvar.wholesaleCardHintPrefix}]
                                </span>
                              )}
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
                    {(Number(confirmedInvoice.discountAmount) || 0) > 0 && (
                      <div className="flex justify-between text-[#0B5336] font-medium">
                        <span>
                          {tcop.discountRowLabel}
                          {confirmedInvoice.discountCode
                            ? ` (${confirmedInvoice.discountCode})`
                            : ""}
                        </span>
                        <span className="font-mono tabular-nums">
                          − {formatMartPrice(Number(confirmedInvoice.discountAmount) || 0, lang)}
                        </span>
                      </div>
                    )}
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
                      setCheckoutStep(1);
                      setCartOpen(false);
                    }}
                    className="btn-primary flex-1 py-2.5 text-xs"
                  >
                    {t.cart.continueShopping}
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-3">
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
            ) : checkoutStep === 1 ? (
              /* STEP 1: BAG REVIEW, DELIVERY ZONE & COUPON */
              <>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const { liveTitle, isLiveAvailable, liveMaxStock, liveProd } =
                        resolveCartLiveState(item);
                      const overStock =
                        isLiveAvailable &&
                        liveProd?.fulfillmentType !== "dropship" &&
                        item.quantity > liveMaxStock;
                      const {
                        effectiveUnitPrice,
                        isWholesaleApplied,
                        minWholesaleQty,
                        wholesaleRate,
                      } = resolveCartItemUnit(item);

                      return (
                        <div
                          key={item.key}
                          className={`flex items-start gap-3 rounded-xl border p-3 ${
                            !isLiveAvailable || overStock
                              ? "border-red-200 bg-red-50/40"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="h-16 w-16 rounded-lg bg-white p-1 border border-slate-200 overflow-hidden shrink-0">
                            <ProductMedia src={item.imageUrl} alt={liveTitle} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {liveTitle}
                            </div>
                            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                              {item.variant && <span>{item.variant} ·</span>}
                              <span className="font-mono tabular-nums">
                                {formatMartPrice(effectiveUnitPrice, lang)}
                              </span>
                              {isWholesaleApplied && (
                                <span className="text-[10px] font-semibold text-[#0B5336]">
                                  [{tvar.wholesaleActiveBadge}]
                                </span>
                              )}
                            </div>
                            {!isWholesaleApplied && minWholesaleQty > 0 && wholesaleRate > 0 && (
                              <div className="text-[10px] text-[#0B5336] font-mono tabular-nums mt-0.5">
                                {tvar.wholesaleUnlockPrefix}{" "}
                                {toLocalizedDigits(minWholesaleQty, lang)}{" "}
                                {tvar.wholesaleUnlockMiddle}{" "}
                                {formatMartPrice(wholesaleRate, lang)}
                              </div>
                            )}
                            {(!isLiveAvailable || overStock) && (
                              <div className="mt-1 text-[11px] font-medium text-red-600">
                                {t.cart.cartItemUnavailable}
                              </div>
                            )}

                            {liveProd && (() => {
                              const cartColors = parseProductColors(liveProd.colorsJson);
                              const cartSizes = parseProductSizes(liveProd.sizesList);
                              const cartMatrix = parseVariationMatrix(liveProd.variationMatrixJson);
                              const cartLegacyVars = parseProductVariants(
                                pickLocalized(liveProd.variantsEn, liveProd.variantsBn, lang)
                              );
                              const hasVariantControls =
                                cartColors.length > 0 ||
                                cartSizes.length > 0 ||
                                (cartColors.length === 0 &&
                                  cartSizes.length === 0 &&
                                  cartLegacyVars.length > 1);
                              if (!hasVariantControls) return null;

                              return (
                                <div className="mt-2 pt-2 border-t border-slate-200/70 space-y-1.5">
                                  {cartColors.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[11px] font-semibold text-slate-500">
                                        {t.cart.changeColorLabel}:
                                      </span>
                                      {cartColors.map((clr) => {
                                        const isSelectedColor =
                                          clr.nameEn.trim().toLowerCase() ===
                                          (item.colorName || "").trim().toLowerCase();
                                        const clrLabel = pickLocalized(clr.nameEn, clr.nameBn, lang);
                                        return (
                                          <button
                                            key={clr.id}
                                            type="button"
                                            title={clrLabel}
                                            aria-label={clrLabel}
                                            onClick={() =>
                                              updateCartItemVariant(item.key, { color: clr })
                                            }
                                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium transition-colors min-h-[28px] ${
                                              isSelectedColor
                                                ? "border-[#0B5336] bg-white text-[#0B5336] font-semibold"
                                                : "border-slate-200 bg-white/70 text-slate-600 hover:border-slate-400"
                                            }`}
                                          >
                                            <span
                                              className="h-2.5 w-2.5 rounded-full border border-slate-300 shrink-0"
                                              style={{ backgroundColor: clr.hex || "#0B5336" }}
                                            />
                                            <span>{clrLabel}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {cartSizes.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                                        {t.cart.changeSizeLabel}:
                                      </label>
                                      <select
                                        value={item.sizeName || cartSizes[0] || ""}
                                        onChange={(e) =>
                                          updateCartItemVariant(item.key, { size: e.target.value })
                                        }
                                        aria-label={t.cart.changeSizeLabel}
                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 outline-none focus:border-[#0B5336] min-h-[34px]"
                                      >
                                        {cartSizes.map((sz) => {
                                          const cell = findMatchingVariant(
                                            cartMatrix,
                                            item.colorName || cartColors[0]?.nameEn,
                                            sz
                                          );
                                          const unavailable = Boolean(
                                            cell &&
                                              (!cell.active ||
                                                (liveProd.fulfillmentType !== "dropship" &&
                                                  cell.stock <= 0))
                                          );
                                          return (
                                            <option key={sz} value={sz} disabled={unavailable}>
                                              {sz}
                                              {unavailable ? ` (${t.catalog.outOfStock})` : ""}
                                            </option>
                                          );
                                        })}
                                      </select>
                                    </div>
                                  )}

                                  {cartColors.length === 0 &&
                                    cartSizes.length === 0 &&
                                    cartLegacyVars.length > 1 && (
                                      <div className="flex items-center gap-2">
                                        <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                                          {t.cart.changeVariantLabel}:
                                        </label>
                                        <select
                                          value={item.variant || cartLegacyVars[0] || ""}
                                          onChange={(e) =>
                                            updateCartItemVariant(item.key, {
                                              legacyVariant: e.target.value,
                                            })
                                          }
                                          aria-label={t.cart.changeVariantLabel}
                                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#0B5336] min-h-[34px] max-w-full"
                                        >
                                          {cartLegacyVars.map((v) => (
                                            <option key={v} value={v}>
                                              {v}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    )}
                                </div>
                              );
                            })()}

                            <div className="flex items-center justify-between mt-2.5 gap-2">
                              <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.key, -1)}
                                  className="inline-flex items-center justify-center min-h-[38px] min-w-[38px] text-slate-600 hover:text-slate-900"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center font-mono text-xs font-bold tabular-nums">
                                  {toLocalizedDigits(item.quantity, lang)}
                                </span>
                                <button
                                  type="button"
                                  disabled={!isLiveAvailable || item.quantity >= liveMaxStock}
                                  onClick={() => updateCartQuantity(item.key, 1)}
                                  className="inline-flex items-center justify-center min-h-[38px] min-w-[38px] text-slate-600 hover:text-slate-900 disabled:opacity-40"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                                  {formatMartPrice(effectiveUnitPrice * item.quantity, lang)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeCartItem(item.key)}
                                  aria-label={`${t.cart.removeItemAria} ${liveTitle}`}
                                  className="inline-flex items-center justify-center min-h-[38px] min-w-[38px] rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
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

                  {/* Quick Delivery Zone Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      {t.cart.deliveryZone}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryArea("Inside Dhaka")}
                        className={`rounded-xl border p-3 text-left transition-colors min-h-[56px] ${
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
                        className={`rounded-xl border p-3 text-left transition-colors min-h-[56px] ${
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

                  {/* Promo / Discount Coupon Box */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Ticket className="h-3.5 w-3.5 text-[#0B5336]" />
                      <span>{tcop.checkoutLabel}</span>
                    </label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs">
                        <span className="font-mono font-semibold text-[#0B5336]">
                          {tcop.appliedPrefix}: {appliedCoupon.code} (−
                          {formatMartPrice(effectiveDiscount, lang)})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponInput("");
                            setCouponError(null);
                          }}
                          className="text-red-600 hover:underline font-semibold whitespace-nowrap min-h-[32px]"
                        >
                          {tcop.removeBtn}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          placeholder={tcop.checkoutPlaceholder}
                          className="input min-h-[42px] py-1.5 text-base sm:text-xs font-mono uppercase bg-white flex-1"
                        />
                        <button
                          type="button"
                          disabled={couponLoading}
                          onClick={handleApplyCoupon}
                          className="btn-outline px-4 py-1.5 text-xs whitespace-nowrap min-h-[42px]"
                        >
                          {couponLoading ? tcop.applyingBtn : tcop.applyBtn}
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-[11px] font-medium text-red-600">{couponError}</p>
                    )}
                  </div>

                  {/* Totals Summary */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{t.cart.subtotal}</span>
                      <span className="font-mono tabular-nums">
                        {formatMartPrice(cartSubtotal, lang)}
                      </span>
                    </div>
                    {effectiveDiscount > 0 && appliedCoupon && (
                      <div className="flex justify-between text-[#0B5336] font-medium">
                        <span>
                          {tcop.discountRowLabel} ({appliedCoupon.code})
                        </span>
                        <span className="font-mono tabular-nums">
                          − {formatMartPrice(effectiveDiscount, lang)}
                        </span>
                      </div>
                    )}
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
                </div>

                {/* Sticky Step 1 Bottom Action Bar */}
                <div className="border-t border-slate-200 bg-white px-4 sm:px-6 py-3.5 shrink-0 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-slate-500">{t.cart.grandTotal}</div>
                    <div className="font-mono text-base sm:text-lg font-bold text-[#0B5336] tabular-nums">
                      {formatMartPrice(grandTotal, lang)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutError(null);
                      setCheckoutStep(2);
                      trackMartInitiateCheckout({
                        items: cart.map((item) => {
                          const { effectiveUnitPrice } = resolveCartItemUnit(item);
                          return {
                            sku: item.variantSku || item.sku,
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: effectiveUnitPrice,
                          };
                        }),
                        value: grandTotal,
                      });
                    }}
                    className="btn-primary flex-1 sm:flex-initial px-6 py-3 text-xs sm:text-sm gap-2 min-h-[46px]"
                  >
                    <span>{t.cart.continueCheckoutBtn}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              /* STEP 2: AUTO-SAVED CUSTOMER DETAILS & QR/COD PAYMENT */
              <form
                onSubmit={handleCheckoutSubmit}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      {t.cart.customerDetailsTitle}
                    </h3>
                    {hasSavedPref && (customerName || phone || address) && (
                      <button
                        type="button"
                        onClick={clearSavedCustomerPref}
                        className="text-[11px] font-semibold text-slate-500 hover:text-red-600 underline whitespace-nowrap"
                      >
                        {t.cart.clearSavedAddressBtn}
                      </button>
                    )}
                  </div>

                  {hasSavedPref && (customerName || phone || address) && (
                    <div className="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2 text-[11px] font-medium text-[#0B5336] flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.cart.savedAddressHint}</span>
                    </div>
                  )}

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
                        className="input text-base sm:text-sm"
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
                        className="input font-mono text-base sm:text-sm"
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
                      className="input min-h-[72px] py-2 text-base sm:text-sm"
                    />
                  </div>

                  {/* Payment Method Selector + Official bKash Merchant QR & Bangla QR */}
                  <div className="space-y-2.5 pt-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {t.cart.paymentMethodLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("Cash on Delivery")}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors min-h-[44px] ${
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
                        className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors min-h-[44px] ${
                          paymentMethod === "Mobile Banking"
                            ? "border-[#0B5336] bg-[#0B5336] text-white"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {tqr.checkoutOnlineOption}
                      </button>
                    </div>

                    {paymentMethod === "Mobile Banking" && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
                        <div>
                          <div className="text-[11px] font-semibold text-slate-600 mb-1.5">
                            {tqr.selectQrTypeLabel}
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setOnlineChannel("bkash_qr")}
                              className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition-colors min-h-[40px] ${
                                onlineChannel === "bkash_qr"
                                  ? "border-[#0B5336] bg-[#0B5336] text-white"
                                  : "border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              {tqr.bkashQrTab}
                            </button>
                            <button
                              type="button"
                              onClick={() => setOnlineChannel("bangla_qr")}
                              className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition-colors min-h-[40px] ${
                                onlineChannel === "bangla_qr"
                                  ? "border-[#0B5336] bg-[#0B5336] text-white"
                                  : "border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              {tqr.banglaQrTab}
                            </button>
                            <button
                              type="button"
                              onClick={() => setOnlineChannel("manual")}
                              className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition-colors min-h-[40px] ${
                                onlineChannel === "manual"
                                  ? "border-[#0B5336] bg-[#0B5336] text-white"
                                  : "border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              {tqr.manualMobileTab}
                            </button>
                          </div>
                        </div>

                        {(onlineChannel === "bkash_qr" || onlineChannel === "bangla_qr") && (() => {
                          const isBkashQr = onlineChannel === "bkash_qr";
                          const qrUrl = isBkashQr ? settings.bkashQrUrl : settings.banglaQrUrl;
                          const acctNumber = isBkashQr
                            ? settings.bkashMerchantNumber || settings.mobileBankingNumber
                            : settings.mobileBankingNumber;
                          const acctInfo = !isBkashQr ? settings.banglaQrAccountInfo : "";

                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <QrCode className="h-3.5 w-3.5 text-[#0B5336]" />
                                  <span>{tqr.scanPayTitle}</span>
                                </span>
                                <span className="font-mono font-bold text-[#0B5336] tabular-nums">
                                  {tqr.amountToPayLabel}: {formatMartPrice(grandTotal, lang)}
                                </span>
                              </div>

                              {qrUrl ? (
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                  <div className="h-40 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={normalizeMartImageUrl(qrUrl)}
                                      alt={isBkashQr ? tqr.bkashQrTab : tqr.banglaQrTab}
                                      referrerPolicy="no-referrer"
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="flex-1 space-y-2 text-xs w-full">
                                    {acctInfo && (
                                      <div className="font-semibold text-slate-800">
                                        {acctInfo}
                                      </div>
                                    )}
                                    {acctNumber && (
                                      <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                                        <div>
                                          <div className="text-[10px] text-slate-500">
                                            {tqr.merchantNoLabel}
                                          </div>
                                          <div className="font-mono font-bold text-slate-900 tabular-nums">
                                            {acctNumber}
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleCopyPaymentNumber(acctNumber)}
                                          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] whitespace-nowrap"
                                        >
                                          <Copy className="h-3 w-3" />
                                          <span>
                                            {copiedAccountNo ? tqr.copiedNoBtn : tqr.copyNoBtn}
                                          </span>
                                        </button>
                                      </div>
                                    )}
                                    <a
                                      href={`/api/mart/qr-download?type=${
                                        isBkashQr ? "bkash" : "bangla"
                                      }`}
                                      download
                                      className="btn-outline w-full py-2 text-xs gap-1.5"
                                    >
                                      <Download className="h-3.5 w-3.5 text-[#0B5336]" />
                                      <span>{tqr.downloadQrBtn}</span>
                                    </a>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                      {tqr.qrHelpText}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-xs text-slate-500">
                                    {tqr.noQrConfiguredHint}
                                  </p>
                                  {acctNumber && (
                                    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                                      <span className="font-mono font-bold text-slate-900">
                                        {acctNumber}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyPaymentNumber(acctNumber)}
                                        className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
                                      >
                                        <Copy className="h-3 w-3" />
                                        <span>
                                          {copiedAccountNo ? tqr.copiedNoBtn : tqr.copyNoBtn}
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {onlineChannel === "manual" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                {t.cart.providerLabel}
                              </label>
                              <select
                                value={manualChannel}
                                onChange={(e) =>
                                  setManualChannel(e.target.value as "Nagad" | "Rocket")
                                }
                                className="input min-h-[42px] py-1.5 text-base sm:text-xs"
                              >
                                <option value="Nagad">Nagad</option>
                                <option value="Rocket">Rocket</option>
                              </select>
                            </div>
                            {settings.mobileBankingNumber && (
                              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs min-h-[42px]">
                                <span className="font-mono font-bold text-slate-900">
                                  {settings.mobileBankingNumber}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyPaymentNumber(settings.mobileBankingNumber)
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B5336]"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>
                                    {copiedAccountNo ? tqr.copiedNoBtn : tqr.copyNoBtn}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            {t.cart.trxIdLabel}
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder={t.cart.trxIdPlaceholder}
                            className="input min-h-[42px] py-1.5 text-base sm:text-xs font-mono bg-white"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">{tqr.trxRequiredHint}</p>
                        </div>
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
                      className="input text-base sm:text-sm"
                    />
                  </div>
                </div>

                {/* Sticky Step 2 Confirm Footer Bar */}
                <div className="border-t border-slate-200 bg-white px-4 sm:px-6 py-3.5 shrink-0 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="btn-outline px-3.5 py-3 text-xs gap-1.5 min-h-[46px]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{t.cart.backToBagBtn}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="btn-primary flex-1 py-3 px-4 text-xs sm:text-sm min-h-[46px]"
                  >
                    {submittingOrder
                      ? t.cart.submittingOrder
                      : `${t.cart.confirmOrder} · ${formatMartPrice(grandTotal, lang)}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMER ORDER TRACKING MODAL */}
      {trackOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="track-order-title"
        >
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-slate-50 shrink-0">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 shrink-0">
              <div className="min-w-0 pr-2">
                <h2 id="track-order-title" className="font-display text-base sm:text-lg font-bold text-slate-900">
                  {t.track.modalTitle}
                </h2>
                <p className="text-xs text-slate-500">{t.track.modalSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setTrackOpen(false)}
                aria-label={t.track.closeAria}
                className="rounded-lg p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
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
                      className="input text-base sm:text-sm font-mono uppercase"
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
                      className="input text-base sm:text-sm font-mono"
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
                  className="btn-primary w-full py-2.5 text-xs gap-2 min-h-[44px]"
                >
                  <PackageSearch className="h-4 w-4" />
                  <span>{trackingLoading ? t.track.searching : t.track.checkStatus}</span>
                </button>
              </form>

              {trackedOrder && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {trackedOrder.id}
                      </div>
                      <div className="text-slate-500">
                        {formatMartDate(trackedOrder.createdAt, lang)}
                      </div>
                    </div>
                    <div className="font-semibold text-[#0B5336] shrink-0">
                      {t.orderStatuses[trackedOrder.status] || trackedOrder.status}
                    </div>
                  </div>

                  {trackedOrder.status === "Cancelled" ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-medium">
                      {t.track.cancelledAlert}
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-1 sm:gap-2 pt-1">
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
                              className={`text-[9px] sm:text-[10px] leading-tight font-semibold ${
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
                    {(Number(trackedOrder.discountAmount) || 0) > 0 && (
                      <div className="flex justify-between text-[#0B5336] font-medium pt-1">
                        <span>
                          {tcop.discountRowLabel}
                          {trackedOrder.discountCode ? ` (${trackedOrder.discountCode})` : ""}
                        </span>
                        <span className="font-mono tabular-nums">
                          − {formatMartPrice(Number(trackedOrder.discountAmount) || 0, lang)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>
                        {t.track.totalPayableLabel} ({trackedOrder.paymentMethod}
                        {trackedOrder.paymentProvider ? ` · ${trackedOrder.paymentProvider}` : ""})
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
