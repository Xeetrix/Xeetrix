import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { formatCurrency } from "@/lib/constants";
import type { ProductWithCategory } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const discount = Math.max(
    0,
    Math.round(
      ((product.regularPrice - product.wholesalePrice) / product.regularPrice) * 100
    )
  );

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <Package className="h-12 w-12" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-white shadow-card">
            -{discount}%
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-700 backdrop-blur">
          MOQ {product.moq.toLocaleString()}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {product.category.name}
        </span>
        <h3 className="line-clamp-2 font-display text-base font-semibold text-ink-900">
          {product.title}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="font-display text-lg font-bold text-ink-950">
              {formatCurrency(product.wholesalePrice)}
              <span className="ml-1 text-xs font-normal text-ink-400">/{product.unit}</span>
            </p>
            {discount > 0 && (
              <p className="text-xs text-ink-400 line-through">
                {formatCurrency(product.regularPrice)}
              </p>
            )}
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {product.stock > 0 ? "In Stock" : "Pre-order"}
          </span>
        </div>
      </div>
    </Link>
  );
}
