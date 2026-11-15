import type { Metadata } from "next";
import { HoldingNavbar } from "@/components/holding/HoldingNavbar";
import { HoldingFooter } from "@/components/holding/HoldingFooter";
import { HoldingHomeClient } from "@/components/holding/HoldingHomeClient";

export const metadata: Metadata = {
  title: "Xeetrix | Holding Group — Retail, Global Mobility & Careers",
  description:
    "Xeetrix Holding Group builds scalable operating ventures across daily retail commerce (Xeetrix Mart), global air ticketing (Xeetrix Travels), and Japan career placement (KNLTC).",
  alternates: { canonical: "/" },
};

export default function HoldingHomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HoldingNavbar />
      <main className="flex-1">
        <HoldingHomeClient />
      </main>
      <HoldingFooter />
    </div>
  );
}
