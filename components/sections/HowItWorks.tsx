import { ClipboardCheck, Handshake, PackageSearch, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/FadeIn";

const steps = [
  {
    icon: PackageSearch,
    title: "Discover Products",
    description:
      "Browse thousands of wholesale listings across textiles, electronics, home goods, beauty, industrial, and agriculture.",
  },
  {
    icon: ClipboardCheck,
    title: "Compare & Verify",
    description:
      "Review MOQs, wholesale pricing, and supplier details — every listing shows transparent terms up front.",
  },
  {
    icon: Handshake,
    title: "Connect Directly",
    description:
      "Message importers or exporters directly via WhatsApp to negotiate terms — no hidden middleman fees.",
  },
  {
    icon: Truck,
    title: "Trade & Fulfill",
    description:
      "Finalize your order and coordinate fulfillment with your trade partner across borders, with confidence.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-ink-50/60 py-20 sm:py-24">
      <Container>
        <FadeIn>
          <SectionHeader
            eyebrow="How Xeetrix Works"
            title="From discovery to delivery, in four steps"
            description="A straightforward path to sourcing or selling in bulk — built for entrepreneurs who need clarity, not complexity."
          />
        </FadeIn>

        <Stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <div className="relative flex h-full flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
                <span className="absolute right-5 top-5 font-display text-3xl font-bold text-ink-100">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <step.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-lg font-semibold text-ink-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-500">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
