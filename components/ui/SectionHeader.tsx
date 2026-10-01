import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="block text-xs font-bold uppercase tracking-widest text-[#0B5D3A] mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-slate-600">
          {description}
        </p>
      )}
    </div>
  );
}
