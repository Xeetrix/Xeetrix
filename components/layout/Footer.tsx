import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Clock, Award, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  SITE_NAME,
  SUPPORT_HOURS,
} from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700/20 text-brand-400 border border-brand-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Verified E-Tickets</h4>
                <p className="text-xs text-slate-400 mt-0.5">Authentic airline PNR with direct website check-in</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-600/20 text-gold-400 border border-gold-500/30">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">24/7 Ticketing Helpline</h4>
                <p className="text-xs text-slate-400 mt-0.5">Instant emergency re-issues & date change support</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700/20 text-brand-400 border border-brand-500/30">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Best Net-Fare Assurance</h4>
                <p className="text-xs text-slate-400 mt-0.5">GDS wholesale rates without hidden service fees</p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer Links */}
      <Container className="grid grid-cols-1 gap-8 py-10 sm:py-14 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand info */}
        <div className="lg:col-span-2">
          <Link href="/" className="group inline-flex items-center" aria-label="Xeetrix Home">
            <BrandLogo size="md" variant="badge" inverted />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            Official travel agency providing seamless flight ticket issuance, special Middle East worker quotas, student luggage support, Umrah travel arrangements, and 24/7 date re-issue services.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-brand-400" />
            <span>Authorized Global Air Ticketing Agency</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2.5">
            {[
              { href: "/flights", label: "Search Flights" },
              { href: "/services", label: "Ticketing Services" },
              { href: "/routes", label: "Popular Routes" },
              { href: "/how-it-works", label: "How It Works" },
              { href: "/contact", label: "Contact Helpline" },
              { href: "/contact#quote", label: "Request Quote" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Specialized Fares */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Specialized Fares
          </h3>
          <ul className="mt-4 space-y-2.5">
            {[
              { href: "/services#middle-east-workers", label: "Middle East Worker Fares" },
              { href: "/services#student-flights", label: "Student Extra Luggage (46kg)" },
              { href: "/services#umrah-holidays", label: "Umrah Air Tickets" },
              { href: "/services#date-change-reissue", label: "Instant Ticket Re-issue" },
              { href: "/routes#middle-east", label: "KSA & UAE Routes" },
              { href: "/routes#europe", label: "London & Europe Flights" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Helpline & Contact Info */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            24/7 Booking Desk
          </h3>
          <ul className="mt-4 space-y-3.5 text-sm text-slate-400">
            <li>
              <span className="text-xs text-slate-500 block">Emergency Helpline:</span>
              <a
                href={CONTACT_PHONE_TEL}
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-gold-400 transition-colors mt-0.5 text-base"
              >
                <Phone className="h-4 w-4 text-gold-400" />
                {CONTACT_PHONE_DISPLAY}
              </a>
            </li>

            <li>
              <span className="text-xs text-slate-500 block">Official Booking Email:</span>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mt-0.5 break-all"
              >
                <Mail className="h-4 w-4 text-brand-400 shrink-0" />
                {CONTACT_EMAIL}
              </a>
            </li>

            <li className="flex items-start gap-2 pt-1">
              <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <span className="text-xs leading-relaxed text-slate-400">
                {CONTACT_ADDRESS}
              </span>
            </li>

            <li className="text-xs text-brand-400 pt-1">
              {SUPPORT_HOURS}
            </li>
          </ul>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-6">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} Xeetrix (
            <a href="https://xeetrix.com" className="hover:text-slate-300 underline">
              xeetrix.com
            </a>
            ). All rights reserved. 100% Verified Airline Ticketing.
          </p>

          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-medium">Domain: xeetrix.com</span>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Support
            </Link>
            <Link href="/services" className="hover:text-slate-300 transition-colors">
              Terms & Fares
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
