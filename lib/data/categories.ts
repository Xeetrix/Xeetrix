import { prisma } from "@/lib/prisma";
import { mockCategories } from "@/lib/mock-data";
import type { Category } from "@/lib/types";

/**
 * Every getter here prefers the live database and falls back to the
 * bundled mock catalog ONLY when the database is unreachable (query
 * throws — no DATABASE_URL configured, connection refused, missing
 * table, etc.). Once the database answers successfully, its result is
 * authoritative even if empty.
 */

export async function getCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    return mockCategories;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    return await prisma.category.findUnique({ where: { slug } });
  } catch {
    return mockCategories.find((c) => c.slug === slug) ?? null;
  }
}
