import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { prisma } from "@/lib/prisma";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let category;
  try {
    category = await prisma.category.findUnique({ where: { id } });
  } catch {
    notFound();
  }
  if (!category) notFound();

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Categories", href: "/admin/categories" }, { label: category.name }]}
      />
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-950">Edit Category</h1>

      <div className="mt-6 max-w-2xl rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
