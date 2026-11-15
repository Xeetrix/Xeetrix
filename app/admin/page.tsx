import type { Metadata } from "next";
import { AdminClient } from "@/components/admin/AdminClient";

export const metadata: Metadata = {
  title: "Executive Admin Control Center",
  description: "Multi-venture administrative console for Xeetrix Holding Group.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
