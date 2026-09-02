import type { Metadata } from "next";
import { LayoutGrid } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CategoryCard } from "@/components/CategoryCard";
import { getCategories } from "@/lib/data/categories";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Wholesale Categories",
  description:
    "Explore all wholesale product categories on Xeetrix — textiles, electronics, home goods, beauty, industrial equipment, and agriculture.",
  alternates: { canonical: "/categories" },
  openGraph: { title: `Wholesale Categories | ${SITE_NAME}` },
};

// Admin-created categories must show up immediately, not only after the
// next build — always render this page fresh from the database.
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-ink-950 sm:text-4xl">
          Wholesale Categories
        </h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Browse {categories.length} categories stocked by verified importers
          and exporters, ready for bulk orders.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 py-24 text-center">
          <LayoutGrid className="h-10 w-10 text-ink-300" />
          <p className="font-medium text-ink-700">No categories yet</p>
          <p className="text-sm text-ink-400">Check back soon — new categories are added regularly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </Container>
  );
}
