import Link from "next/link";
import { AlertTriangle, LayoutGrid, Package, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { mockCategories, mockProducts } from "@/lib/mock-data";

async function getCounts() {
  try {
    const [products, categories, users] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.user.count(),
    ]);
    const usingMock = products === 0 && categories === 0;
    return {
      products: usingMock ? mockProducts.length : products,
      categories: usingMock ? mockCategories.length : categories,
      users,
      dbConnected: true,
    };
  } catch {
    return {
      products: mockProducts.length,
      categories: mockCategories.length,
      users: 0,
      dbConnected: false,
    };
  }
}

export default async function AdminOverviewPage() {
  const counts = await getCounts();

  const cards = [
    { label: "Products", value: counts.products, icon: Package, href: "/admin/products" },
    { label: "Categories", value: counts.categories, icon: LayoutGrid, href: "/admin/categories" },
    { label: "Users", value: counts.users, icon: Users, href: "/admin/users" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950">Overview</h1>
      <p className="mt-1 text-sm text-ink-500">
        Manage your Xeetrix wholesale marketplace.
      </p>

      {!counts.dbConnected && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-semibold">No database connected</p>
            <p className="mt-0.5">
              The storefront is showing the bundled demo catalog. Set{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5">DATABASE_URL</code>{" "}
              and run <code className="rounded bg-amber-100 px-1 py-0.5">npm run db:push</code> to
              enable product, category, and user management here.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition-shadow hover:shadow-elevated"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <card.icon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-ink-950">{card.value}</p>
              <p className="text-sm text-ink-500">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
