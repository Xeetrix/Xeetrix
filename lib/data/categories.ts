import { prisma } from "@/lib/prisma";
import { mockCategories } from "@/lib/mock-data";
import type { Category } from "@/lib/types";

/**
 * Every getter here prefers the live database and transparently falls
 * back to the bundled mock catalog whenever the DB is unreachable (no
 * DATABASE_URL configured yet) or not seeded (zero rows). This keeps the
 * storefront fully functional out of the box.
 */

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    if (categories.length > 0) return categories;
  } catch {
    // fall through to mock data
  }
  return mockCategories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (category) return category;
  } catch {
    // fall through to mock data
  }
  return mockCategories.find((c) => c.slug === slug) ?? null;
}
