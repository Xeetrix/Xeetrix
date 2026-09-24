import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PopularRoutes } from "@/components/sections/PopularRoutes";
import { CTASection } from "@/components/sections/CTASection";
import { RoutesHeroHeader } from "./RoutesHeroHeader";

export const metadata: Metadata = {
  title: "Popular Flight Routes & Fare Highlights | Xeetrix",
  description:
    "Explore top flight routes from Dhaka and Chittagong to Jeddah, Dubai, Riyadh, Kuala Lumpur, and London. Lowest net-fares with generous baggage options.",
  alternates: { canonical: "/routes" },
};

export default function RoutesPage() {
  return (
    <div className="py-8 sm:py-10 bg-slate-50 min-h-screen">
      <Container className="space-y-8 sm:space-y-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Popular Routes" }]} />

        <RoutesHeroHeader />

        <PopularRoutes isEmbedded hideHeader />

        <CTASection />
      </Container>
    </div>
  );
}
