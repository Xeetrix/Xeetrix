import type { Metadata } from "next";
import { HoldingNavbar } from "@/components/holding/HoldingNavbar";
import { HoldingFooter } from "@/components/holding/HoldingFooter";
import { HoldingHomeClient } from "@/components/holding/HoldingHomeClient";
import {
  CONTACT_PHONE,
  CORPORATE_EMAIL,
  KNLTC_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Xeetrix | Holding Group — Retail, Global Mobility & Careers",
  description: `${SITE_DESCRIPTION} জিট্রিক্স হোল্ডিং গ্রুপ — জিট্রিক্স মার্ট (ই-কমার্স), জিট্রিক্স ট্রাভেলস (এয়ার টিকেটিং) ও জাপান ক্যারিয়ার প্রোগ্রাম।`,
  keywords: [
    "Xeetrix",
    "Xeetrix Holding Group",
    "জিট্রিক্স",
    "জিট্রিক্স হোল্ডিং গ্রুপ",
    "Xeetrix Mart",
    "জিট্রিক্স মার্ট",
    "Xeetrix Travels",
    "জিট্রিক্স ট্রাভেলস",
    "KNLTC Japan Program",
    "Bangladesh Holding Company",
    "Investor Relations Bangladesh",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Xeetrix | Holding Group — Retail, Mobility & Global Careers",
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xeetrix | Holding Group — Retail, Mobility & Global Careers",
    description: SITE_DESCRIPTION,
  },
  alternates: { canonical: "/" },
};

const homeKnowledgeGraphJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Xeetrix Holding Group",
      alternateName: ["Xeetrix", "জিট্রিক্স হোল্ডিং গ্রুপ"],
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: SITE_DESCRIPTION,
      telephone: CONTACT_PHONE,
      email: CORPORATE_EMAIL,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Level 4, Trade Valley Tower, VIP Road, Motijheel",
        addressLocality: "Dhaka",
        postalCode: "1000",
        addressCountry: "BD",
      },
      subOrganization: [
        {
          "@type": "OnlineStore",
          name: "Xeetrix Mart",
          alternateName: "জিট্রিক্স মার্ট",
          url: `${SITE_URL}/mart`,
        },
        {
          "@type": "TravelAgency",
          name: "Xeetrix Travels",
          alternateName: "জিট্রিক্স ট্রাভেলস",
          url: `${SITE_URL}/travels`,
        },
        {
          "@type": "EducationalOrganization",
          name: "KNLTC Japan Career Program",
          url: KNLTC_URL,
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Xeetrix Holding Group & Xeetrix Mart",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: ["en-US", "bn-BD"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/mart?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function HoldingHomePage() {
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
          __html: JSON.stringify(homeKnowledgeGraphJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HoldingNavbar />
      <main id="main-content" className="flex-1">
        <HoldingHomeClient />
      </main>
      <HoldingFooter />
    </div>
  );
}
