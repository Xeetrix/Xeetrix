import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { getCurrentUser } from "@/lib/require-admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-ink-50/60 lg:flex-row">
      <Sidebar name={user.name} email={user.email} role={user.role} />
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
