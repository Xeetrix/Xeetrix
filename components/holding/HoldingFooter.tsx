import Link from "next/link";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { HoldingLogo } from "@/components/holding/HoldingLogo";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CORPORATE_EMAIL,
  KNLTC_URL,
  MART_EMAIL,
} from "@/lib/constants";

export function HoldingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Group Identity */}
          <div className="space-y-4">
            <HoldingLogo inverted />
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Parent holding group building operating companies across daily retail commerce,
              global aviation mobility, and international career placement.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
                <span>{CONTACT_ADDRESS}</span>
              </div>
              <a
                href={CONTACT_PHONE_TEL}
                className="flex items-center gap-2 text-white font-semibold hover:text-gold-400 transition-colors"
              >
                <Phone className="h-4 w-4 text-gold-500 shrink-0" />
                <span className="tabular-nums">{CONTACT_PHONE_DISPLAY}</span>
              </a>
            </div>
          </div>

          {/* Operating Ventures */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Operating Ventures
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/mart" className="hover:text-white transition-colors">
                  Xeetrix Mart — Retail &amp; Essentials
                </Link>
              </li>
              <li>
                <Link href="/travels" className="hover:text-white transition-colors">
                  Xeetrix Travels — Air Ticketing &amp; Mobility
                </Link>
              </li>
              <li>
                <a
                  href={KNLTC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>KNLTC — Japan Career Program</span>
                  <ExternalLink className="h-3.5 w-3.5 text-gold-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Holding & Governance */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Corporate &amp; Investors
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#about-group" className="hover:text-white transition-colors">
                  About Xeetrix Group
                </Link>
              </li>
              <li>
                <Link href="/investors" className="hover:text-white transition-colors">
                  Investor Relations
                </Link>
              </li>
              <li>
                <Link href="/#governance" className="hover:text-white transition-colors">
                  Governance &amp; Leadership
                </Link>
              </li>
              <li>
                <Link href="/#corporate-contact" className="hover:text-white transition-colors">
                  Corporate Inquiries
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Executive Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Dedicated Venture Desks */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Official Communications
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <div className="text-xs text-slate-400">Holding Group Desk</div>
                <a
                  href={`mailto:${CORPORATE_EMAIL}`}
                  className="inline-flex items-center gap-1.5 text-white hover:text-gold-400 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-gold-500" />
                  <span>{CORPORATE_EMAIL}</span>
                </a>
              </li>
              <li>
                <div className="text-xs text-slate-400">Xeetrix Mart Retail Desk</div>
                <a
                  href={`mailto:${MART_EMAIL}`}
                  className="inline-flex items-center gap-1.5 text-white hover:text-gold-400 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-gold-500" />
                  <span>{MART_EMAIL}</span>
                </a>
              </li>
              <li>
                <div className="text-xs text-slate-400">Xeetrix Travels Ticketing Desk</div>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-1.5 text-white hover:text-gold-400 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-gold-500" />
                  <span>{CONTACT_EMAIL}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Xeetrix Holding Group. All rights reserved.</p>
          <p>Dhaka, Bangladesh · Direct Helpline: {CONTACT_PHONE_DISPLAY}</p>
        </div>
      </div>
    </footer>
  );
}
