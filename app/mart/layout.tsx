import type { Metadata } from "next";
import { MartI18nProvider } from "@/components/mart/MartI18nProvider";
import { MartMetaPixel } from "@/components/mart/MartMetaPixel";

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
  icons: {
    icon: "/assets/aistudio/mart-favicon.png",
    shortcut: "/assets/aistudio/mart-favicon.png",
    apple: "/assets/aistudio/mart-favicon.png",
  },
};

export default function MartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <MartMetaPixel />
      <MartI18nProvider>{children}</MartI18nProvider>
    </div>
  );
}
