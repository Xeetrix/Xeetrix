import type { Metadata } from "next";
import { HoldingNavbar } from "@/components/holding/HoldingNavbar";
import { HoldingFooter } from "@/components/holding/HoldingFooter";
import { TravelsClient } from "@/components/travels/TravelsClient";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  POPULAR_ROUTES,
  SITE_URL,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Xeetrix Travels (জিট্রিক্স ট্রাভেলস) | Air Ticketing & Global Mobility",
  description:
    "GDS-verified international and domestic air ticketing, Middle East migrant worker quotas, student 46kg baggage fares, and Umrah bookings by Xeetrix Travels (জিট্রিক্স ট্রাভেলস).",
  keywords: [
    "Xeetrix Travels",
    "জিট্রিক্স ট্রাভেলস",
    "Air Ticket Bangladesh",
    "বিমানের টিকেট বাংলাদেশ",
    "Saudi Worker Air Ticket",
    "Student Air Ticket Extra Baggage",
    "Umrah Flight Ticket Dhaka",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/travels`,
    siteName: "Xeetrix Travels",
    title: "Xeetrix Travels | GDS Air Ticketing & Global Mobility",
    description:
      "GDS-verified international and domestic air ticketing, migrant worker quotas, student 46kg baggage fares, and Umrah bookings.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xeetrix Travels | GDS Air Ticketing & Global Mobility",
    description:
      "GDS-verified international and domestic air ticketing, migrant worker quotas, student 46kg baggage fares, and Umrah bookings.",
  },
  alternates: { canonical: "/travels" },
};

const travelsJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Xeetrix Travels",
  alternateName: "জিট্রিক্স ট্রাভেলস",
  url: `${SITE_URL}/travels`,
  telephone: CONTACT_PHONE,
  email: CONTACT_EMAIL,
  currenciesAccepted: "BDT, USD",
  areaServed: "BD",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Popular International Flight Routes from Bangladesh",
    itemListElement: POPULAR_ROUTES.map((r) => ({
      "@type": "Offer",
      name: `${r.fromCity} (${r.fromCode}) to ${r.toCity} (${r.toCode}) Air Ticket`,
      priceCurrency: "BDT",
      price: r.startingPrice,
      description: `${r.flightType} flight (${r.duration}) · Baggage: ${r.baggage}`,
    })),
  },
};

export default function TravelsPage() {
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
          __html: JSON.stringify(travelsJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HoldingNavbar />
      <main id="main-content" className="flex-1">
        <TravelsClient />
      </main>
      <HoldingFooter />
    </div>
  );
}
