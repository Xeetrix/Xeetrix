import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Categories", href: "/admin/categories" }, { label: "New Category" }]}
      />
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-950">Add Category</h1>

      <div className="mt-6 max-w-2xl rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
        <CategoryForm />
      </div>
    </div>
  );
}
