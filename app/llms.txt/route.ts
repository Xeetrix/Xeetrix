import { NextResponse } from "next/server";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CORPORATE_EMAIL,
  KNLTC_URL,
  MART_EMAIL,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/constants";
import { fetchMartPublicFromScript } from "@/lib/martServer";
import {
  buildMartProductUrl,
  DEFAULT_MART_SETTINGS,
  normalizeProductRecord,
} from "@/lib/martApi";

export const dynamic = "force-dynamic";

export async function GET() {
  let productLines: string[] = [];
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
    if (Array.isArray(res?.data?.products)) {
      const activeProducts = res.data.products
        .map((item) => normalizeProductRecord(item as Record<string, unknown>))
        .filter((p) => p.active);

      productLines = activeProducts.slice(0, 50).map((p) => {
        const title =
          p.nameEn && p.nameBn
            ? `${p.nameEn} (${p.nameBn})`
            : p.nameEn || p.nameBn || p.sku;
        const url = `${SITE_URL}${buildMartProductUrl(p)}`;
        return `- [${title}](${url}): ৳${Number(p.price || 0).toLocaleString("en-BD")} BDT · SKU: ${p.sku || p.id}`;
      });
    }
  } catch {
    // Keep default summary if backend is temporarily unreachable
  }

  const content = `# Xeetrix Holding Group & Xeetrix Mart

> ${SITE_DESCRIPTION}

## Official Websites & Core Ventures
- [Xeetrix Holding Group (Home)](${SITE_URL}/): Corporate headquarters, venture portfolio, and business overview.
- [Xeetrix Mart (Online Store — Bangladesh)](${SITE_URL}/mart): Authentic electronics, gadgets, fashion, and everyday essentials with Cash on Delivery (COD) and nationwide courier shipping across Bangladesh.
- [Xeetrix Travels (Air Ticketing & Global Mobility)](${SITE_URL}/travels): GDS-verified domestic & international air tickets, Middle East migrant worker special fares, student 46kg baggage fares, and Umrah packages.
- [Investor Relations](${SITE_URL}/investors): Institutional investment thesis, operating KPIs, and Expression of Interest (EOI) portal.
- [KNLTC Japan Career Placement](${KNLTC_URL}): Japanese language training and SSW/TITP career placement in Japan.
- [Full AI Knowledge Base & Complete Product Catalog](${SITE_URL}/llms-full.txt): Detailed Markdown feed of all live Xeetrix Mart products, prices, SKUs, and specifications.
- [XML Sitemap](${SITE_URL}/sitemap.xml): Complete index of all public pages and product URLs.

## Xeetrix Mart — Store Policies & Delivery Charges
- **Currency**: Bangladeshi Taka (BDT / ৳)
- **Inside Dhaka Metro Delivery Charge**: ৳${insideDhaka} BDT (24–48 hours delivery)
- **Outside Dhaka (Nationwide) Delivery Charge**: ৳${outsideDhaka} BDT (2–4 days delivery)
- **Payment Methods**: Cash on Delivery (COD), bKash Merchant QR, Bangla QR, Nagad, and Rocket.
- **Smart Search URL**: ${SITE_URL}/mart?q={search_term}

## Featured Xeetrix Mart Products
${productLines.length > 0 ? productLines.join("\n") : `- Browse live catalog at ${SITE_URL}/mart`}

## Contact & Support
- **24/7 Helpline**: ${CONTACT_PHONE_DISPLAY}
- **Corporate Email**: ${CORPORATE_EMAIL}
- **Xeetrix Mart Support**: ${MART_EMAIL}
- **Xeetrix Travels Desk**: ${CONTACT_EMAIL}
- **Headquarters**: ${CONTACT_ADDRESS}
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
