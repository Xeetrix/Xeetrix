/** Bulk/MOQ price-tier helpers shared by the API routes and admin UI. */

export function sortTiersByMinQty<T extends { minQty: number }>(tiers: T[]): T[] {
  return [...tiers].sort((a, b) => a.minQty - b.minQty);
}

/**
 * The tier with the lowest minQty — this becomes a product's
 * wholesalePrice/moq, the "starting from" price shown on cards, filters,
 * the sitemap, and JSON-LD, without needing a join for those reads.
 */
export function getBaseTier<T extends { minQty: number }>(tiers: T[]): T {
  return sortTiersByMinQty(tiers)[0];
}
