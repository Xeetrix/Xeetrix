"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Globe2,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import type { Role } from "@/lib/types";

const allLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/products", label: "Products", icon: Package, adminOnly: false },
  { href: "/admin/categories", label: "Categories", icon: LayoutGrid, adminOnly: true },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

export function Sidebar({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: Role;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = allLinks.filter((link) => !link.adminOnly || role === "ADMIN");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex-1 space-y-1 p-4">
      {links.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const accountFooter = (
    <div className="border-t border-ink-100 p-4">
      <div className="mb-3 truncate">
        <p className="truncate text-sm font-semibold text-ink-900">{name}</p>
        <p className="truncate text-xs text-ink-400">{email}</p>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
          {role}
        </p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );

  const brand = (
    <div className="flex h-16 flex-shrink-0 items-center gap-2 border-b border-ink-100 px-5 font-display text-lg font-bold text-ink-950">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Globe2 className="h-4 w-4" />
      </span>
      {SITE_NAME}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 items-center justify-between border-b border-ink-100 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2 font-display text-base font-bold text-ink-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Globe2 className="h-4 w-4" />
          </span>
          {SITE_NAME}
        </div>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-elevated">
            <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-ink-100 px-5">
              <div className="flex items-center gap-2 font-display text-lg font-bold text-ink-950">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <Globe2 className="h-4 w-4" />
                </span>
                {SITE_NAME}
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {accountFooter}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 flex-shrink-0 flex-col border-r border-ink-100 bg-white lg:sticky lg:top-0 lg:flex">
        {brand}
        {nav}
        {accountFooter}
      </aside>
    </>
  );
}
