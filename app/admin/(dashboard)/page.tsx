import Link from "next/link";
import { AlertTriangle, LayoutGrid, Package, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { mockCategories, mockProducts } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/require-admin";

async function getCounts(isAdmin: boolean, userId: string) {
  try {
    const [products, categories, users] = await Promise.all([
      isAdmin ? prisma.product.count() : prisma.product.count({ where: { importerId: userId } }),
      prisma.category.count(),
      prisma.user.count(),
    ]);
    return { products, categories, users, dbConnected: true };
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
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const counts = await getCounts(isAdmin, user?.sub ?? "");

  const cards = [
    { label: "Products", value: counts.products, icon: Package, href: "/admin/products" },
    ...(isAdmin
      ? [
          { label: "Categories", value: counts.categories, icon: LayoutGrid, href: "/admin/categories" },
          { label: "Users", value: counts.users, icon: Users, href: "/admin/users" },
        ]
      : []),
  ];

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950 sm:text-2xl">Overview</h1>
      <p className="mt-1 text-sm text-ink-500">
        {isAdmin
          ? "Manage your Xeetrix wholesale marketplace."
          : "Manage the products you supply on the Xeetrix marketplace."}
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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-shadow hover:shadow-elevated sm:p-6"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:h-12 sm:w-12">
              <card.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-display text-xl font-bold text-ink-950 sm:text-2xl">{card.value}</p>
              <p className="text-sm text-ink-500">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
