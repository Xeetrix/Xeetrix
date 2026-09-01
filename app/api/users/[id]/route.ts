import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/require-admin";
import { userUpdateSchema } from "@/lib/validation/user";

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({ where: { id }, select: safeSelect });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid user data" },
      { status: 400 }
    );
  }

  try {
    const data: Record<string, unknown> = {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      country: parsed.data.country || null,
      isActive: parsed.data.isActive,
    };
    if (parsed.data.password) {
      data.password = await bcrypt.hash(parsed.data.password, 10);
    }

    const user = await prisma.user.update({ where: { id }, data, select: safeSelect });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unable to update user." }, { status: 503 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (id === admin.sub) {
    return NextResponse.json(
      { error: "You cannot delete your own account while signed in." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete user." }, { status: 503 });
  }
}
