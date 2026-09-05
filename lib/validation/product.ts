import { z } from "zod";

export const priceTierSchema = z.object({
  minQty: z.coerce.number().int().positive("Min quantity must be a positive whole number"),
  price: z.coerce.number().positive("Price must be greater than 0"),
});

export const productSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().min(10).max(5000),
  priceTiers: z
    .array(priceTierSchema)
    .min(1, "Add at least one bulk price tier")
    .refine(
      (tiers) => new Set(tiers.map((t) => t.minQty)).size === tiers.length,
      "Each tier needs a distinct minimum quantity"
    ),
  regularPrice: z.coerce.number().positive(),
  unit: z.string().min(1).max(40).default("piece"),
  stock: z.coerce.number().int().min(0).default(0),
  images: z.array(z.string().url()).default([]),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(200).optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Select a category"),
});

export type PriceTierInput = z.infer<typeof priceTierSchema>;
export type ProductInput = z.infer<typeof productSchema>;
