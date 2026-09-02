import { prisma } from "@/lib/prisma";
import type { Category } from "@/lib/types";

/**
 * Every getter here reads straight from the database. If the database is
 * unreachable or a query fails, the error is logged and an empty result
 * is returned so pages can render an empty state instead of crashing.
 */

export async function getCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("getCategories failed:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    return await prisma.category.findUnique({ where: { slug } });
  } catch (error) {
    console.error("getCategoryBySlug failed:", error);
    return null;
  }
}
