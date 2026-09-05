import { prisma } from "@/lib/prisma";
import type { ProductWithCategory } from "@/lib/types";

export type ProductFilters = {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  search?: string;
};

/**
 * Every getter here reads straight from the database. If the database is
 * unreachable or a query fails, the error is logged and an empty result
 * is returned so pages can render an empty state instead of crashing.
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductWithCategory[]> {
  try {
    return await prisma.product.findMany({
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
  } catch (error) {
    console.error("getProducts failed:", error);
    return [];
  }
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithCategory[]> {
  const products = await getProducts({ featuredOnly: true });
  return products.slice(0, limit);
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithCategory | null> {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: { category: true, priceTiers: { orderBy: { minQty: "asc" } } },
    });
  } catch (error) {
    console.error("getProductBySlug failed:", error);
    return null;
  }
}

export async function getRelatedProducts(
  product: ProductWithCategory,
  limit = 4
): Promise<ProductWithCategory[]> {
  const all = await getProducts({ categorySlug: product.category.slug });
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}
