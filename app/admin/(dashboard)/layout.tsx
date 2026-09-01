import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { getCurrentAdmin } from "@/lib/require-admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-ink-50/60">
      <Sidebar name={admin.name} email={admin.email} />
      <div className="flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-6 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
