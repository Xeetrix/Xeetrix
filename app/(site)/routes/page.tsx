import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PopularRoutes } from "@/components/sections/PopularRoutes";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Popular Flight Routes & Fare Highlights | Xeetrix",
  description:
    "Explore top flight routes from Dhaka and Chittagong to Jeddah, Dubai, Riyadh, Kuala Lumpur, and London. Lowest net-fares with generous baggage options.",
  alternates: { canonical: "/routes" },
};

export default function RoutesPage() {
  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <Container className="space-y-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Popular Routes" }]} />

        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Global Connections
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Popular Routes &amp; Lowest Net-Fares
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Direct airline seat quotas with guaranteed baggage allowances for Middle East
            migrant workers, Umrah pilgrims, university students, and business travelers.
          </p>
        </div>

        <PopularRoutes />

        <CTASection />
      </Container>
    </div>
  );
}
