"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Clock, Award, CheckCircle2 } from "lucide-react";
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
  const { t, language } = useI18n();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8">
        <Container size="wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700/20 text-brand-400 border border-brand-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{t("footer.verifiedE")}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{t("footer.verifiedEDesc")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-600/20 text-gold-400 border border-gold-500/30">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{t("footer.support247")}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{t("footer.support247Desc")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700/20 text-brand-400 border border-brand-500/30">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{t("footer.bestFare")}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{t("footer.bestFareDesc")}</p>
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
            {t("footer.desc")}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Authorized Global Air Ticketing Agency</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            {t("footer.quickLinks")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {[
              { href: "/flights", label: t("nav.flights") },
              { href: "/services", label: t("nav.services") },
              { href: "/routes", label: t("nav.routes") },
              { href: "/how-it-works", label: t("nav.baggageVisa") },
              { href: "/contact", label: t("nav.contact") },
              { href: "/contact#quote", label: t("nav.requestQuote") },
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
            {t("footer.servicesTitle")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {[
              {
                href: "/services#middle-east-workers",
                label:
                  language === "bn"
                    ? "প্রবাসী কর্মী স্পেশাল ফেয়ার"
                    : language === "ar"
                    ? "أسعار عمالة الشرق الأوسط"
                    : "Middle East Worker Fares",
              },
              {
                href: "/services#student-flights",
                label:
                  language === "bn"
                    ? "শিক্ষার্থীদের ৪৬ কেজি লাগেজ"
                    : language === "ar"
                    ? "أمتعة الطلاب 46 كجم"
                    : "Student Extra Luggage (46kg)",
              },
              {
                href: "/services#umrah-holidays",
                label:
                  language === "bn"
                    ? "উমরাহ ও হজ্জ ফ্লাইট টিকিট"
                    : language === "ar"
                    ? "تذاكر رحلات العمرة"
                    : "Umrah Air Tickets",
              },
              {
                href: "/services#date-change-reissue",
                label:
                  language === "bn"
                    ? "জরুরি টিকিট রি-ইস্যু ও ডেট চেঞ্জ"
                    : language === "ar"
                    ? "إعادة إصدار فوري للتذاكر"
                    : "Instant Ticket Re-issue",
              },
              {
                href: "/routes#middle-east",
                label:
                  language === "bn"
                    ? "কেএসএ ও ইউএই রুট"
                    : language === "ar"
                    ? "رحلات السعودية والإمارات"
                    : "KSA & UAE Routes",
              },
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
            {t("footer.contactTitle")}
          </h3>
          <ul className="mt-4 space-y-3.5 text-sm text-slate-400">
            <li>
              <span className="text-xs text-slate-500 block">{t("topbar.helpline")}</span>
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
            © {currentYear} Xeetrix (xeetrix.com). {t("footer.rights")}
          </p>

          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-medium">Domain: xeetrix.com</span>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Support Desk
            </Link>
            <Link href="/services" className="hover:text-slate-300 transition-colors">
              Terms &amp; Fares
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
