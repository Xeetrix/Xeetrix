import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/require-admin";
import { productSchema } from "@/lib/validation/product";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = user.role === "ADMIN";

  try {
    const products = await prisma.product.findMany({
      where: isAdmin ? undefined : { importerId: user.sub },
      include: {
        category: true,
        importer: { select: { id: true, name: true, company: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL to manage products." },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = user.role === "ADMIN";

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product data" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
        // Non-admin sellers (Importer/Exporter) always own the products
        // they create — this is derived from the session, never trusted
        // from client input.
        importerId: isAdmin ? null : user.sub,
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "A product with that slug already exists."
        : "Database not configured. Set DATABASE_URL to manage products.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
