import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { MartStorefront } from "@/components/mart/MartStorefront";
import { SITE_URL } from "@/lib/constants";
import {
  buildClientPublicBundleFromServerPayload,
  fetchMartPublicFromScript,
} from "@/lib/martServer";
import {
  buildMartProductSlug,
  buildMartProductUrl,
  DEFAULT_MART_SETTINGS,
  findMartProductBySlugOrSku,
  MartProduct,
  MartPublicBundle,
  normalizeMartImageUrl,
  parseGalleryUrls,
  parseProductColors,
  parseProductSizes,
  ResolvedMartContactInfo,
  resolveMartContactInfo,
} from "@/lib/martApi";
import { getEffectiveProductStock, isProductOrderable } from "@/lib/martOps";

export const revalidate = 120;

interface ProductPageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

async function resolveServerProductBundle(rawSlug: string): Promise<{
  product: MartProduct | null;
  initialBundle?: MartPublicBundle;
  insideDhaka: number;
  outsideDhaka: number;
  contact: ResolvedMartContactInfo;
}> {
  try {
    const res = await fetchMartPublicFromScript();
    if (!res?.isLiveBackend || !res.data) {
      return {
        product: null,
        insideDhaka: Number(DEFAULT_MART_SETTINGS.insideDhakaCharge) || 60,
        outsideDhaka: Number(DEFAULT_MART_SETTINGS.outsideDhakaCharge) || 120,
        contact: resolveMartContactInfo(DEFAULT_MART_SETTINGS),
      };
    }

    const initialBundle = buildClientPublicBundleFromServerPayload(res.data, true);
    const contact = resolveMartContactInfo(initialBundle.settings);
    const insideDhaka =
      Number(initialBundle.settings.insideDhakaCharge) ||
      Number(DEFAULT_MART_SETTINGS.insideDhakaCharge) ||
      60;
    const outsideDhaka =
      Number(initialBundle.settings.outsideDhakaCharge) ||
      Number(DEFAULT_MART_SETTINGS.outsideDhakaCharge) ||
      120;
    const activeProducts = initialBundle.products.filter((p) => p.active);

    return {
      product: findMartProductBySlugOrSku(activeProducts, rawSlug) || null,
      initialBundle,
      insideDhaka,
      outsideDhaka,
      contact,
    };
  } catch {
    return {
      product: null,
      insideDhaka: Number(DEFAULT_MART_SETTINGS.insideDhakaCharge) || 60,
      outsideDhaka: Number(DEFAULT_MART_SETTINGS.outsideDhakaCharge) || 120,
      contact: resolveMartContactInfo(DEFAULT_MART_SETTINGS),
    };
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug || "");
  const { product } = await resolveServerProductBundle(slug);

  if (!product) {
    return {
      title: "Product Details | Xeetrix Mart (জিট্রিক্স মার্ট)",
      description:
        "Shop verified products with transparent delivery charges, Cash on Delivery, and instant order tracking at Xeetrix Mart.",
    };
  }

  const displayTitle =
    product.nameBn && product.nameEn
      ? `${product.nameEn} (${product.nameBn})`
      : product.nameEn || product.nameBn || product.sku || "Xeetrix Mart Product";
  const priceText = `৳${Number(product.price || 0).toLocaleString("en-BD")}`;
  const rawDescription =
    [product.descriptionEn, product.descriptionBn].filter(Boolean).join(" — ") ||
    `Order ${displayTitle} online from Xeetrix Mart with Cash on Delivery and fast nationwide shipping across Bangladesh.`;
  const cleanDescription = `${priceText} · ${rawDescription}`.slice(0, 220);
  const canonicalPath = buildMartProductUrl(product);
  const primaryImage = normalizeMartImageUrl(product.imageUrl);

  const keywords = [
    product.nameEn,
    product.nameBn,
    product.sku,
    ...(product.categories ? product.categories.split(",") : []),
    "Xeetrix Mart",
    "জিট্রিক্স মার্ট",
    "Price in Bangladesh",
    "বাংলাদেশে দাম",
    "Cash on Delivery",
  ]
    .map((k) => String(k || "").trim())
    .filter(Boolean);

  return {
    title: `${displayTitle} — ${priceText} | Xeetrix Mart`,
    description: cleanDescription,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${displayTitle} — ${priceText} | Xeetrix Mart`,
      description: cleanDescription,
      url: `${SITE_URL}${canonicalPath}`,
      siteName: "Xeetrix Mart",
      type: "website",
      ...(primaryImage
        ? {
            images: [
              {
                url: primaryImage,
                alt: displayTitle,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayTitle} — ${priceText} | Xeetrix Mart`,
      description: cleanDescription,
      ...(primaryImage ? { images: [primaryImage] } : {}),
    },
  };
}

