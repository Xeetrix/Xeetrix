import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/require-admin";
import { categorySchema } from "@/lib/validation/category";
import { dbErrorMessage } from "@/lib/db-error";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      {
        error: dbErrorMessage(
          error,
          "Database not configured. Set DATABASE_URL to manage categories."
        ),
      },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid category data" },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        image: parsed.data.image || null,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "A category with that slug already exists."
        : dbErrorMessage(error, "Unable to create category.");
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
