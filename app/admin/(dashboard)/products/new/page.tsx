import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductForm } from "@/components/admin/ProductForm";
import { EmptyDbNotice } from "@/components/admin/EmptyDbNotice";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> | null = null;
  try {
    categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    categories = null;
  }

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Products", href: "/admin/products" }, { label: "New Product" }]}
      />
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-950">Add Product</h1>

      <div className="mt-6 max-w-3xl rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
        {categories === null ? (
          <EmptyDbNotice entity="products" />
        ) : categories.length === 0 ? (
          <p className="text-ink-500">
            Create a category first before adding products.
          </p>
        ) : (
          <ProductForm categories={categories} />
        )}
      </div>
    </div>
  );
}
