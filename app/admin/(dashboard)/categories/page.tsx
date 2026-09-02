import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EmptyDbNotice } from "@/components/admin/EmptyDbNotice";

export default async function AdminCategoriesPage() {
  let categories: Awaited<ReturnType<typeof loadCategories>> | null = null;
  try {
    categories = await loadCategories();
  } catch {
    categories = null;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-950 sm:text-2xl">Categories</h1>
          <p className="mt-1 text-sm text-ink-500">
            {categories ? `${categories.length} categories` : "Manage product categories"}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        {categories === null ? (
          <EmptyDbNotice entity="categories" />
        ) : categories.length === 0 ? (
          <p className="p-10 text-center text-ink-400">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-3 py-3 font-medium sm:px-5">Name</th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-5">Slug</th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-5">Products</th>
                  <th className="whitespace-nowrap px-3 py-3 text-right font-medium sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-3 py-3 font-medium text-ink-900 sm:px-5">{category.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-500 sm:px-5">{category.slug}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-500 sm:px-5">{category._count.products}</td>
                    <td className="whitespace-nowrap px-3 py-3 sm:px-5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteButton
                          endpoint={`/api/categories/${category.id}`}
                          confirmMessage={`Delete "${category.name}"? Products using this category must be removed or reassigned first.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function loadCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}
