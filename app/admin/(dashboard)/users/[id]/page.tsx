import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { UserForm } from "@/components/admin/UserForm";
import { prisma } from "@/lib/prisma";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        phone: true,
        country: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch {
    notFound();
  }
  if (!user) notFound();

  return (
    <div>
      <Breadcrumbs items={[{ label: "Users", href: "/admin/users" }, { label: user.name }]} />
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-950">Edit User</h1>

      <div className="mt-6 max-w-2xl rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
        <UserForm user={user} />
      </div>
    </div>
  );
}
