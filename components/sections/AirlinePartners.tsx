import { Plane } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PARTNER_AIRLINES } from "@/lib/constants";

export function AirlinePartners() {
  return (
    <section className="py-14 bg-white border-b border-slate-200/80">
      <Container>
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Official Global Airline Partnerships &amp; GDS Inventories
          </span>
          <p className="text-sm text-slate-600 mt-1">
            Direct ticketing and wholesale fares on over 120+ scheduled international airlines
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {PARTNER_AIRLINES.map((airline) => (
            <div
              key={airline}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-brand-300 hover:shadow-card transition-all text-xs sm:text-sm font-semibold text-slate-800"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-700/10 text-brand-700">
                <Plane className="h-3.5 w-3.5" />
              </div>
              <span>{airline}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
