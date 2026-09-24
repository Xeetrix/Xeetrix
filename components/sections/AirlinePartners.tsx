"use client";

import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useI18n } from "@/lib/i18n-context";

const PARTNER_DATA = [
  { name: "Biman Bangladesh", code: "BG", hub: "Dhaka (DAC)", flag: "🇧🇩" },
  { name: "Saudia Airlines", code: "SV", hub: "Jeddah (JED) / Riyadh", flag: "🇸🇦" },
  { name: "Emirates", code: "EK", hub: "Dubai (DXB)", flag: "🇦🇪" },
  { name: "Qatar Airways", code: "QR", hub: "Doha (DOH)", flag: "🇶🇦" },
  { name: "Singapore Airlines", code: "SQ", hub: "Singapore (SIN)", flag: "🇸🇬" },
  { name: "flydubai", code: "FZ", hub: "Dubai (DXB)", flag: "🇦🇪" },
  { name: "Air Arabia", code: "G9", hub: "Sharjah (SHJ)", flag: "🇦🇪" },
  { name: "US-Bangla", code: "BS", hub: "Dhaka (DAC)", flag: "🇧🇩" },
  { name: "Malaysia Airlines", code: "MH", hub: "Kuala Lumpur (KUL)", flag: "🇲🇾" },
  { name: "Oman Air", code: "WY", hub: "Muscat (MCT)", flag: "🇴🇲" },
  { name: "Kuwait Airways", code: "KU", hub: "Kuwait (KWI)", flag: "🇰🇼" },
  { name: "Gulf Air", code: "GF", hub: "Bahrain (BAH)", flag: "🇧🇭" },
];

export function AirlinePartners() {
  const { t } = useI18n();

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-200/80">
      <Container size="wide">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 inline-block mb-2">
              {t("partners.badge")}
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              {t("partners.title")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              {t("partners.desc")}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
            <ShieldCheck className="h-4 w-4 text-brand-700" />
            <span>{t("partners.wholesale")}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {PARTNER_DATA.map((airline) => (
            <div
              key={airline.name}
              className="group flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-brand-500 hover:shadow-card transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{airline.flag}</span>
                <span className="font-mono text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded">
                  {airline.code}
                </span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                  {airline.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                  {airline.hub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
