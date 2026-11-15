import type { Metadata } from "next";
import { HoldingNavbar } from "@/components/holding/HoldingNavbar";
import { HoldingFooter } from "@/components/holding/HoldingFooter";
import { MartClient } from "@/components/mart/MartClient";

export const metadata: Metadata = {
  title: "Xeetrix Mart | Everyday Retail & Smart Electronics",
  description:
    "Shop verified electronics, home appliances, and everyday retail essentials with fast Cash-on-Delivery fulfillment across Bangladesh.",
  alternates: { canonical: "/mart" },
};

export default function MartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HoldingNavbar />
      <main className="flex-1">
        <MartClient />
      </main>
      <HoldingFooter />
    </div>
  );
}
