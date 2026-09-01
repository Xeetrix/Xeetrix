import type { Category, Product } from "./types";

const now = new Date("2026-01-01T00:00:00.000Z");

export const mockCategories: Category[] = [
  {
    id: "cat_textiles",
    name: "Textiles & Garments",
    slug: "textiles-garments",
    description:
      "Bulk apparel, fabrics, and finished garments sourced from vetted manufacturers for importers and retailers.",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200&auto=format&fit=crop",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat_electronics",
    name: "Electronics & Gadgets",
    slug: "electronics-gadgets",
    description:
      "Consumer electronics, accessories, and smart devices available in wholesale quantities with factory pricing.",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat_home",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description:
      "Durable home goods, kitchenware, and household essentials for distributors and retail chains.",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat_beauty",
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description:
      "Cosmetics, skincare, and personal care products manufactured to export-grade compliance standards.",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat_industrial",
    name: "Industrial & Machinery",
    slug: "industrial-machinery",
    description:
      "Machine parts, tools, and industrial equipment sourced directly from certified exporters.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat_agriculture",
    name: "Agriculture & Food",
    slug: "agriculture-food",
    description:
      "Bulk agricultural commodities, packaged foods, and raw ingredients for global trade.",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1200&auto=format&fit=crop",
    createdAt: now,
    updatedAt: now,
  },
];

