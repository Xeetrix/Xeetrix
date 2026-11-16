import { NextResponse } from "next/server";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CORE_SERVICES,
  CORPORATE_EMAIL,
  KNLTC_URL,
  MART_EMAIL,
  POPULAR_ROUTES,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/constants";
import { fetchMartPublicFromScript } from "@/lib/martServer";
import {
  buildMartProductUrl,
  DEFAULT_MART_SETTINGS,
  MartProduct,
  normalizeProductRecord,
  parseProductColors,
  parseProductSizes,
} from "@/lib/martApi";
import { getEffectiveProductStock, isProductOrderable } from "@/lib/martOps";

export const dynamic = "force-dynamic";

export async function GET() {
  let products: MartProduct[] = [];
  let categoriesSummary: string[] = [];
  let insideDhaka = String(DEFAULT_MART_SETTINGS.insideDhakaCharge);
  let outsideDhaka = String(DEFAULT_MART_SETTINGS.outsideDhakaCharge);

  try {
    const res = await fetchMartPublicFromScript();
    if (res?.data?.settings) {
      insideDhaka = String(
        res.data.settings.insideDhakaCharge ||
          DEFAULT_MART_SETTINGS.insideDhakaCharge
      );
      outsideDhaka = String(
        res.data.settings.outsideDhakaCharge ||
          DEFAULT_MART_SETTINGS.outsideDhakaCharge
      );
    }
    if (Array.isArray(res?.data?.categories)) {
      categoriesSummary = res.data.categories
        .map((item: unknown) => {
          const c = (item || {}) as Record<string, unknown>;
          const en = String(c.nameEn || "").trim();
          const bn = String(c.nameBn || "").trim();
          const slug = String(c.slug || "").trim();
          return en && bn ? `- **${en} (${bn})** [slug: \`${slug}\`]` : `- **${en || bn || slug}**`;
        })
        .filter(Boolean);
    }
    if (Array.isArray(res?.data?.products)) {
      products = res.data.products
        .map((item) => normalizeProductRecord(item as Record<string, unknown>))
        .filter((p) => p.active);
    }
  } catch {
    // Fallback if live sheet is unreachable
  }

  const productBlocks = products.map((p, idx) => {
    const titleEn = p.nameEn || p.sku;
    const titleBn = p.nameBn || "";
    const url = `${SITE_URL}${buildMartProductUrl(p)}`;
    const inStock = isProductOrderable(p);
    const stockCount = getEffectiveProductStock(p);
    const colors = parseProductColors(p.colorsJson)
      .map((c) => (c.nameBn ? `${c.nameEn} (${c.nameBn})` : c.nameEn))
      .filter(Boolean)
      .join(", ");
    const sizes = parseProductSizes(p.sizesList).join(", ");
    const wholesaleText =
      p.wholesaleMinQty > 0 && p.wholesalePrice > 0
        ? `৳${p.wholesalePrice} BDT (Min ${p.wholesaleMinQty} units)`
        : "N/A";

    return `### ${idx + 1}. ${titleEn}${titleBn ? ` / ${titleBn}` : ""}
- **Product URL**: ${url}
- **SKU**: ${p.sku || p.id}
- **Price (BDT)**: ৳${Number(p.price || 0).toLocaleString("en-BD")}${
      p.comparePrice > p.price ? ` (Regular: ৳${Number(p.comparePrice).toLocaleString("en-BD")})` : ""
    }
- **Wholesale Tier**: ${wholesaleText}
- **Availability**: ${
      !inStock
        ? "Out of Stock"
        : p.fulfillmentType === "dropship"
        ? "In Stock (Ready to Order)"
        : `In Stock (${stockCount} units available)`
    }
- **Categories**: ${p.categories || "general"}
${colors ? `- **Available Colors**: ${colors}\n` : ""}${sizes ? `- **Available Sizes**: ${sizes}\n` : ""}- **Description (EN)**: ${p.descriptionEn || "Verified product from Xeetrix Mart."}
${p.descriptionBn ? `- **Description (BN)**: ${p.descriptionBn}\n` : ""}`;
  });

  const travelRouteBlocks = POPULAR_ROUTES.map(
    (r) =>
      `- **${r.fromCity} (${r.fromCode}) → ${r.toCity} (${r.toCode}, ${r.toCountry})**: Starting from ৳${r.startingPrice.toLocaleString("en-US")} BDT ($${r.priceUSD} USD) · ${r.flightType} (${r.duration}) · Baggage: ${r.baggage} · Airlines: ${r.airlines.join(", ")}`
  );

  const content = `# Xeetrix Holding Group & Xeetrix Mart — Complete AI Knowledge Graph (/llms-full.txt)

> ${SITE_DESCRIPTION}

---

## 1. Corporate Identity & Contact Information
- **Organization Name**: Xeetrix Holding Group (জিট্রিক্স হোল্ডিং গ্রুপ)
- **Official Website**: ${SITE_URL}
- **Headquarters Address**: ${CONTACT_ADDRESS}
- **Central 24/7 Helpline**: ${CONTACT_PHONE_DISPLAY}
- **Corporate Email**: ${CORPORATE_EMAIL}
- **Xeetrix Mart Email**: ${MART_EMAIL}
- **Xeetrix Travels Email**: ${CONTACT_EMAIL}

---

## 2. Xeetrix Mart (জিট্রিক্স মার্ট) — E-Commerce Storefront & Complete Product Catalog
- **Storefront URL**: ${SITE_URL}/mart
- **Search Endpoint**: ${SITE_URL}/mart?q={query}
- **Delivery Charge Inside Dhaka**: ৳${insideDhaka} BDT (24–48 Hours)
- **Delivery Charge Outside Dhaka (All Bangladesh)**: ৳${outsideDhaka} BDT (2–4 Days)
- **Supported Payment Methods**: Cash on Delivery (COD / ক্যাশ অন ডেলিভারি), bKash Merchant QR, Bangla QR, Nagad, Rocket.
- **Return Policy**: 7-day hassle-free replacement policy for verified defects.

### Store Categories
${categoriesSummary.length > 0 ? categoriesSummary.join("\n") : "- General Essentials & Electronics"}

### Live Product Catalog (${products.length} Active Products)
${
  productBlocks.length > 0
    ? productBlocks.join("\n\n")
    : `Visit ${SITE_URL}/mart for the live interactive product catalog.`
}

---

## 3. Xeetrix Travels (জিট্রিক্স ট্রাভেলস) — Air Ticketing & Global Mobility
- **URL**: ${SITE_URL}/travels
- **Core Services**:
${CORE_SERVICES.map((s) => `  - **${s.title}**: ${s.description}`).join("\n")}

### Popular Flight Routes from Bangladesh
${travelRouteBlocks.join("\n")}

---

## 4. KNLTC Japan Career Program & Investor Relations
- **KNLTC Japan Career Portal**: ${KNLTC_URL} — Japanese language training (JLPT N5/N4) and Specified Skilled Worker (SSW) / TITP placement in Japan.
- **Xeetrix Investor Relations**: ${SITE_URL}/investors — Institutional investment thesis, audited operating KPIs, and Expression of Interest submission portal.
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
