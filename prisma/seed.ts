import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  console.log("Seed complete: admin user ensured.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
