import { prisma } from "@/lib/prisma";
import { getMockProductsWithCategory } from "@/lib/mock-data";
import type { ProductWithCategory } from "@/lib/types";

export type ProductFilters = {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  search?: string;
};

function applyMockFilters(
  products: ProductWithCategory[],
  filters: ProductFilters
): ProductWithCategory[] {
  return products.filter((p) => {
    if (!p.isPublished) return false;
    if (filters.categorySlug && p.category.slug !== filters.categorySlug) return false;
    if (filters.minPrice !== undefined && p.wholesalePrice < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && p.wholesalePrice > filters.maxPrice) return false;
    if (filters.featuredOnly && !p.isFeatured) return false;
    if (
      filters.search &&
      !p.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });
}

export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductWithCategory[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        ...(filters.categorySlug
          ? { category: { slug: filters.categorySlug } }
          : {}),
        ...(filters.featuredOnly ? { isFeatured: true } : {}),
        ...(filters.search
          ? { title: { contains: filters.search, mode: "insensitive" } }
          : {}),
        ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
          ? {
              wholesalePrice: {
                ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
                ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
              },
            }
          : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.product.count();
    if (total > 0) return products;
  } catch {
    // fall through to mock data
  }
  return applyMockFilters(getMockProductsWithCategory(), filters);
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithCategory[]> {
  const products = await getProducts({ featuredOnly: true });
  return products.slice(0, limit);
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithCategory | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (product) return product;
  } catch {
    // fall through to mock data
  }
  return getMockProductsWithCategory().find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(
  product: ProductWithCategory,
  limit = 4
): Promise<ProductWithCategory[]> {
  const all = await getProducts({ categorySlug: product.category.slug });
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const products = await prisma.product.findMany({ select: { slug: true } });
    if (products.length > 0) return products.map((p) => p.slug);
  } catch {
    // fall through to mock data
  }
  return getMockProductsWithCategory().map((p) => p.slug);
}
