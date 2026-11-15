"use client";

import React from "react";
import { useMartI18n } from "./MartI18nProvider";

interface MartLogoProps {
  inverted?: boolean;
  className?: string;
}

/**
 * Standalone custom Shopping Bag/Cart SVG emblem + bilingual Xeetrix Mart wordmark.
 * Completely independent from any parent or affiliate branding.
 */
export function MartLogo({ inverted = false, className = "" }: MartLogoProps) {
  const { t } = useMartI18n();

  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 overflow-hidden ${
          inverted
            ? "bg-white/10 border border-white/20 p-1"
            : "bg-[#0B5336] p-0.5"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/aistudio/mart-emblem.png"
          alt="Xeetrix Mart"
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain"
        />
      </span>
      <span className="inline-flex items-baseline gap-1 whitespace-nowrap shrink-0">
        <span
          className={`font-display text-xl font-bold tracking-tight ${
            inverted ? "text-white" : "text-slate-900"
          }`}
        >
          {t.common.brandPrimary}
        </span>
        <span
          className={`font-display text-xl font-bold tracking-tight ${
            inverted ? "text-gold-400" : "text-[#0B5336]"
          }`}
        >
          {t.common.brandAccent}
        </span>
      </span>
    </span>
  );
}
