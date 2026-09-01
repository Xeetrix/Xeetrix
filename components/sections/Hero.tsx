"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SITE_TAGLINE } from "@/lib/constants";

const stats = [
  { icon: Users, label: "Verified Traders", value: "2,400+" },
  { icon: Truck, label: "Orders Fulfilled", value: "18,000+" },
  { icon: ShieldCheck, label: "Countries Served", value: "40+" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(44,143,99,0.35),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(253,122,18,0.18),transparent_40%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <Container className="relative flex flex-col items-center gap-10 py-24 text-center sm:py-32">
        <motion.span
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-200"
        >
          B2B Wholesale · Importers &amp; Exporters
        </motion.span>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-4xl font-display text-4xl font-extrabold leading-[1.08] text-white sm:text-6xl"
        >
          {SITE_TAGLINE}
          <span className="mt-3 block bg-gradient-to-r from-brand-300 to-accent-300 bg-clip-text text-transparent">
            Wholesale, without the middlemen.
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-2xl text-base leading-relaxed text-ink-300 sm:text-lg"
        >
          Xeetrix connects local entrepreneurs directly with verified importers
          and exporters — source products in bulk at factory-direct prices,
          with transparent MOQs, and trade with confidence.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white shadow-elevated transition-transform hover:-translate-y-0.5 hover:bg-brand-400"
          >
            Explore Wholesale Products
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
          >
            Become a Supplier
          </Link>
        </motion.div>

        <motion.dl
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-white/10 pt-8"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1.5">
              <stat.icon className="h-5 w-5 text-brand-300" strokeWidth={1.75} />
              <dt className="font-display text-xl font-bold text-white sm:text-2xl">
                {stat.value}
              </dt>
              <dd className="text-xs text-ink-400 sm:text-sm">{stat.label}</dd>
            </div>
          ))}
        </motion.dl>
      </Container>
    </section>
  );
}
