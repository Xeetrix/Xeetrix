"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Lock, PackageSearch, MessageCircle } from "lucide-react";
import { MartLogo } from "./MartLogo";
import { useMartI18n } from "./MartI18nProvider";
import { MartSettings, resolveMartContactInfo } from "@/lib/martApi";
import { toLocalizedDigits } from "@/lib/martI18n";

interface MartFooterProps {
  onOpenTrackOrder?: () => void;
  settings?: Partial<MartSettings>;
}

export function MartFooter({ onOpenTrackOrder, settings }: MartFooterProps) {
  const { lang, t } = useMartI18n();
  const year = toLocalizedDigits(new Date().getFullYear(), lang);
  const contact = resolveMartContactInfo(settings);

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Identity */}
          <div className="space-y-4">
            <MartLogo inverted />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {t.footer.description}
            </p>
          </div>

          {/* Customer Navigation */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              {t.footer.customerServiceTitle}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/mart#mart-catalog" className="hover:text-white transition-colors">
                  {t.footer.browseAllProducts}
                </Link>
              </li>
              {onOpenTrackOrder && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenTrackOrder}
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <PackageSearch className="h-3.5 w-3.5 text-gold-400" />
                    <span>{t.footer.trackYourOrder}</span>
                  </button>
                </li>
              )}
              <li>
                <Link
                  href="/mart/admin"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>{t.footer.storeAdminPortal}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Store Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              {t.footer.supportDeskTitle}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{t.footer.address}</span>
              </li>
              <li>
                <a
                  href={contact.mailtoHref}
                  className="inline-flex items-center gap-2.5 text-white hover:text-gold-400 transition-colors"
                >
                  <Mail className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>{contact.supportEmail}</span>
                </a>
              </li>
              <li>
                <a
                  href={contact.hotlineTelHref}
                  className="inline-flex items-center gap-2.5 font-mono font-semibold text-white hover:text-gold-400 transition-colors tabular-nums"
                >
                  <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>{contact.hotlinePhone}</span>
                </a>
              </li>
              {contact.whatsappHref && (
                <li>
                  <a
                    href={contact.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 font-mono font-semibold text-emerald-300 hover:text-white transition-colors tabular-nums"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>WhatsApp: {contact.whatsappNumber}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {year} {t.common.brandPrimary} {t.common.brandAccent}. {t.footer.allRightsReserved}
          </p>
          <p>
            {t.footer.helplineLabel}:{" "}
            <a
              href={contact.hotlineTelHref}
              className="font-mono text-slate-300 hover:text-white transition-colors tabular-nums"
            >
              {contact.hotlinePhone}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
