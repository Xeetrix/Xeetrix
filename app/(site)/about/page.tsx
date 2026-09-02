import type { Metadata } from "next";
import { Globe2, Handshake, MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/FadeIn";
import { CONTACT_ADDRESS, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${SITE_NAME}, the B2B wholesale platform connecting local entrepreneurs with verified importers and exporters worldwide.`,
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: Globe2,
    title: "Global Reach",
    description: "Trade partners across 40+ countries, spanning Asia, MENA, Europe, and the Americas.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Trade",
    description: "Every importer and exporter on Xeetrix is reviewed before they can list or trade.",
  },
  {
    icon: Handshake,
    title: "Direct Connections",
    description: "No hidden middlemen — negotiate and fulfill orders directly with your trade partner.",
  },
  {
    icon: TrendingUp,
    title: "Transparent Pricing",
    description: "Wholesale pricing, MOQs, and stock levels are shown up front on every listing.",
  },
];

export default function AboutPage() {
  return (
    <Container className="py-14 sm:py-20">
      <FadeIn className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
          About {SITE_NAME}
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-950 sm:text-4xl">
          {SITE_TAGLINE}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
          {SITE_NAME} is a B2B wholesale platform built for local entrepreneurs
          who want to buy and sell in bulk without navigating layers of
          middlemen. We connect importers and exporters directly, with
          transparent pricing, minimum order quantities, and verified trade
          partners — so you can source or sell with confidence.
        </p>
        <p className="mt-4 flex items-start gap-2 text-sm text-ink-500">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
          Headquartered at {CONTACT_ADDRESS}
        </p>
      </FadeIn>

      <Stagger className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <StaggerItem key={value.title}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <value.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink-900">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-500">
                {value.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  );
}
