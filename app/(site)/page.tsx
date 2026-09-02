import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CTASection } from "@/components/sections/CTASection";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/FadeIn";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { getCategories } from "@/lib/data/categories";
import { getFeaturedProducts, getProducts } from "@/lib/data/products";

export default async function HomePage() {
  const [categories, featuredProducts, latestProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getProducts(),
  ]);

  const hotProducts = (featuredProducts.length > 0 ? featuredProducts : latestProducts).slice(
    0,
    8
  );

  return (
    <>
      <Hero />

      {categories.length > 0 && (
        <section className="py-20 sm:py-24">
          <Container>
            <FadeIn className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeader
                eyebrow="Browse by Category"
                title="Featured wholesale categories"
                description="Every category is stocked by vetted importers and exporters ready to fulfill bulk orders."
              />
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View all categories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeIn>

            <Stagger className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 6).map((category) => (
                <StaggerItem key={category.id}>
                  <CategoryCard category={category} />
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </section>
      )}

      {hotProducts.length > 0 && (
        <section className="bg-ink-50/60 py-20 sm:py-24">
          <Container>
            <FadeIn className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeader
                eyebrow="Trending This Week"
                title="Hot wholesale products"
                description="High-demand, high-margin products with transparent MOQs and factory-direct pricing."
              />
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View all products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeIn>

            <Stagger className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {hotProducts.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </section>
      )}

      <HowItWorks />
      <CTASection />
    </>
  );
}
