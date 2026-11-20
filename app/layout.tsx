import type { Metadata } from "next";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

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
    "জিট্রিক্স",
    "জিট্রিক্স মার্ট",
    "Xeetrix Mart",
    "Xeetrix Travels",
    "KNLTC Japan",
    "Online Shopping Bangladesh",
    "অনলাইন শপিং বাংলাদেশ",
    "ক্যাশ অন ডেলিভারি",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/logo.png",
  },
  other: {
    "facebook-domain-verification": "ezqntv0jitqx4pxwc7kph59p3rii8x",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans bg-white text-slate-900 antialiased leading-relaxed selection:bg-brand-100 selection:text-brand-900 [font-family:var(--font-dm-sans),var(--font-noto-bengali),sans-serif]">
        {children}
      </body>
    </html>
  );
}
