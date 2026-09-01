import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  let categories;
  try {
    [product, categories] = await Promise.all([
      prisma.product.findUnique({ where: { id } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {
    notFound();
  }

  if (!product) notFound();

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Products", href: "/admin/products" }, { label: product.title }]}
      />
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-950">Edit Product</h1>

      <div className="mt-6 max-w-3xl rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
        <ProductForm categories={categories ?? []} product={product} />
      </div>
    </div>
  );
}
