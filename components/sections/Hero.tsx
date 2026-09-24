"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Phone, CheckCircle2, Luggage, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FlightSearchBox } from "@/components/FlightSearchBox";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, TRUST_STATS } from "@/lib/constants";
import { useAiConcierge } from "@/lib/ai-concierge-context";

export function Hero({ onRequestQuote }: { onRequestQuote?: () => void }) {
  const { openConcierge } = useAiConcierge();

  return (
    <section className="relative overflow-hidden bg-slate-950 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24 border-b border-slate-900">
      {/* Aviation background accents & emerald glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-15%,rgba(11,93,58,0.4),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <Container size="wide" className="relative z-10">
        {/* Hero Headline Section */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-950/70 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-4 shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Authorized Global Air Ticketing &amp; Travel Agency</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-black tracking-tight text-white leading-[1.15] max-w-3xl"
          >
            Seamless Air Ticket Booking &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-100 to-amber-300">
              Global Travel Solutions
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3.5 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl leading-relaxed"
          >
            Best fares for domestic &amp; international flights across 120+ airlines.
            Special migrant worker (40–46kg) &amp; student luggage net-fares with 24/7 ticketing support.
          </motion.p>

          {/* Quick Value Assurances & AI Concierge Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm text-slate-300"
          >
            <button
              type="button"
              onClick={() => openConcierge()}
              className="inline-flex items-center gap-2 font-bold text-white bg-[#0B5D3A] hover:bg-[#094d30] border border-emerald-400/40 px-4 py-1.5 rounded-full transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>AI ফ্লাইট সহকারী</span>
            </button>

            <span className="hidden sm:inline text-slate-700 font-bold">•</span>

            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Direct GDS Net-Fares
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Luggage className="h-4 w-4 text-amber-400" />
              Up to 46kg Luggage
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-1.5 rounded-full shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              IATA Verified Agency
            </span>
          </motion.div>
        </div>

        {/* Flight Search Box Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <FlightSearchBox />
        </motion.div>

        {/* Trust Metric Stats Row */}
        <div className="mt-10 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 max-w-4xl mx-auto">
          {TRUST_STATS.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-2xs"
            >
              <div className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-slate-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
