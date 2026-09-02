import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Boxes, Layers, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { formatCurrency, SITE_NAME, SITE_URL } from "@/lib/constants";

// Admin-created/edited products must show up immediately, not only
// after the next build (or the next hour, under ISR) — always render
// this page fresh from the database.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.seoTitle || `${product.title} — Wholesale MOQ ${product.moq}`;
  const description =
    product.seoDescription ||
    `${product.description.slice(0, 150)}... Wholesale price ${formatCurrency(
      product.wholesalePrice
    )}/${product.unit}, MOQ ${product.moq}.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.id,
    category: product.category.name,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.wholesalePrice.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        minValue: product.moq,
        unitText: product.unit,
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category.name,
        item: `${SITE_URL}/categories/${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.title,
        item: `${SITE_URL}/products/${product.slug}`,
      },
    ],
  };

  const discount = Math.max(
    0,
    Math.round(
      ((product.regularPrice - product.wholesalePrice) / product.regularPrice) * 100
    )
  );

  const whatsappMessage = `Hi Xeetrix, I'm interested in "${product.title}" (MOQ ${product.moq} ${product.unit}). Could you share availability and shipping terms?`;

  return (
    <Container className="py-10 sm:py-14">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.category.name, href: `/categories/${product.category.slug}` },
          { label: product.title },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <FadeIn>
          <ProductGallery images={product.images} title={product.title} />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-5">
            <div>
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-xs font-semibold uppercase tracking-wide text-brand-600 hover:text-brand-700"
              >
                {product.category.name}
              </Link>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink-950 sm:text-3xl">
                {product.title}
              </h1>
            </div>

            <div className="flex items-end gap-3">
              <span className="font-display text-3xl font-bold text-ink-950">
                {formatCurrency(product.wholesalePrice)}
              </span>
              <span className="text-sm text-ink-400">/ {product.unit}</span>
              {discount > 0 && (
                <>
                  <span className="text-base text-ink-400 line-through">
                    {formatCurrency(product.regularPrice)}
                  </span>
                  <span className="rounded-full bg-accent-100 px-2.5 py-1 text-xs font-bold text-accent-700">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                  <Boxes className="h-3.5 w-3.5" /> MOQ
                </span>
                <span className="font-display font-semibold text-ink-900">
                  {product.moq.toLocaleString()} {product.unit}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                  <Layers className="h-3.5 w-3.5" /> Stock
                </span>
                <span className="font-display font-semibold text-ink-900">
                  {product.stock.toLocaleString()} {product.unit}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
                <span className="font-display font-semibold text-ink-900">Supplier</span>
              </div>
            </div>

            <p className="leading-relaxed text-ink-600">{product.description}</p>

            <ul className="flex flex-col gap-2 text-sm text-ink-600">
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 flex-shrink-0 text-brand-600" />
                Factory-direct wholesale pricing
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 flex-shrink-0 text-brand-600" />
                Custom private-label &amp; packaging available
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 flex-shrink-0 text-brand-600" />
                Export documentation &amp; shipping support
              </li>
            </ul>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton message={whatsappMessage} className="flex-1" />
              <Link
                href="/contact"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-200 px-6 py-3.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
              >
                Request Quote
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-ink-950">
            Related Products
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
