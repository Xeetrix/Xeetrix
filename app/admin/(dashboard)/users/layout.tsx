import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/require-admin";

export default async function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin");
  return <>{children}</>;
}
