import type { Metadata } from "next";
import { HoldingNavbar } from "@/components/holding/HoldingNavbar";
import { HoldingFooter } from "@/components/holding/HoldingFooter";
import { TravelsClient } from "@/components/travels/TravelsClient";

export const metadata: Metadata = {
  title: "Xeetrix Travels | Air Ticketing & Global Mobility",
  description:
    "GDS-verified international and domestic air ticketing, migrant worker quotas, student 46kg baggage fares, and Umrah bookings by Xeetrix Travels.",
  alternates: { canonical: "/travels" },
};

export default function TravelsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HoldingNavbar />
      <main className="flex-1">
        <TravelsClient />
      </main>
      <HoldingFooter />
    </div>
  );
}
