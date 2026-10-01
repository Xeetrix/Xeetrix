"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Luggage, Building2, Headphones, ArrowRight, UserCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FlightSearchBox } from "@/components/FlightSearchBox";
import { TRUST_STATS, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

export function Hero() {
  const { isAgent } = useAuth();

  return (
    <section className="relative overflow-hidden bg-[#07131e] pt-6 pb-14 sm:pt-10 sm:pb-18 lg:pt-12 lg:pb-22 border-b border-slate-800">
      {/* Aviation Grid & Celestial Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_900px_at_50%_-10%,rgba(2,132,199,0.2),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_600px_at_85%_25%,rgba(16,185,129,0.1),transparent_60%)]"
      />

      <Container size="wide" className="relative z-10">
        {/* Header Badges & Dual Channels: B2C + B2B */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-3"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Authorized Air Ticketing Platform</span>
            </span>

            <Link
              href="/agents"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-300 hover:text-white bg-sky-950/80 hover:bg-sky-900/90 px-3 py-1 rounded-full border border-sky-800/60 transition-colors"
            >
              <Building2 className="h-3.5 w-3.5 text-sky-400" />
              <span>B2B Sub-Agent Network</span>
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-display text-3xl sm:text-5xl lg:text-[3.75rem] font-black tracking-tight text-white leading-[1.1] max-w-4xl"
          >
            Flight Booking{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-emerald-200 to-amber-300">
              Made Simple
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-3 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl leading-relaxed"
          >
            Direct access to wholesale airline net-fares, 40–46kg migrant worker allowances, student concessions, and dedicated 24/7 ticketing desk support for travelers and sub-agents.
          </motion.p>

          {/* Value Assurances & B2B Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Wholesale GDS Net-Fares</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Luggage className="h-4 w-4 text-amber-400" />
              <span>46kg Worker Special Quotas</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-sky-400" />
              <span>24/7 Ticketing Desk</span>
            </span>

            <span className="hidden sm:inline text-slate-600 font-bold">•</span>

            <Link
              href="/agent/login"
              className="text-amber-300 hover:text-white font-bold hover:underline"
            >
              Agent Login
            </Link>
            <Link
              href="/agent/register"
              className="text-emerald-400 hover:text-white font-bold hover:underline"
            >
              Become an Agent
            </Link>
          </motion.div>
        </div>

        {/* Flight Search Console Box */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="max-w-5xl mx-auto"
        >
          <FlightSearchBox />
        </motion.div>

        {/* Trust Guarantees */}
        <div className="mt-10 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 max-w-4xl mx-auto">
          {TRUST_STATS.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xs shadow-xs hover:border-slate-700 transition-colors"
            >
              <div className="font-display text-xl sm:text-2xl font-black text-white">
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
