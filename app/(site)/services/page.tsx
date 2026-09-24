import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/sections/CTASection";
import { ServicesPageContent } from "./ServicesPageContent";

export const metadata: Metadata = {
  title: "Air Ticketing & Travel Services | Xeetrix",
  description:
    "Explore our specialized air ticketing services: Migrant worker fares, student flights with 46kg luggage, Umrah packages, and 24/7 instant ticket re-issuance.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <Container className="space-y-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />

        <ServicesPageContent />

        <CTASection />
      </Container>
    </div>
  );
}
