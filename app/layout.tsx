import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  DM_Sans,
  JetBrains_Mono,
  Noto_Sans_Bengali,
} from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

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

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-noto-bengali",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${notoSansBengali.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans bg-white text-slate-900 antialiased leading-relaxed selection:bg-brand-100 selection:text-brand-900 [font-family:var(--font-dm-sans),var(--font-noto-bengali),sans-serif]">
        {children}
      </body>
    </html>
  );
}
