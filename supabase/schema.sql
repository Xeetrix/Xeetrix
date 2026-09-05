-- Xeetrix — Supabase / PostgreSQL schema
-- Paste this entire file into the Supabase SQL Editor and run it once
-- against a fresh database. It matches prisma/schema.prisma field-for-field
-- (including exact camelCase column names, which Prisma Client requires).
--
-- Sections:
--   1) Extension needed for gen_random_uuid()
--   2) Role enum
--   3) users / categories / products tables
--   4) Indexes + foreign keys, price_tiers table
--   5) Default admin user
--   6-7) OPTIONAL demo catalog (safe to skip/delete if you'll add your own)
--   8) OPTIONAL price tiers for the demo catalog

-- 1) Needed for gen_random_uuid() as a column default (native in PG14+,
--    this makes it work on older Postgres too — harmless either way).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Role enum
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'IMPORTER', 'EXPORTER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3a) users
CREATE TABLE IF NOT EXISTS "users" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"      TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "password"  TEXT NOT NULL,
  "role"      "Role" NOT NULL DEFAULT 'IMPORTER',
  "company"   TEXT,
  "phone"     TEXT,
  "country"   TEXT,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- 3b) categories
CREATE TABLE IF NOT EXISTS "categories" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "description" TEXT,
  "image"       TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug");

