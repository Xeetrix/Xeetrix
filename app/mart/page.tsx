import type { Metadata } from "next";
import { MartStorefront } from "@/components/mart/MartStorefront";

export const metadata: Metadata = {
  title: {
    absolute: "Xeetrix Mart | Everyday Essentials & Authentic Electronics",
  },
  description:
    "Shop verified electronics, home essentials, and lifestyle products with transparent BDT pricing and fast nationwide delivery across Bangladesh.",
  alternates: { canonical: "/mart" },
};

export default function MartPage() {
  return <MartStorefront />;
}
