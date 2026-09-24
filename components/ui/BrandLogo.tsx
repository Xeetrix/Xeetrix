import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

interface BrandLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "badge" | "icon" | "square";
  inverted?: boolean;
  subtext?: string;
}

const SIZE_MAP = {
  xs: { icon: "h-6 w-6", badge: "rounded-md", text: "text-lg", sub: "text-[9px]" },
  sm: { icon: "h-8 w-8", badge: "rounded-lg", text: "text-xl", sub: "text-[10px]" },
  md: { icon: "h-11 w-11", badge: "rounded-xl", text: "text-2xl", sub: "text-[10px]" },
  lg: { icon: "h-14 w-14", badge: "rounded-2xl", text: "text-3xl", sub: "text-xs" },
  xl: { icon: "h-20 w-20", badge: "rounded-3xl", text: "text-4xl", sub: "text-sm" },
};

/**
 * Official Xeetrix Brand Logo
 * Based on the official green square emblem featuring the white globe line art.
 */
export function BrandGlobeIcon({
  className = "h-6 w-6",
  color = "currentColor",
  strokeWidth = 24,
}: {
  className?: string;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle
        cx="250"
        cy="250"
        r="170"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Horizontal equator line */}
      <line
        x1="80"
        y1="250"
        x2="420"
        y2="250"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Left meridian arc */}
      <path
        d="M 250 80 A 236.7 236.7 0 0 0 250 420"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right meridian arc */}
      <path
        d="M 250 80 A 236.7 236.7 0 0 1 250 420"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandLogo({
  className,
  size = "md",
  showText = true,
  variant = "badge",
  inverted = false,
  subtext = "Air Ticketing & Global Travel",
}: BrandLogoProps) {
  const currentSize = SIZE_MAP[size];

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      {variant === "badge" && (
        <div
          className={cn(
            "flex items-center justify-center bg-[#0B5D3A] text-white shadow-sm shrink-0 transition-transform group-hover:scale-105 p-1.5",
            currentSize.icon,
            currentSize.badge
          )}
        >
          <BrandGlobeIcon className="w-full h-full text-white" />
        </div>
      )}

      {variant === "square" && (
        <div
          className={cn(
            "flex items-center justify-center bg-[#0B5D3A] text-white shrink-0 p-1.5",
            currentSize.icon
          )}
        >
          <BrandGlobeIcon className="w-full h-full text-white" />
        </div>
      )}

      {variant === "icon" && (
        <BrandGlobeIcon
          className={cn(
            currentSize.icon,
            inverted ? "text-white" : "text-[#0B5D3A]"
          )}
        />
      )}

      {showText && (
        <div className="flex flex-col leading-tight min-w-0">
          <span
            className={cn(
              "font-display font-black tracking-tight truncate",
              currentSize.text,
              inverted ? "text-white" : "text-slate-950"
            )}
          >
            {SITE_NAME}
          </span>
          {subtext && (
            <span
              className={cn(
                "uppercase font-semibold tracking-wider -mt-0.5 truncate hidden sm:inline-block",
                currentSize.sub,
                inverted ? "text-brand-300" : "text-brand-700"
              )}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
