import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EmptyDbNotice } from "@/components/admin/EmptyDbNotice";
import { formatCurrency } from "@/lib/constants";

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof loadProducts>> | null = null;
  try {
    products = await loadProducts();
  } catch {
    products = null;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Products</h1>
          <p className="mt-1 text-sm text-ink-500">
            {products ? `${products.length} products` : "Manage your product catalog"}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        {products === null ? (
          <EmptyDbNotice entity="products" />
        ) : products.length === 0 ? (
          <p className="p-10 text-center text-ink-400">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Wholesale</th>
                  <th className="px-5 py-3 font-medium">MOQ</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="max-w-xs truncate px-5 py-3 font-medium text-ink-900">
                      {product.title}
                    </td>
                    <td className="px-5 py-3 text-ink-500">{product.category.name}</td>
                    <td className="px-5 py-3 text-ink-700">
                      {formatCurrency(product.wholesalePrice)}
                    </td>
                    <td className="px-5 py-3 text-ink-500">{product.moq}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          product.isPublished
                            ? "bg-brand-50 text-brand-700"
                            : "bg-ink-100 text-ink-500"
                        }`}
                      >
                        {product.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteButton endpoint={`/api/products/${product.id}`} confirmMessage={`Delete "${product.title}"? This cannot be undone.`} />
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

function loadProducts() {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}
