"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Clock, Award, CheckCircle2, Building2, Ticket } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  SUPPORT_HOURS,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n-context";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8">
        <Container size="wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Verified GDS E-Tickets</h4>
                <p className="text-xs text-slate-400 mt-0.5">Direct PNR confirmed on official airline systems</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">24/7 Ticketing Desk</h4>
                <p className="text-xs text-slate-400 mt-0.5">Emergency date modifications & instant support</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">B2B Sub-Agent Network</h4>
                <p className="text-xs text-slate-400 mt-0.5">Zero investment ticketing workstation for agents</p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer Links */}
      <Container size="wide" className="grid grid-cols-1 gap-8 py-10 sm:py-14 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand info */}
        <div className="lg:col-span-2">
          <Link href="/" className="group inline-flex items-center" aria-label="Xeetrix Home">
            <BrandLogo size="md" variant="badge" inverted />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            Xeetrix is a premier air ticketing and travel distribution platform headquartered in Dhaka, Bangladesh. We provide wholesale GDS airfares for international travelers and empower local travel entrepreneurs through our B2B sub-agent network.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Authorized Global Air Ticketing Platform</span>
          </div>
        </div>

        {/* Passenger Services */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Passenger Services
          </h3>
          <ul className="mt-4 space-y-2.5">
            {[
              { href: "/flights", label: "Flight Search" },
              { href: "/flights/request", label: "Booking Request" },
              { href: "/track-booking", label: "Track Booking Status" },
              { href: "/routes", label: "Popular Flight Routes" },
              { href: "/services", label: "Worker & Student Fares" },
              { href: "/contact", label: "Contact Us" },
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

        {/* B2B Agent & Operations */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            B2B Agents & Portals
          </h3>
          <ul className="mt-4 space-y-2.5">
            {[
              { href: "/agents", label: "Become an Agent" },
              { href: "/agent/login", label: "Agent Portal Login" },
              { href: "/agent/register", label: "Agent Registration" },
              { href: "/agent/dashboard", label: "Agent Workstation" },
              { href: "/admin", label: "Admin Operations Desk" },
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

        {/* Helpline & Office */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            24/7 Ticketing Desk
          </h3>
          <ul className="mt-4 space-y-3.5 text-sm text-slate-400">
            <li>
              <span className="text-xs text-slate-500 block">Dedicated Hotline:</span>
              <a
                href={CONTACT_PHONE_TEL}
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-amber-400 transition-colors mt-0.5 text-base"
              >
                <Phone className="h-4 w-4 text-amber-400" />
                {CONTACT_PHONE_DISPLAY}
              </a>
            </li>

            <li>
              <span className="text-xs text-slate-500 block">Official Booking Email:</span>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mt-0.5 break-all"
              >
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                {CONTACT_EMAIL}
              </a>
            </li>

            <li className="flex items-start gap-2 pt-1">
              <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <span className="text-xs leading-relaxed text-slate-400">
                {CONTACT_ADDRESS}
              </span>
            </li>

            <li className="text-xs text-emerald-400 pt-1">
              {SUPPORT_HOURS}
            </li>
          </ul>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-6">
        <Container size="wide" className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} Xeetrix (xeetrix.com). All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-slate-300 transition-colors">
              Refund Policy
            </Link>
            <Link href="/track-booking" className="hover:text-slate-300 transition-colors font-semibold text-emerald-400">
              Track Booking
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
