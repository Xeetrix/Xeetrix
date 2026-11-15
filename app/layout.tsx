import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  CONTACT_PHONE,
  CONTACT_EMAIL,
} from "@/lib/constants";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Xeetrix | Holding Group — Retail, Mobility & Global Careers",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Xeetrix",
    "Xeetrix Holding Group",
    "Xeetrix Mart",
    "Xeetrix Travels",
    "KNLTC Japan Program",
    "Bangladesh Holding Company",
    "Air Ticketing Dhaka",
    "Investor Relations Bangladesh",
  ],
  authors: [{ name: SITE_NAME }],
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
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/logo.svg",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Xeetrix Holding Group",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: SITE_DESCRIPTION,
  telephone: CONTACT_PHONE,
  email: CONTACT_EMAIL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Level 4, Trade Valley Tower, VIP Road, Motijheel",
    addressLocality: "Dhaka",
    postalCode: "1000",
    addressCountry: "BD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans bg-white text-slate-900 antialiased selection:bg-brand-100 selection:text-brand-900">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
