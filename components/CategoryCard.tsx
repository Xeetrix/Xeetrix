import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import type { Category } from "@/lib/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex h-56 items-end overflow-hidden rounded-2xl border border-ink-100 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
    >
      {category.image ? (
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-ink-100 text-ink-300">
          <LayoutGrid className="h-10 w-10" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />
      <div className="relative flex w-full items-center justify-between gap-2 p-5">
        <h3 className="font-display text-lg font-semibold text-white">
          {category.name}
        </h3>
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
