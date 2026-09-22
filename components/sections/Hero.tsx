"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Phone, CheckCircle2, Headphones, Luggage } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FlightSearchBox } from "@/components/FlightSearchBox";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, TRUST_STATS } from "@/lib/constants";

export function Hero({ onRequestQuote }: { onRequestQuote?: () => void }) {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Aviation background accents & emerald glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(11,83,54,0.45),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:40px_40px]"
      />

      <Container className="relative z-10">
        {/* Top announcement badge */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-900/60 backdrop-blur px-4 py-1.5 text-xs font-semibold text-brand-300 mb-5 shadow-sm"
          >
            <ShieldCheck className="h-4 w-4 text-brand-400" />
            <span>Authorized Global Air Ticketing & Travel Agency</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]"
          >
            Seamless Air Ticket Booking &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-200 to-gold-400">
              Global Travel Solutions
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed"
          >
            Best fares for domestic &amp; international flights, visa assistance,
            and dedicated 24/7 support. Special migrant worker &amp; student
            baggage net-fares.
          </motion.p>

          {/* Quick Helpline bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-400" />
              Direct GDS Net-Fares
            </span>
            <span className="flex items-center gap-1.5">
              <Luggage className="h-4 w-4 text-gold-400" />
              Up to 46kg Baggage Quotas
            </span>
            <a
              href={CONTACT_PHONE_TEL}
              className="flex items-center gap-1.5 font-bold text-white hover:text-gold-400 transition-colors bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full"
            >
              <Phone className="h-3.5 w-3.5 text-gold-400" />
              24/7 Helpline: {CONTACT_PHONE_DISPLAY}
            </a>
          </motion.div>
        </div>

        {/* The Flight Search Box Widget */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <FlightSearchBox />
        </motion.div>

        {/* Stats Row */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8 max-w-4xl mx-auto">
          {TRUST_STATS.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3 sm:p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm"
            >
              <div className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white">
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