-- 3c) products
CREATE TABLE IF NOT EXISTS "products" (
  "id"             TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "title"          TEXT NOT NULL,
  "slug"           TEXT NOT NULL,
  "description"    TEXT NOT NULL,
  "wholesalePrice" DOUBLE PRECISION NOT NULL,
  "regularPrice"   DOUBLE PRECISION NOT NULL,
  "moq"            INTEGER NOT NULL DEFAULT 1,
  "unit"           TEXT NOT NULL DEFAULT 'piece',
  "stock"          INTEGER NOT NULL DEFAULT 0,
  "images"         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "isPublished"    BOOLEAN NOT NULL DEFAULT true,
  "isFeatured"     BOOLEAN NOT NULL DEFAULT false,
  "seoTitle"       TEXT,
  "seoDescription" TEXT,
  "categoryId"     TEXT NOT NULL,
  "importerId"     TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_key" ON "products"("slug");
CREATE INDEX IF NOT EXISTS "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX IF NOT EXISTS "products_importerId_idx" ON "products"("importerId");

-- 4) Foreign keys (run once — will error if they already exist, that's fine)
ALTER TABLE "products"
  ADD CONSTRAINT "products_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "products"
  ADD CONSTRAINT "products_importerId_fkey"
  FOREIGN KEY ("importerId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 4b) price_tiers — bulk/MOQ pricing rows per product, e.g.
--     "100 units @ ৳165", "200 units @ ৳160", "500 units @ ৳150".
--     products."wholesalePrice"/"moq" mirror the lowest-minQty tier so
--     list pages can show a single "from" price without a join; the app
--     keeps both in sync on every product create/update.
CREATE TABLE IF NOT EXISTS "price_tiers" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "minQty"    INTEGER NOT NULL,
  "price"     DOUBLE PRECISION NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "price_tiers_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "price_tiers_productId_idx" ON "price_tiers"("productId");

ALTER TABLE "price_tiers"
  ADD CONSTRAINT "price_tiers_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 5) Default admin user
-- Email:    work.xeetrix@gmail.com
-- Password: xeetrixadmin123   (stored bcrypt-hashed, cost factor 10 —
--           matches the app's bcryptjs login check in app/api/auth/login)
INSERT INTO "users" ("id", "name", "email", "password", "role", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Xeetrix Admin',
  'work.xeetrix@gmail.com',
  '$2a$10$7Mj6Ra3d.iamHX8yNXQ3lexpFONBCAV59u4.3UAbgtA.IN0Ge7FyG',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- 6) Seed categories (optional demo catalog)
INSERT INTO "categories" ("id", "name", "slug", "description", "image", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Textiles & Garments', 'textiles-garments', 'Bulk apparel, fabrics, and finished garments sourced from vetted manufacturers for importers and retailers.', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Electronics & Gadgets', 'electronics-gadgets', 'Consumer electronics, accessories, and smart devices available in wholesale quantities with factory pricing.', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Home & Kitchen', 'home-kitchen', 'Durable home goods, kitchenware, and household essentials for distributors and retail chains.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Beauty & Personal Care', 'beauty-personal-care', 'Cosmetics, skincare, and personal care products manufactured to export-grade compliance standards.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Industrial & Machinery', 'industrial-machinery', 'Machine parts, tools, and industrial equipment sourced directly from certified exporters.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Agriculture & Food', 'agriculture-food', 'Bulk agricultural commodities, packaged foods, and raw ingredients for global trade.', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1200&auto=format&fit=crop', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- 7) Seed products (category looked up by slug, since ids are generated above)
INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Premium Cotton Crew-Neck T-Shirts (Bulk Pack)',
  'premium-cotton-crew-neck-tshirts-bulk',
  '180 GSM combed cotton crew-neck t-shirts, pre-shrunk and colorfast, available in 8 core colors and sizes S–XXL. Custom private-label tagging and packaging available for orders above 2,000 units. Sourced from an OEKO-TEX certified facility with consistent lead times of 15–20 days.',
  2.4,
  6.99,
  500,
  'piece',
  48000,
  ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  true,
  'Bulk Cotton T-Shirts Wholesale | MOQ 500 pcs',
  'Buy premium 180GSM cotton crew-neck t-shirts wholesale from Xeetrix. Factory-direct pricing, MOQ 500 pcs, custom private label available.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'textiles-garments'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Unisex Washed Denim Jackets',
  'unisex-washed-denim-jackets',
  '14oz washed denim jackets with reinforced stitching, brass hardware, and a classic unisex cut. Available in light, mid, and dark wash. Ideal for streetwear and workwear retail lines.',
  11.5,
  34.99,
  200,
  'piece',
  6200,
  ARRAY['https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  false,
  'Wholesale Washed Denim Jackets | MOQ 200 pcs',
  'Source unisex 14oz washed denim jackets wholesale. Multiple washes, MOQ 200 pcs, export-ready packaging — Xeetrix B2B trade platform.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'textiles-garments'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'TWS Bluetooth 5.3 Wireless Earbuds',
  'tws-bluetooth-5-3-wireless-earbuds',
  'True wireless stereo earbuds with Bluetooth 5.3, active noise cancellation, IPX5 water resistance, and a 32-hour charging case. CE, FCC, and RoHS certified. Custom branding and packaging available.',
  6.8,
  24.99,
  300,
  'piece',
  15400,
  ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1590658006821-08e8cbf9c04f?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  true,
  'Wholesale TWS Bluetooth 5.3 Earbuds | MOQ 300 pcs',
  'Buy CE/FCC/RoHS certified TWS Bluetooth 5.3 earbuds wholesale. ANC, IPX5, 32h case, MOQ 300 pcs, custom branding — Xeetrix.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'electronics-gadgets'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  '20000mAh Fast-Charge Power Banks',
  '20000mah-fast-charge-power-banks',
  'High-capacity 20000mAh power banks with 22.5W PD/QC fast charging, dual USB-A and USB-C ports, and an LED display. Passed UN38.3 transport testing for safe bulk shipping.',
  5.2,
  19.99,
  500,
  'piece',
  22000,
  ARRAY['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  false,
  'Wholesale 20000mAh Power Banks | MOQ 500 pcs',
  'Source 20000mAh 22.5W fast-charge power banks wholesale, UN38.3 tested for safe export. MOQ 500 pcs — Xeetrix B2B platform.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'electronics-gadgets'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Non-Stick Ceramic Cookware Set (10-Piece)',
  'non-stick-ceramic-cookware-set-10-piece',
  'PFOA-free ceramic non-stick cookware set including pots, pans, and lids with heat-resistant handles. Compatible with induction, gas, and electric stovetops. Retail-ready gift box packaging included.',
  14.9,
  49.99,
  150,
  'set',
  4300,
  ARRAY['https://images.unsplash.com/photo-1584990347449-a2d6d7b7e2a2?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  true,
  'Wholesale Ceramic Cookware Sets | MOQ 150 sets',
  'Buy PFOA-free ceramic non-stick cookware sets wholesale. Induction-ready, retail packaging, MOQ 150 sets — Xeetrix B2B trade platform.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'home-kitchen'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Egyptian Cotton Bedsheet Sets (Queen & King)',
  'egyptian-cotton-bedsheet-sets',
  '400 thread-count Egyptian cotton bedsheet sets with fitted sheet, flat sheet, and pillowcases. OEKO-TEX certified dyes. Available in 12 colorways for hospitality and retail buyers.',
  9.4,
  29.99,
  250,
  'set',
  8800,
  ARRAY['https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  false,
  'Wholesale Egyptian Cotton Bedsheets | MOQ 250 sets',
  'Source 400TC Egyptian cotton bedsheet sets wholesale, OEKO-TEX certified. 12 colorways, MOQ 250 sets — Xeetrix.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'home-kitchen'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Vitamin C Brightening Serum (Private Label Ready)',
  'vitamin-c-brightening-serum-private-label',
  '20% Vitamin C brightening serum with hyaluronic acid, formulated in a GMP-certified facility. Available for private-label bottling with custom cartons at MOQ 1,000 units.',
  1.9,
  12.99,
  1000,
  'piece',
  32000,
  ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  true,
  'Wholesale Vitamin C Serum, Private Label | MOQ 1000',
  'Buy GMP-certified 20% Vitamin C brightening serum wholesale with private-label bottling. MOQ 1,000 units — Xeetrix B2B platform.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'beauty-personal-care'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Matte Liquid Lipstick Collection (24-Shade Set)',
  'matte-liquid-lipstick-24-shade-set',
  'Long-wear matte liquid lipsticks in 24 curated shades, cruelty-free and paraben-free. Comes with retail counter display for boutique and pharmacy buyers.',
  0.85,
  5.99,
  2000,
  'piece',
  60000,
  ARRAY['https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  false,
  'Wholesale Matte Liquid Lipstick, 24 Shades | MOQ 2000',
  'Source cruelty-free matte liquid lipsticks wholesale, 24-shade collection with counter display. MOQ 2,000 pcs — Xeetrix.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'beauty-personal-care'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Cordless Impact Drill Sets (20V, Brushless)',
  'cordless-impact-drill-sets-20v-brushless',
  '20V brushless cordless impact drills with 2 lithium batteries, fast charger, and a 45-piece accessory kit. CE and ISO 9001 certified manufacturing. Bulk carton packaging for freight-efficient shipping.',
  22,
  79.99,
  100,
  'set',
  3100,
  ARRAY['https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  true,
  'Wholesale 20V Brushless Impact Drill Sets | MOQ 100',
  'Buy CE/ISO 9001 certified 20V brushless cordless impact drill sets wholesale. MOQ 100 sets — Xeetrix B2B trade platform.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'industrial-machinery'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Precision Steel Ball Bearings (Industrial Grade)',
  'precision-steel-ball-bearings-industrial',
  'Chrome steel deep-groove ball bearings rated for high-load industrial applications. ABEC-5 precision class, available in 15 standard sizes for OEM and MRO buyers.',
  0.32,
  1.4,
  5000,
  'piece',
  240000,
  ARRAY['https://images.unsplash.com/photo-1581092160607-ee22731c8b02?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  false,
  'Wholesale Industrial Steel Ball Bearings | MOQ 5000',
  'Source ABEC-5 chrome steel ball bearings wholesale for OEM and MRO. 15 standard sizes, MOQ 5,000 pcs — Xeetrix.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'industrial-machinery'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Premium Long-Grain White Rice (Bulk Export Grade)',
  'premium-long-grain-white-rice-bulk',
  '5% broken long-grain white rice, sun-dried and machine-sorted for export. Packed in 25kg/50kg PP bags or bulk container loads. Phytosanitary certification provided for all shipments.',
  480,
  620,
  20,
  'metric ton',
  1200,
  ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  true,
  'Wholesale Long-Grain White Rice Export | MOQ 20 MT',
  'Buy export-grade 5% broken long-grain white rice in bulk. Phytosanitary certified, MOQ 20 metric tons — Xeetrix B2B trade platform.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'agriculture-food'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "products" ("id", "title", "slug", "description", "wholesalePrice", "regularPrice", "moq", "unit", "stock", "images", "isPublished", "isFeatured", "seoTitle", "seoDescription", "categoryId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Raw Cashew Nuts (W320, Export Grade)',
  'raw-cashew-nuts-w320-export-grade',
  'W320 grade raw cashew kernels, vacuum-packed in food-grade cartons with nitrogen flushing to preserve freshness during long-haul export. HACCP and ISO 22000 certified facility.',
  6.1,
  9.8,
  500,
  'kg',
  42000,
  ARRAY['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=1200&auto=format&fit=crop']::TEXT[],
  true,
  false,
  'Wholesale Raw Cashew Nuts W320 | MOQ 500 kg',
  'Source HACCP-certified W320 grade raw cashew kernels wholesale, vacuum-packed for export. MOQ 500 kg — Xeetrix.',
  (SELECT "id" FROM "categories" WHERE "slug" = 'agriculture-food'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

-- 8) Price tiers for the demo catalog (optional)
-- Every demo product above gets one tier equal to its own
-- wholesalePrice/moq, so the catalog stays valid under the new schema
-- (every product needs at least one tier). The cotton t-shirt product
-- also gets two deeper-discount tiers to demonstrate bulk/MOQ pricing.
INSERT INTO "price_tiers" ("id", "minQty", "price", "productId", "createdAt")
SELECT gen_random_uuid()::text, "moq", "wholesalePrice", "id", CURRENT_TIMESTAMP
FROM "products"
WHERE NOT EXISTS (
  SELECT 1 FROM "price_tiers" WHERE "price_tiers"."productId" = "products"."id"
);

INSERT INTO "price_tiers" ("id", "minQty", "price", "productId", "createdAt")
SELECT gen_random_uuid()::text, 1000, 2.1, "id", CURRENT_TIMESTAMP
FROM "products"
WHERE "slug" = 'premium-cotton-crew-neck-tshirts-bulk';

INSERT INTO "price_tiers" ("id", "minQty", "price", "productId", "createdAt")
SELECT gen_random_uuid()::text, 5000, 1.85, "id", CURRENT_TIMESTAMP
FROM "products"
WHERE "slug" = 'premium-cotton-crew-neck-tshirts-bulk';
