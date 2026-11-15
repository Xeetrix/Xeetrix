import type { Metadata } from "next";
import { MartStorefront } from "@/components/mart/MartStorefront";
import { fetchMartPublicFromScript } from "@/lib/martServer";
import {
  buildMartProductUrl,
  findMartProductBySlugOrSku,
  MART_CONTACT_PHONE,
  MartProduct,
  normalizeMartImageUrl,
  normalizeProductRecord,
  parseGalleryUrls,
} from "@/lib/martApi";
import { getEffectiveProductStock, isProductOrderable } from "@/lib/martOps";

interface ProductPageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

async function resolveServerProduct(rawSlug: string): Promise<MartProduct | null> {
  try {
    const res = await fetchMartPublicFromScript();
    const rawList = res?.data?.products;
    const products: MartProduct[] = Array.isArray(rawList)
      ? rawList
          .map((item) => normalizeProductRecord(item as Record<string, unknown>))
          .filter((p) => p.active)
      : [];
    return findMartProductBySlugOrSku(products, rawSlug) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug || "");
  const product = await resolveServerProduct(slug);

  if (!product) {
    return {
      title: "Product Details | Xeetrix Mart",
      description:
        "Shop verified products with transparent delivery charges, Cash on Delivery, and instant order tracking at Xeetrix Mart.",
    };
  }

  const displayTitle = product.nameBn && product.nameEn
    ? `${product.nameEn} (${product.nameBn})`
    : product.nameEn || product.nameBn || product.sku || "Xeetrix Mart Product";
  const priceText = `৳${Number(product.price || 0).toLocaleString("en-BD")}`;
  const rawDescription =
    product.descriptionEn ||
    product.descriptionBn ||
    `Order ${displayTitle} online from Xeetrix Mart with Cash on Delivery and fast nationwide shipping.`;
  const cleanDescription = `${priceText} · ${rawDescription}`.slice(0, 200);
  const canonicalPath = buildMartProductUrl(product);
  const primaryImage = normalizeMartImageUrl(product.imageUrl);

  return {
    title: `${displayTitle} — ${priceText} | Xeetrix Mart`,
    description: cleanDescription,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${displayTitle} — ${priceText} | Xeetrix Mart`,
      description: cleanDescription,
      url: canonicalPath,
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

export default async function MartProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug || "");
  const product = await resolveServerProduct(slug);

  const gallery = product
    ? parseGalleryUrls(product.galleryUrls, product.imageUrl).map((u) =>
        normalizeMartImageUrl(u)
      )
    : [];
  const inStock = product ? isProductOrderable(product) : false;
  const effectiveStock = product ? getEffectiveProductStock(product) : 0;

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.nameEn || product.nameBn || product.sku,
        description:
          product.descriptionEn ||
          product.descriptionBn ||
          `${product.nameEn || product.nameBn} available at Xeetrix Mart.`,
        sku: product.sku || product.id,
        image: gallery.length > 0 ? gallery : undefined,
        brand: {
          "@type": "Brand",
          name: "Xeetrix Mart",
        },
        offers: {
          "@type": "Offer",
          url: buildMartProductUrl(product),
          priceCurrency: "BDT",
          price: Number(product.price || 0),
          availability:
            inStock && (product.fulfillmentType === "dropship" || effectiveStock > 0)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Xeetrix Mart",
            telephone: MART_CONTACT_PHONE,
          },
        },
      }
    : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <MartStorefront focusedProductSlug={slug} />
    </>
  );
}
