import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AboutPageContent } from "./AboutPageContent";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Xeetrix | Authorized Air Ticketing Agency",
  description: `Learn about ${SITE_NAME}, your trusted air ticketing and global travel partner providing live GDS airline fares, 24/7 date re-issues, and specialized worker quotas.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <Container className="space-y-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Xeetrix" }]} />

        <AboutPageContent />
      </Container>
    </div>
  );
}
