import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import { MartI18nProvider } from "@/components/mart/MartI18nProvider";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-noto-bengali",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Xeetrix Mart | Everyday Essentials & Authentic Electronics",
    template: "%s | Xeetrix Mart",
  },
  description:
    "Shop verified electronics, home essentials, and lifestyle products with transparent BDT pricing and fast nationwide delivery across Bangladesh.",
  keywords: [
    "Xeetrix Mart",
    "Online Shopping Bangladesh",
    "Cash on Delivery Bangladesh",
    "Electronics Dhaka",
    "Everyday Essentials",
  ],
  authors: [{ name: "Xeetrix Mart" }],
  openGraph: {
    type: "website",
    siteName: "Xeetrix Mart",
    title: "Xeetrix Mart | Everyday Essentials & Authentic Electronics",
    description:
      "Shop verified electronics, home essentials, and lifestyle products with transparent BDT pricing and fast nationwide delivery across Bangladesh.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xeetrix Mart | Everyday Essentials & Authentic Electronics",
    description:
      "Shop verified electronics, home essentials, and lifestyle products with transparent BDT pricing and fast nationwide delivery across Bangladesh.",
  },
};

export default function MartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${notoSansBengali.variable} [font-family:var(--font-dm-sans),var(--font-noto-bengali),sans-serif]`}
    >
      <MartI18nProvider>{children}</MartI18nProvider>
    </div>
  );
}