export default async function MartProductDetailPage({
  params,
}: ProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug || "");
  const { product, initialBundle, insideDhaka, outsideDhaka, contact } =
    await resolveServerProductBundle(slug);

  if (product) {
    const canonicalSlug = buildMartProductSlug(product);
    if (canonicalSlug && slug !== canonicalSlug) {
      permanentRedirect(buildMartProductUrl(product));
    }
  }

  const gallery = product
    ? parseGalleryUrls(product.galleryUrls, product.imageUrl).map((u) =>
        normalizeMartImageUrl(u)
      )
    : [];
  const inStock = product ? isProductOrderable(product) : false;
  const effectiveStock = product ? getEffectiveProductStock(product) : 0;
  const canonicalUrl = product
    ? `${SITE_URL}${buildMartProductUrl(product)}`
    : `${SITE_URL}/mart/p/${slug}`;
  const colors = product ? parseProductColors(product.colorsJson) : [];
  const sizes = product ? parseProductSizes(product.sizesList) : [];

  const productGraphJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Xeetrix Holding",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Xeetrix Mart",
                item: `${SITE_URL}/mart`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name:
                  product.nameEn && product.nameBn
                    ? `${product.nameEn} (${product.nameBn})`
                    : product.nameEn || product.nameBn || product.sku,
                item: canonicalUrl,
              },
            ],
          },
          {
            "@type": "Product",
            "@id": `${canonicalUrl}#product`,
            name:
              product.nameEn && product.nameBn
                ? `${product.nameEn} (${product.nameBn})`
                : product.nameEn || product.nameBn || product.sku,
            alternateName: [product.nameEn, product.nameBn].filter(Boolean),
            description:
              [product.descriptionEn, product.descriptionBn]
                .filter(Boolean)
                .join("\n\n") ||
              `${product.nameEn || product.nameBn} available at Xeetrix Mart.`,
            sku: product.sku || product.id,
            mpn: product.sku || product.id,
            category: product.categories || "General",
            image: gallery.length > 0 ? gallery : undefined,
            ...(colors.length > 0
              ? {
                  color: colors
                    .map((c) => (c.nameBn ? `${c.nameEn} (${c.nameBn})` : c.nameEn))
                    .join(", "),
                }
              : {}),
            ...(sizes.length > 0 ? { size: sizes.join(", ") } : {}),
            brand: {
              "@type": "Brand",
              name: "Xeetrix Mart",
            },
            offers: {
              "@type": "Offer",
              url: canonicalUrl,
              priceCurrency: "BDT",
              price: Number(product.price || 0),
              itemCondition: "https://schema.org/NewCondition",
              availability:
                inStock &&
                (product.fulfillmentType === "dropship" || effectiveStock > 0)
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              seller: {
                "@type": "OnlineStore",
                name: "Xeetrix Mart (জিট্রিক্স মার্ট)",
                telephone: contact.hotlinePhone,
                email: contact.supportEmail,
                url: `${SITE_URL}/mart`,
              },
              shippingDetails: [
                {
                  "@type": "OfferShippingDetails",
                  shippingRate: {
                    "@type": "MonetaryAmount",
                    value: insideDhaka,
                    currency: "BDT",
                  },
                  shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "BD",
                    addressRegion: "Dhaka",
                  },
                },
                {
                  "@type": "OfferShippingDetails",
                  shippingRate: {
                    "@type": "MonetaryAmount",
                    value: outsideDhaka,
                    currency: "BDT",
                  },
                  shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "BD",
                  },
                },
              ],
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "BD",
                returnPolicyCategory:
                  "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 7,
                returnMethod: "https://schema.org/ReturnByMail",
              },
            },
          },
        ],
      }
    : null;

  return (
    <>
      {productGraphJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productGraphJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}

      {/* Server-Rendered Product Semantic Summary for Non-JS Search & AI Bots */}
      {product && (
        <article className="sr-only">
          <h1>
            {product.nameEn} {product.nameBn ? `(${product.nameBn})` : ""}
          </h1>
          <p>SKU: {product.sku || product.id}</p>
          <p>Price: ৳{Number(product.price || 0)} BDT</p>
          {product.descriptionEn && <p>{product.descriptionEn}</p>}
          {product.descriptionBn && <p>{product.descriptionBn}</p>}
          <p>
            Delivery Charge: Inside Dhaka ৳{insideDhaka} BDT, Outside Dhaka ৳
            {outsideDhaka} BDT. Cash on Delivery available across Bangladesh.
          </p>
          <Link href="/mart">Back to Xeetrix Mart Catalog</Link>
        </article>
      )}

      <MartStorefront focusedProductSlug={slug} initialBundle={initialBundle} />
    </>
  );
}
