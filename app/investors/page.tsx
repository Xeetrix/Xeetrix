import type { Metadata } from "next";
import { HoldingNavbar } from "@/components/holding/HoldingNavbar";
import { HoldingFooter } from "@/components/holding/HoldingFooter";
import { InvestorsClient } from "@/components/holding/InvestorsClient";
import { CONTACT_PHONE, CORPORATE_EMAIL, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Investor Relations | Xeetrix Holding Group",
  description:
    "Institutional investment thesis, operating KPIs, Pitch Deck download, and Expression of Interest (EOI) portal for Xeetrix Holding Group (জিট্রিক্স হোল্ডিং গ্রুপ).",
  keywords: [
    "Xeetrix Investor Relations",
    "Invest in Bangladesh Ventures",
    "Xeetrix Holding Group Pitch Deck",
    "জিট্রিক্স ইনভেস্টর রিলেশনস",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/investors`,
    siteName: "Xeetrix Holding Group",
    title: "Investor Relations | Xeetrix Holding Group",
    description:
      "Institutional investment thesis, operating KPIs, Pitch Deck download, and Expression of Interest portal for Xeetrix Holding Group.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Investor Relations | Xeetrix Holding Group",
    description:
      "Institutional investment thesis, operating KPIs, Pitch Deck download, and Expression of Interest portal for Xeetrix Holding Group.",
  },
  alternates: { canonical: "/investors" },
};

const investorsJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Investor Relations — Xeetrix Holding Group",
  url: `${SITE_URL}/investors`,
  about: {
    "@type": "Corporation",
    name: "Xeetrix Holding Group",
    url: SITE_URL,
    telephone: CONTACT_PHONE,
    email: CORPORATE_EMAIL,
  },
};

export default function InvestorsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-brand-700 focus:px-4 focus:py-2.5 focus:text-xs focus:font-bold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(investorsJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HoldingNavbar />
      <main id="main-content" className="flex-1">
        <InvestorsClient />
      </main>
      <HoldingFooter />
    </div>
  );
}
