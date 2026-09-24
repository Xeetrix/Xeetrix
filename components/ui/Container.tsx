import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "default" | "wide" | "narrow" | "full";
}

export function Container({
  className,
  size = "default",
  ...props
}: ContainerProps) {
  const sizeClasses = {
    narrow: "max-w-4xl px-4 sm:px-6",
    default: "max-w-7xl px-4 sm:px-6 lg:px-8",
    wide: "max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12",
    full: "max-w-full px-4 sm:px-6 lg:px-8",
  };

  return (
    <div
      className={cn("mx-auto w-full", sizeClasses[size], className)}
      {...props}
    />
  );
}
