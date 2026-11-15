import type { Metadata } from "next";
import { MartAdminClient } from "@/components/mart/MartAdminClient";

export const metadata: Metadata = {
  title: "Store Admin",
  description:
    "Dedicated e-commerce administration portal for Xeetrix Mart products, inventory, orders, categories, and customer analytics.",
  robots: { index: false, follow: false },
};

export default function MartAdminPage() {
  return <MartAdminClient />;
}
