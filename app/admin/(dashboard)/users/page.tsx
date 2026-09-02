import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EmptyDbNotice } from "@/components/admin/EmptyDbNotice";

const roleStyles: Record<string, string> = {
  ADMIN: "bg-ink-900 text-white",
  IMPORTER: "bg-brand-50 text-brand-700",
  EXPORTER: "bg-accent-50 text-accent-700",
};

export default async function AdminUsersPage() {
  let users: Awaited<ReturnType<typeof loadUsers>> | null = null;
  try {
    users = await loadUsers();
  } catch {
    users = null;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-950 sm:text-2xl">Users</h1>
          <p className="mt-1 text-sm text-ink-500">
            {users ? `${users.length} users` : "Manage admin, importer & exporter accounts"}
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        {users === null ? (
          <EmptyDbNotice entity="users" />
        ) : users.length === 0 ? (
          <p className="p-10 text-center text-ink-400">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-3 py-3 font-medium sm:px-5">Name</th>
                  <th className="px-3 py-3 font-medium sm:px-5">Email</th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-5">Role</th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-5">Status</th>
                  <th className="whitespace-nowrap px-3 py-3 text-right font-medium sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-3 py-3 font-medium text-ink-900 sm:px-5">{user.name}</td>
                    <td className="px-3 py-3 text-ink-500 sm:px-5">{user.email}</td>
                    <td className="whitespace-nowrap px-3 py-3 sm:px-5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[user.role]}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 sm:px-5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.isActive ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-500"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 sm:px-5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteButton
                          endpoint={`/api/users/${user.id}`}
                          confirmMessage={`Delete "${user.name}"? This cannot be undone.`}
                        />
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

function loadUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
}
