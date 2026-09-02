import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/ContactForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { FadeIn } from "@/components/ui/FadeIn";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  SITE_NAME,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with the ${SITE_NAME} team — questions about wholesale sourcing, becoming a supplier, or platform support.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container className="py-14 sm:py-20">
      <FadeIn className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
          Contact Us
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-950 sm:text-4xl">
          Let&apos;s talk trade
        </h1>
        <p className="mt-3 text-ink-500">
          Whether you&apos;re sourcing in bulk or looking to list your
          products, our team is here to help.
        </p>
      </FadeIn>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <FadeIn className="lg:col-span-3">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
            <ContactForm />
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="lg:col-span-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-ink-900">Email</p>
                <p className="text-sm text-ink-500">{CONTACT_EMAIL}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-ink-900">Phone</p>
                <p className="text-sm text-ink-500">{CONTACT_PHONE_DISPLAY}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-ink-900">Address</p>
                <p className="text-sm text-ink-500">{CONTACT_ADDRESS}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-ink-900">WhatsApp</p>
                <p className="text-sm text-ink-500">Fastest way to reach us directly.</p>
              </div>
            </div>
            <WhatsAppButton
              message="Hi Xeetrix, I'd like to learn more about the platform."
              className="mt-2"
            />
          </div>
        </FadeIn>
      </div>
    </Container>
  );
}
