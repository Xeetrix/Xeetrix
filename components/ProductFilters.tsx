"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRICE_BUCKETS = [
  { label: "Any Price", min: undefined, max: undefined },
  { label: "Under ৳500", min: undefined, max: 500 },
  { label: "৳500 – ৳2,000", min: 500, max: 2000 },
  { label: "৳2,000 – ৳10,000", min: 2000, max: 10000 },
  { label: "Over ৳10,000", min: 10000, max: undefined },
];

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const activeCategory = searchParams.get("category") ?? "";
  const activeMin = searchParams.get("min");
  const activeMax = searchParams.get("max");

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const content = (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-900">
          Category
        </h3>
        <div className="mt-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => updateParams({ category: undefined })}
            className={cn(
              "rounded-lg px-3 py-2 text-left text-sm transition-colors",
              activeCategory === ""
                ? "bg-brand-50 font-semibold text-brand-700"
                : "text-ink-600 hover:bg-ink-50"
            )}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateParams({ category: category.slug })}
              className={cn(
                "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                activeCategory === category.slug
                  ? "bg-brand-50 font-semibold text-brand-700"
                  : "text-ink-600 hover:bg-ink-50"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-900">
          Wholesale Price
        </h3>
        <div className="mt-3 flex flex-col gap-1.5">
          {PRICE_BUCKETS.map((bucket) => {
            const active =
              (bucket.min?.toString() ?? "") === (activeMin ?? "") &&
              (bucket.max?.toString() ?? "") === (activeMax ?? "");
            return (
              <button
                key={bucket.label}
                type="button"
                onClick={() =>
                  updateParams({
                    min: bucket.min?.toString(),
                    max: bucket.max?.toString(),
                  })
                }
                className={cn(
                  "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "text-ink-600 hover:bg-ink-50"
                )}
              >
                {bucket.label}
              </button>
            );
          })}
        </div>
      </div>

      {(activeCategory || activeMin || activeMax) && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent-600 hover:text-accent-700"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      <aside
        className={cn(
          "hidden w-full flex-shrink-0 lg:block lg:w-64",
          isPending && "opacity-60"
        )}
      >
        {content}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-elevated">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Filters</h2>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-ink-500" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
