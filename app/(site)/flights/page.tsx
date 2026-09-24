import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FlightSearchBox } from "@/components/FlightSearchBox";
import { PopularRoutes } from "@/components/sections/PopularRoutes";
import { AirlinePartners } from "@/components/sections/AirlinePartners";
import { CTASection } from "@/components/sections/CTASection";
import { ShieldCheck, Luggage, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Flight Search & Booking | Domestic & International",
  description:
    "Search and compare low airfares across 120+ airlines. Lowest net-fares to Saudi Arabia, UAE, Qatar, UK, USA, Canada, and Malaysia with Xeetrix.",
  alternates: { canonical: "/flights" },
};

export default function FlightsPage() {
  return (
    <div className="py-8 sm:py-10 bg-slate-50 min-h-screen">
      <Container className="space-y-8 sm:space-y-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Flights" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Real-Time GDS Inventory
          </span>
          <h1 className="mt-3 font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Compare &amp; Book Airline Flights
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Access exclusive net-fares for domestic flights across Bangladesh and
            international flights to over 250 global destinations.
          </p>
        </div>

        {/* Flight Search Widget */}
        <div className="max-w-5xl mx-auto">
          <FlightSearchBox />
        </div>

        {/* Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto pt-2">
          <div className="flex items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Direct PNR Verification</h4>
              <p className="text-xs text-slate-500">Check reservation directly on airline sites</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
              <Luggage className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Student &amp; Worker Luggage</h4>
              <p className="text-xs text-slate-500">Up to 46kg allowance on qualifying flights</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">15-Minute Issuance</h4>
              <p className="text-xs text-slate-500">Fast e-ticket generation directly to your email</p>
            </div>
          </div>
        </div>

        {/* Popular Routes Section */}
        <div className="pt-4">
          <PopularRoutes isEmbedded />
        </div>

        {/* Airline Partners */}
        <AirlinePartners />

        {/* CTA */}
        <CTASection />
      </Container>
    </div>
  );
}
