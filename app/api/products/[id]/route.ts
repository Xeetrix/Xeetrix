import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/require-admin";
import { productSchema } from "@/lib/validation/product";
import { getBaseTier } from "@/lib/pricing";

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
        priceTiers: { orderBy: { minQty: "asc" } },
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

  const { priceTiers, ...rest } = parsed.data;
  const baseTier = getBaseTier(priceTiers);

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
        ...rest,
        seoTitle: rest.seoTitle || null,
        seoDescription: rest.seoDescription || null,
        // wholesalePrice/moq mirror the cheapest tier — see prisma/schema.prisma.
        wholesalePrice: baseTier.price,
        moq: baseTier.minQty,
        // Replace the tier set wholesale: this is a small, admin-only
        // form submission (never hundreds of rows), so delete-then-recreate
        // is simpler and just as correct as diffing each row.
        priceTiers: {
          deleteMany: {},
          create: priceTiers.map((tier) => ({ minQty: tier.minQty, price: tier.price })),
        },
      },
      include: { priceTiers: { orderBy: { minQty: "asc" } } },
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
