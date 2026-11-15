import type { Metadata } from "next";
import { HoldingNavbar } from "@/components/holding/HoldingNavbar";
import { HoldingFooter } from "@/components/holding/HoldingFooter";
import { HoldingHomeClient } from "@/components/holding/HoldingHomeClient";
import {
  CONTACT_PHONE,
  CORPORATE_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Xeetrix | Holding Group — Retail, Global Mobility & Careers",
  description: SITE_DESCRIPTION,
  keywords: [
    "Xeetrix",
    "Xeetrix Holding Group",
    "Xeetrix Mart",
    "Xeetrix Travels",
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Xeetrix Holding Group",
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
};

export default function HoldingHomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HoldingNavbar />
      <main className="flex-1">
        <HoldingHomeClient />
      </main>
      <HoldingFooter />
    </div>
  );
}
