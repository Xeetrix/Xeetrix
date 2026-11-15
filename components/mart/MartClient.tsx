"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  ShoppingBag,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Package,
} from "lucide-react";
import {
  createSheetRecord,
  FALLBACK_MART_PRODUCTS,
  fetchPublicEcosystemData,
  MartProduct,
  normalizeDriveImageUrl,
} from "@/lib/googleApi";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  MART_EMAIL,
} from "@/lib/constants";

function formatBDT(amount: number) {
  return `৳${new Intl.NumberFormat("en-US").format(Math.round(amount))}`;
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const resolved = normalizeDriveImageUrl(src);

  if (!resolved || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400 p-6 text-center">
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
      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
    />
  );
}

export function MartClient() {
  const [products, setProducts] = useState<MartProduct[]>(FALLBACK_MART_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Quick Order Modal State
  const [activeProduct, setActiveProduct] = useState<MartProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    productName: string;
    quantity: number;
    totalAmount: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetchPublicEcosystemData()
      .then((res) => {
        if (active && res.martProducts) {
          setProducts(res.martProducts);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["All", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const catOk = selectedCategory === "All" || p.category === selectedCategory;
      const q = searchTerm.trim().toLowerCase();
      const searchOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [products, selectedCategory, searchTerm]);

  function openOrderModal(product: MartProduct) {
    setActiveProduct(product);
    setQuantity(1);
    setOrderError(null);
    setConfirmedOrder(null);
  }

  function closeOrderModal() {
    setActiveProduct(null);
    setOrderError(null);
    setConfirmedOrder(null);
  }

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProduct) return;
    setOrderError(null);

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setOrderError("Please provide your name, phone number, and delivery address.");
      return;
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const totalAmount = activeProduct.price * qty;

    setSubmitting(true);
    try {
      const res = await createSheetRecord("Mart_Orders", {
        productId: activeProduct.id,
        productName: activeProduct.name,
        quantity: qty,
        unitPrice: activeProduct.price,
        totalAmount,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
        status: "Pending",
      });
      setConfirmedOrder({
        id: res.id,
        productName: activeProduct.name,
        quantity: qty,
        totalAmount,
      });
      setCustomerName("");
      setPhone("");
      setAddress("");
      setNotes("");
    } catch (err) {
      setOrderError(
        err instanceof Error
          ? err.message
          : "Order submission failed. Please call +880 965 803 6631."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">
      {/* Top Subsidiary Breadcrumb Bar */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-medium text-emerald-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Xeetrix Holding Group</span>
          </Link>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href={`mailto:${MART_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Mail className="h-3.5 w-3.5 text-gold-400" />
              <span>Dedicated Desk: {MART_EMAIL}</span>
            </a>
            <a
              href={CONTACT_PHONE_TEL}
              className="inline-flex items-center gap-1.5 font-mono font-semibold text-white hover:text-gold-300 tabular-nums"
            >
              <Phone className="h-3.5 w-3.5 text-gold-400" />
              <span>{CONTACT_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Storefront Hero Banner */}
      <section className="bg-[#0B5336] text-white py-10 lg:py-14 border-b border-brand-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold-300">
              Xeetrix Mart · Daily Retail &amp; Consumer Commerce
            </div>
            <h1
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white"
              style={{ textWrap: "balance" }}
            >
              Verified Everyday Essentials &amp; Smart Electronics
            </h1>
            <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed">
              Direct-to-doorstep fulfillment across Bangladesh with transparent BDT pricing and
              instant Cash-on-Delivery order confirmation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-emerald-100 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/15">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold-300 shrink-0" />
              <span>Cash on Delivery Across Bangladesh</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold-300 shrink-0" />
              <span>Verified Stock &amp; Warranty</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Controls & Product Grid */}
      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Category Tabs & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl">
              {categories.map((cat) => (
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

            <div className="relative w-full md:w-72">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="input pl-10"
              />
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="h-96 rounded-2xl border border-slate-200 bg-white animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
              <h2 className="font-display text-lg font-semibold text-slate-900">
                No Matching Products Found
              </h2>
              <p className="text-sm text-slate-500">
                Try clearing your category filter or search term to view all available items.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchTerm("");
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

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                        <ProductImage src={product.imageUrl} alt={product.name} />
                      </div>

                      <div className="p-6 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="uppercase tracking-wider font-semibold text-[#0B5336]">
                            {product.category}
                          </span>
                          <span className="font-mono tabular-nums">
                            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
                          </span>
                        </div>

                        <h2 className="font-display text-lg font-semibold text-slate-900 leading-snug">
                          {product.name}
                        </h2>

                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                            {formatBDT(product.price)}
                          </span>
                          {hasDiscount && (
                            <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                              {formatBDT(product.comparePrice)}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">Cash on Delivery</div>
                      </div>

                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => openOrderModal(product)}
                        className="btn-primary px-4 py-2.5 text-xs disabled:opacity-50"
                      >
                        {outOfStock ? "Sold Out" : "Order Now (COD)"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Quick Order (Cash on Delivery) Modal */}
      {activeProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cod-modal-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h2 id="cod-modal-title" className="font-display text-lg font-bold text-slate-900">
                  Order Now (Cash on Delivery)
                </h2>
                <p className="text-xs text-slate-500 truncate max-w-sm">
                  {activeProduct.name}
                </p>
              </div>
              <button
                type="button"
                onClick={closeOrderModal}
                aria-label="Close order modal"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {confirmedOrder ? (
                <div className="py-4 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-[#0B5336]">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Order Confirmed
                  </h3>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order Reference</span>
                      <span className="font-mono font-bold text-[#0B5336]">
                        {confirmedOrder.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Item</span>
                      <span className="font-medium text-slate-900">
                        {confirmedOrder.productName} × {confirmedOrder.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5">
                      <span className="text-slate-600 font-medium">Cash Payable on Delivery</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatBDT(confirmedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Our dispatch desk ({MART_EMAIL}) will confirm delivery shortly.
                  </p>
                  <button
                    type="button"
                    onClick={closeOrderModal}
                    className="btn-primary w-full py-3 text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  {orderError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <div>
                      <div className="font-semibold text-slate-900">{activeProduct.name}</div>
                      <div className="text-xs text-slate-500 font-mono tabular-nums">
                        Unit Price: {formatBDT(activeProduct.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-600">Qty</label>
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, activeProduct.stock)}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-center font-mono text-sm font-semibold tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Full name"
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+880 1XXX-XXXXXX"
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Delivery Address *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House, Road, Area, City"
                      className="input min-h-[76px] py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Delivery Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Preferred delivery window or landmark"
                      className="input"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <div className="text-xs text-slate-500">Total COD Payable</div>
                      <div className="font-mono text-xl font-bold text-[#0B5336] tabular-nums">
                        {formatBDT(activeProduct.price * quantity)}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary px-6 py-3 text-sm disabled:opacity-60"
                    >
                      {submitting ? "Placing Order..." : "Confirm COD Order"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
