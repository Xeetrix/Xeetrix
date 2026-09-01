import type { Metadata } from "next";
import { PackageX } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Wholesale Products — Bulk Pricing & MOQs",
  description:
    "Browse thousands of wholesale products across textiles, electronics, home goods, beauty, industrial, and agriculture. Transparent MOQs and factory-direct pricing.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: `Wholesale Products | ${SITE_NAME}`,
    description:
      "Browse thousands of wholesale products with transparent MOQs and factory-direct pricing.",
  },
};

type SearchParams = {
  category?: string;
  min?: string;
  max?: string;
  featured?: string;
  q?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: params.category,
      minPrice: params.min ? Number(params.min) : undefined,
      maxPrice: params.max ? Number(params.max) : undefined,
      featuredOnly: params.featured === "1",
      search: params.q,
    }),
  ]);

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-950 sm:text-4xl">
          Wholesale Products
        </h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          {products.length} products available from verified importers and
          exporters, with transparent minimum order quantities.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <ProductFilters categories={categories} />

        <div className="flex-1">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 py-24 text-center">
              <PackageX className="h-10 w-10 text-ink-300" />
              <p className="font-medium text-ink-700">No products match those filters</p>
              <p className="text-sm text-ink-400">
                Try clearing filters or browsing a different category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
