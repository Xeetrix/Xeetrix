import { prisma } from "@/lib/prisma";
import type { SafeUser } from "@/lib/types";

const demoUsers: SafeUser[] = [
  {
    id: "demo_admin",
    name: "Xeetrix Admin",
    email: "admin@xeetrix.com",
    role: "ADMIN",
    company: "Xeetrix",
    phone: null,
    country: null,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "demo_importer",
    name: "Demo Importer",
    email: "importer@example.com",
    role: "IMPORTER",
    company: "Global Import Co.",
    phone: null,
    country: "United Arab Emirates",
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "demo_exporter",
    name: "Demo Exporter",
    email: "exporter@example.com",
    role: "EXPORTER",
    company: "Prime Exports Ltd.",
    phone: null,
    country: "Bangladesh",
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
];

const safeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  company: true,
  phone: true,
  country: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function getUsers(): Promise<SafeUser[]> {
  try {
    const users = await prisma.user.findMany({
      select: safeSelect,
      orderBy: { createdAt: "desc" },
    });
    if (users.length > 0) return users;
  } catch {
    // fall through to demo data — no database configured yet
  }
  return demoUsers;
}

/** Only used by the login route; never exposed to the client. */
export async function getUserByEmailWithPassword(email: string) {
  return prisma.user.findUnique({ where: { email } });
}
