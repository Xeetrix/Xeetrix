import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { mockCategories, mockProducts } from "../lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "work.xeetrix@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "xeetrixadmin123";
  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Xeetrix Admin",
      email: adminEmail,
      password: hashed,
      role: "ADMIN",
      isActive: true,
    },
  });

  for (const category of mockCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        image: category.image,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
      },
    });
  }

  for (const product of mockProducts) {
    const category = await prisma.category.findUnique({
      where: { slug: mockCategories.find((c) => c.id === product.categoryId)!.slug },
    });
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        wholesalePrice: product.wholesalePrice,
        regularPrice: product.regularPrice,
        moq: product.moq,
        unit: product.unit,
        stock: product.stock,
        images: product.images,
        isPublished: product.isPublished,
        isFeatured: product.isFeatured,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        categoryId: category.id,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
