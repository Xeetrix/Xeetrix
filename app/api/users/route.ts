import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/require-admin";
import { userCreateSchema } from "@/lib/validation/user";

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

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const users = await prisma.user.findMany({
      select: safeSelect,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL to manage users." },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid user data" },
      { status: 400 }
    );
  }

  try {
    const hashed = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashed,
        role: parsed.data.role,
        company: parsed.data.company || null,
        phone: parsed.data.phone || null,
        country: parsed.data.country || null,
        isActive: parsed.data.isActive,
      },
      select: safeSelect,
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "A user with that email already exists."
        : "Database not configured. Set DATABASE_URL to manage users.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