export const mockProducts: Product[] = [
  {
    id: "prod_cotton_tshirt",
    title: "Premium Cotton Crew-Neck T-Shirts (Bulk Pack)",
    slug: "premium-cotton-crew-neck-tshirts-bulk",
    description:
      "180 GSM combed cotton crew-neck t-shirts, pre-shrunk and colorfast, available in 8 core colors and sizes S–XXL. Custom private-label tagging and packaging available for orders above 2,000 units. Sourced from an OEKO-TEX certified facility with consistent lead times of 15–20 days.",
    wholesalePrice: 2.4,
    regularPrice: 6.99,
    moq: 500,
    unit: "piece",
    stock: 48000,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: true,
    seoTitle: "Bulk Cotton T-Shirts Wholesale | MOQ 500 pcs",
    seoDescription:
      "Buy premium 180GSM cotton crew-neck t-shirts wholesale from Xeetrix. Factory-direct pricing, MOQ 500 pcs, custom private label available.",
    categoryId: "cat_textiles",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_denim_jacket",
    title: "Unisex Washed Denim Jackets",
    slug: "unisex-washed-denim-jackets",
    description:
      "14oz washed denim jackets with reinforced stitching, brass hardware, and a classic unisex cut. Available in light, mid, and dark wash. Ideal for streetwear and workwear retail lines.",
    wholesalePrice: 11.5,
    regularPrice: 34.99,
    moq: 200,
    unit: "piece",
    stock: 6200,
    images: [
      "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: false,
    seoTitle: "Wholesale Washed Denim Jackets | MOQ 200 pcs",
    seoDescription:
      "Source unisex 14oz washed denim jackets wholesale. Multiple washes, MOQ 200 pcs, export-ready packaging — Xeetrix B2B trade platform.",
    categoryId: "cat_textiles",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_earbuds",
    title: "TWS Bluetooth 5.3 Wireless Earbuds",
    slug: "tws-bluetooth-5-3-wireless-earbuds",
    description:
      "True wireless stereo earbuds with Bluetooth 5.3, active noise cancellation, IPX5 water resistance, and a 32-hour charging case. CE, FCC, and RoHS certified. Custom branding and packaging available.",
    wholesalePrice: 6.8,
    regularPrice: 24.99,
    moq: 300,
    unit: "piece",
    stock: 15400,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590658006821-08e8cbf9c04f?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: true,
    seoTitle: "Wholesale TWS Bluetooth 5.3 Earbuds | MOQ 300 pcs",
    seoDescription:
      "Buy CE/FCC/RoHS certified TWS Bluetooth 5.3 earbuds wholesale. ANC, IPX5, 32h case, MOQ 300 pcs, custom branding — Xeetrix.",
    categoryId: "cat_electronics",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_powerbank",
    title: "20000mAh Fast-Charge Power Banks",
    slug: "20000mah-fast-charge-power-banks",
    description:
      "High-capacity 20000mAh power banks with 22.5W PD/QC fast charging, dual USB-A and USB-C ports, and an LED display. Passed UN38.3 transport testing for safe bulk shipping.",
    wholesalePrice: 5.2,
    regularPrice: 19.99,
    moq: 500,
    unit: "piece",
    stock: 22000,
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: false,
    seoTitle: "Wholesale 20000mAh Power Banks | MOQ 500 pcs",
    seoDescription:
      "Source 20000mAh 22.5W fast-charge power banks wholesale, UN38.3 tested for safe export. MOQ 500 pcs — Xeetrix B2B platform.",
    categoryId: "cat_electronics",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_cookware",
    title: "Non-Stick Ceramic Cookware Set (10-Piece)",
    slug: "non-stick-ceramic-cookware-set-10-piece",
    description:
      "PFOA-free ceramic non-stick cookware set including pots, pans, and lids with heat-resistant handles. Compatible with induction, gas, and electric stovetops. Retail-ready gift box packaging included.",
    wholesalePrice: 14.9,
    regularPrice: 49.99,
    moq: 150,
    unit: "set",
    stock: 4300,
    images: [
      "https://images.unsplash.com/photo-1584990347449-a2d6d7b7e2a2?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: true,
    seoTitle: "Wholesale Ceramic Cookware Sets | MOQ 150 sets",
    seoDescription:
      "Buy PFOA-free ceramic non-stick cookware sets wholesale. Induction-ready, retail packaging, MOQ 150 sets — Xeetrix B2B trade platform.",
    categoryId: "cat_home",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_bedsheets",
    title: "Egyptian Cotton Bedsheet Sets (Queen & King)",
    slug: "egyptian-cotton-bedsheet-sets",
    description:
      "400 thread-count Egyptian cotton bedsheet sets with fitted sheet, flat sheet, and pillowcases. OEKO-TEX certified dyes. Available in 12 colorways for hospitality and retail buyers.",
    wholesalePrice: 9.4,
    regularPrice: 29.99,
    moq: 250,
    unit: "set",
    stock: 8800,
    images: [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: false,
    seoTitle: "Wholesale Egyptian Cotton Bedsheets | MOQ 250 sets",
    seoDescription:
      "Source 400TC Egyptian cotton bedsheet sets wholesale, OEKO-TEX certified. 12 colorways, MOQ 250 sets — Xeetrix.",
    categoryId: "cat_home",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_serum",
    title: "Vitamin C Brightening Serum (Private Label Ready)",
    slug: "vitamin-c-brightening-serum-private-label",
    description:
      "20% Vitamin C brightening serum with hyaluronic acid, formulated in a GMP-certified facility. Available for private-label bottling with custom cartons at MOQ 1,000 units.",
    wholesalePrice: 1.9,
    regularPrice: 12.99,
    moq: 1000,
    unit: "piece",
    stock: 32000,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: true,
    seoTitle: "Wholesale Vitamin C Serum, Private Label | MOQ 1000",
    seoDescription:
      "Buy GMP-certified 20% Vitamin C brightening serum wholesale with private-label bottling. MOQ 1,000 units — Xeetrix B2B platform.",
    categoryId: "cat_beauty",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_lipstick",
    title: "Matte Liquid Lipstick Collection (24-Shade Set)",
    slug: "matte-liquid-lipstick-24-shade-set",
    description:
      "Long-wear matte liquid lipsticks in 24 curated shades, cruelty-free and paraben-free. Comes with retail counter display for boutique and pharmacy buyers.",
    wholesalePrice: 0.85,
    regularPrice: 5.99,
    moq: 2000,
    unit: "piece",
    stock: 60000,
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: false,
    seoTitle: "Wholesale Matte Liquid Lipstick, 24 Shades | MOQ 2000",
    seoDescription:
      "Source cruelty-free matte liquid lipsticks wholesale, 24-shade collection with counter display. MOQ 2,000 pcs — Xeetrix.",
    categoryId: "cat_beauty",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_drillset",
    title: "Cordless Impact Drill Sets (20V, Brushless)",
    slug: "cordless-impact-drill-sets-20v-brushless",
    description:
      "20V brushless cordless impact drills with 2 lithium batteries, fast charger, and a 45-piece accessory kit. CE and ISO 9001 certified manufacturing. Bulk carton packaging for freight-efficient shipping.",
    wholesalePrice: 22.0,
    regularPrice: 79.99,
    moq: 100,
    unit: "set",
    stock: 3100,
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: true,
    seoTitle: "Wholesale 20V Brushless Impact Drill Sets | MOQ 100",
    seoDescription:
      "Buy CE/ISO 9001 certified 20V brushless cordless impact drill sets wholesale. MOQ 100 sets — Xeetrix B2B trade platform.",
    categoryId: "cat_industrial",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_bearings",
    title: "Precision Steel Ball Bearings (Industrial Grade)",
    slug: "precision-steel-ball-bearings-industrial",
    description:
      "Chrome steel deep-groove ball bearings rated for high-load industrial applications. ABEC-5 precision class, available in 15 standard sizes for OEM and MRO buyers.",
    wholesalePrice: 0.32,
    regularPrice: 1.4,
    moq: 5000,
    unit: "piece",
    stock: 240000,
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22731c8b02?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: false,
    seoTitle: "Wholesale Industrial Steel Ball Bearings | MOQ 5000",
    seoDescription:
      "Source ABEC-5 chrome steel ball bearings wholesale for OEM and MRO. 15 standard sizes, MOQ 5,000 pcs — Xeetrix.",
    categoryId: "cat_industrial",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_ricebulk",
    title: "Premium Long-Grain White Rice (Bulk Export Grade)",
    slug: "premium-long-grain-white-rice-bulk",
    description:
      "5% broken long-grain white rice, sun-dried and machine-sorted for export. Packed in 25kg/50kg PP bags or bulk container loads. Phytosanitary certification provided for all shipments.",
    wholesalePrice: 480,
    regularPrice: 620,
    moq: 20,
    unit: "metric ton",
    stock: 1200,
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: true,
    seoTitle: "Wholesale Long-Grain White Rice Export | MOQ 20 MT",
    seoDescription:
      "Buy export-grade 5% broken long-grain white rice in bulk. Phytosanitary certified, MOQ 20 metric tons — Xeetrix B2B trade platform.",
    categoryId: "cat_agriculture",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "prod_cashews",
    title: "Raw Cashew Nuts (W320, Export Grade)",
    slug: "raw-cashew-nuts-w320-export-grade",
    description:
      "W320 grade raw cashew kernels, vacuum-packed in food-grade cartons with nitrogen flushing to preserve freshness during long-haul export. HACCP and ISO 22000 certified facility.",
    wholesalePrice: 6.1,
    regularPrice: 9.8,
    moq: 500,
    unit: "kg",
    stock: 42000,
    images: [
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=1200&auto=format&fit=crop",
    ],
    isPublished: true,
    isFeatured: false,
    seoTitle: "Wholesale Raw Cashew Nuts W320 | MOQ 500 kg",
    seoDescription:
      "Source HACCP-certified W320 grade raw cashew kernels wholesale, vacuum-packed for export. MOQ 500 kg — Xeetrix.",
    categoryId: "cat_agriculture",
    importerId: null,
    createdAt: now,
    updatedAt: now,
  },
];

export function getMockProductsWithCategory() {
  return mockProducts.map((product) => ({
    ...product,
    category: mockCategories.find((c) => c.id === product.categoryId)!,
  }));
}
