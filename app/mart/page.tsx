import type { Metadata } from "next";
import Link from "next/link";
import { MartStorefront } from "@/components/mart/MartStorefront";
import { SITE_URL } from "@/lib/constants";
import { fetchMartPublicFromScript } from "@/lib/martServer";
import {
  buildMartProductUrl,
  DEFAULT_MART_SETTINGS,
  MartProduct,
  normalizeMartImageUrl,
  normalizeProductRecord,
  resolveMartContactInfo,
} from "@/lib/martApi";
import { getEffectiveProductStock, isProductOrderable } from "@/lib/martOps";

export const revalidate = 120;

export const metadata: Metadata = {
  title: {
    absolute:
      "Xeetrix Mart (জিট্রিক্স মার্ট) | Online Shopping, Electronics & Essentials in Bangladesh",
  },
  description:
    "Shop verified electronics, smart watches, earbuds, bags, lifestyle essentials & wholesale items at Xeetrix Mart (জিট্রিক্স মার্ট) with Cash on Delivery (ক্যাশ অন ডেলিভারি) across Bangladesh.",
  keywords: [
    "Xeetrix Mart",
    "জিট্রিক্স মার্ট",
    "Online Shopping Bangladesh",
    "অনলাইন শপিং বাংলাদেশ",
    "Cash on Delivery Bangladesh",
    "ক্যাশ অন ডেলিভারি",
    "Electronics Dhaka",
    "Smart Watch Bangladesh",
    "Wireless Earbuds Price in BD",
    "Everyday Essentials BD",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/mart`,
    siteName: "Xeetrix Mart",
    title:
      "Xeetrix Mart (জিট্রিক্স মার্ট) | Authentic Electronics & Everyday Essentials",
    description:
      "Shop verified electronics, home essentials, and lifestyle products with transparent BDT pricing and fast nationwide delivery across Bangladesh.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Xeetrix Mart (জিট্রিক্স মার্ট) | Authentic Electronics & Everyday Essentials",
    description:
      "Shop verified electronics, home essentials, and lifestyle products with transparent BDT pricing and fast nationwide delivery across Bangladesh.",
  },
  alternates: { canonical: "/mart" },
};

export default async function MartPage() {
  let activeProducts: MartProduct[] = [];
  let insideDhaka = Number(DEFAULT_MART_SETTINGS.insideDhakaCharge) || 60;
  let outsideDhaka = Number(DEFAULT_MART_SETTINGS.outsideDhakaCharge) || 120;
  let contact = resolveMartContactInfo(DEFAULT_MART_SETTINGS);

  try {
    const res = await fetchMartPublicFromScript();
    if (res?.data?.settings) {
      contact = resolveMartContactInfo(res.data.settings);
      insideDhaka =
        Number(res.data.settings.insideDhakaCharge) ||
        Number(DEFAULT_MART_SETTINGS.insideDhakaCharge) ||
        60;
      outsideDhaka =
        Number(res.data.settings.outsideDhakaCharge) ||
        Number(DEFAULT_MART_SETTINGS.outsideDhakaCharge) ||
        120;
    }
    if (Array.isArray(res?.data?.products)) {
      activeProducts = res.data.products
        .map((item) => normalizeProductRecord(item as Record<string, unknown>))
        .filter((p) => p.active);
    }
  } catch {
    // Fallback if live sheet is temporarily unreachable during SSR
  }

  const martGraphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "OnlineStore",
        "@id": `${SITE_URL}/mart#store`,
        name: "Xeetrix Mart",
        alternateName: ["জিট্রিক্স মার্ট", "Xeetrix Mart Bangladesh"],
        url: `${SITE_URL}/mart`,
        telephone: contact.hotlinePhone,
        email: contact.supportEmail,
        currenciesAccepted: "BDT",
        paymentAccepted: "Cash on Delivery, bKash, Bangla QR, Nagad, Rocket",
        priceRange: "৳৳",
        areaServed: {
          "@type": "Country",
          name: "Bangladesh",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/mart?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
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
        ],
      },
      {
        "@type": "ItemList",
        name: "Xeetrix Mart Product Catalog (জিট্রিক্স মার্ট পণ্যের তালিকা)",
        numberOfItems: activeProducts.length,
        itemListElement: activeProducts.slice(0, 60).map((prod, index) => {
          const prodUrl = `${SITE_URL}${buildMartProductUrl(prod)}`;
          const inStock = isProductOrderable(prod);
          const stockCount = getEffectiveProductStock(prod);
          return {
            "@type": "ListItem",
            position: index + 1,
            url: prodUrl,
            item: {
              "@type": "Product",
              name:
                prod.nameEn && prod.nameBn
                  ? `${prod.nameEn} (${prod.nameBn})`
                  : prod.nameEn || prod.nameBn || prod.sku,
              sku: prod.sku || prod.id,
              url: prodUrl,
              image: prod.imageUrl
                ? normalizeMartImageUrl(prod.imageUrl)
                : undefined,
              description:
                prod.descriptionEn ||
                prod.descriptionBn ||
                `${prod.nameEn || prod.nameBn} at Xeetrix Mart`,
              offers: {
                "@type": "Offer",
                url: prodUrl,
                priceCurrency: "BDT",
                price: Number(prod.price || 0),
                availability:
                  inStock &&
                  (prod.fulfillmentType === "dropship" || stockCount > 0)
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
              },
            },
          };
        }),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Xeetrix Mart-এ ডেলিভারি চার্জ কত? (What are the delivery charges at Xeetrix Mart?)",
            acceptedAnswer: {
              "@type": "Answer",
              text: `ঢাকা মেট্রোর ভেতরে ডেলিভারি চার্জ মাত্র ৳${insideDhaka} (২৪–৪৮ ঘণ্টায় ডেলিভারি) এবং ঢাকার বাইরে সারাদেশে ডেলিভারি চার্জ ৳${outsideDhaka} (২–৪ দিনে হোম ডেলিভারি)। Inside Dhaka delivery is ৳${insideDhaka} BDT and Outside Dhaka nationwide delivery is ৳${outsideDhaka} BDT.`,
            },
          },
          {
            "@type": "Question",
            name: "কীভাবে অর্ডার ও পেমেন্ট করা যায়? (What payment methods are supported?)",
            acceptedAnswer: {
              "@type": "Answer",
              text: "আপনি ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ) অথবা বিকাশ মার্চেন্ট কিউআর (bKash QR), বাংলা কিউআর (Bangla QR), নগদ ও রকেটের মাধ্যমে পেমেন্ট করতে পারবেন।",
            },
          },
          {
            "@type": "Question",
            name: "অর্ডার ট্র্যাক করার নিয়ম কী? (How can I track my Xeetrix Mart order?)",
            acceptedAnswer: {
              "@type": "Answer",
              text: "স্টোরের উপরের 'Track Order / অর্ডার ট্র্যাক' বাটনে ক্লিক করে আপনার অর্ডার আইডি এবং মোবাইল নম্বর দিলেই লাইভ ডেলিভারি স্ট্যাটাস দেখতে পাবেন।",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(martGraphJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MartStorefront />

      {/* Server-Rendered Crawlable Product Catalog Index for Search Engines & AI Bots */}
      {activeProducts.length > 0 && (
        <nav
          aria-label="Xeetrix Mart Complete Product Index"
          className="sr-only"
        >
          <h2>Xeetrix Mart Products — জিট্রিক্স মার্ট পণ্যের তালিকা</h2>
          <ul>
            {activeProducts.map((prod) => {
              const path = buildMartProductUrl(prod);
              const title =
                prod.nameEn && prod.nameBn
                  ? `${prod.nameEn} — ${prod.nameBn}`
                  : prod.nameEn || prod.nameBn || prod.sku;
              return (
                <li key={prod.id}>
                  <Link href={path}>
                    {title} — ৳{Number(prod.price || 0)} BDT (SKU: {prod.sku || prod.id})
                  </Link>
                  {prod.descriptionEn && <p>{prod.descriptionEn}</p>}
                  {prod.descriptionBn && <p>{prod.descriptionBn}</p>}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}
