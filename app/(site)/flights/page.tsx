import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FlightSearchBox } from "@/components/FlightSearchBox";
import { PopularRoutes } from "@/components/sections/PopularRoutes";
import { AirlinePartners } from "@/components/sections/AirlinePartners";
import { CTASection } from "@/components/sections/CTASection";
import { FlightsHeroHeader } from "@/components/sections/FlightsHeroHeader";

export const metadata: Metadata = {
  title: "Flight Search & Booking | Domestic & International",
  description:
    "Search and compare low airfares across 120+ airlines. Lowest net-fares to Saudi Arabia, UAE, Qatar, UK, USA, Canada, and Malaysia with Xeetrix.",
  alternates: { canonical: "/flights" },
};

export default function FlightsPage() {
  return (
    <div className="py-8 sm:py-10 bg-slate-50 min-h-screen">
      <Container size="wide" className="space-y-8 sm:space-y-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Flights" }]} />

        {/* Dynamic Multi-Language Header & Value Assurances */}
        <FlightsHeroHeader />

        {/* Flight Search Widget */}
        <div className="max-w-5xl mx-auto">
          <FlightSearchBox />
        </div>

        {/* Airline Partners */}
        <div className="pt-6">
          <AirlinePartners />
        </div>

        {/* Popular Routes */}
        <PopularRoutes isEmbedded />

        {/* Bottom CTA */}
        <CTASection />
      </Container>
    </div>
  );
}
