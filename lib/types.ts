export type Role = "ADMIN" | "IMPORTER" | "EXPORTER";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PriceTier = {
  id: string;
  minQty: number;
  price: number;
  productId: string;
  createdAt: Date;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  /** Mirrors the lowest-minQty priceTiers row — see prisma/schema.prisma. */
  wholesalePrice: number;
  regularPrice: number;
  moq: number;
  unit: string;
  stock: number;
  images: string[];
  isPublished: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string;
  importerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** Present when the query includes it; sorted by minQty ascending. */
  priceTiers?: PriceTier[];
};

export type ProductWithCategory = Product & { category: Category };

export type AppUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  company: string | null;
  phone: string | null;
  country: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SafeUser = Omit<AppUser, "password">;
