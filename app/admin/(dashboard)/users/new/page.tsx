import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { UserForm } from "@/components/admin/UserForm";

export default function NewUserPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Users", href: "/admin/users" }, { label: "New User" }]} />
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-950">Add User</h1>

      <div className="mt-6 max-w-2xl rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
        <UserForm />
      </div>
    </div>
  );
}
