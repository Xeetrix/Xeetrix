import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/require-admin";
import { productSchema } from "@/lib/validation/product";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        importer: { select: { id: true, name: true, company: true, role: true } },
      },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user.role !== "ADMIN" && product.importerId !== user.sub) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product data" },
      { status: 400 }
    );
  }

  try {
    if (user.role !== "ADMIN") {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing || existing.importerId !== user.sub) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
      },
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Unable to update product." }, { status: 503 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    if (user.role !== "ADMIN") {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing || existing.importerId !== user.sub) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete product." }, { status: 503 });
  }
}
