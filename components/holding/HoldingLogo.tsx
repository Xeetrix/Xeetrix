"use client";

import React, { useState } from "react";
import { BrandGlobeIcon } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

interface HoldingLogoProps {
  inverted?: boolean;
  className?: string;
}

export function HoldingLogo({ inverted = false, className }: HoldingLogoProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <span className={cn("inline-flex items-center gap-2.5 whitespace-nowrap shrink-0", className)}>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden shrink-0",
          inverted ? "bg-white/10 border border-white/20 text-white" : "bg-[#0B5336] text-white"
        )}
      >
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logo.png"
            alt="Xeetrix emblem"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <BrandGlobeIcon className="h-5 w-5" color="currentColor" strokeWidth={28} />
        )}
      </span>
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight whitespace-nowrap shrink-0",
          inverted ? "text-white" : "text-slate-900"
        )}
      >
        Xeetrix
      </span>
    </span>
  );
}
