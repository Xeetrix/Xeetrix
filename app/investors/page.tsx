import type { Metadata } from "next";
import { HoldingNavbar } from "@/components/holding/HoldingNavbar";
import { HoldingFooter } from "@/components/holding/HoldingFooter";
import { InvestorsClient } from "@/components/holding/InvestorsClient";

export const metadata: Metadata = {
  title: "Investor Relations",
  description:
    "Institutional investment thesis, operating KPIs, Pitch Deck download, and Expression of Interest portal for Xeetrix Holding Group.",
  alternates: { canonical: "/investors" },
};

export default function InvestorsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HoldingNavbar />
      <main className="flex-1">
        <InvestorsClient />
      </main>
      <HoldingFooter />
    </div>
  );
}
