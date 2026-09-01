"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import type { SafeUser } from "@/lib/types";

export function UserForm({ user }: { user?: SafeUser }) {
  const router = useRouter();
  const isEdit = Boolean(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const payload: Record<string, unknown> = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      role: String(form.get("role") ?? "IMPORTER"),
      company: String(form.get("company") ?? ""),
      phone: String(form.get("phone") ?? ""),
      country: String(form.get("country") ?? ""),
      isActive: form.get("isActive") === "on",
    };
    if (!isEdit || password) payload.password = password;

    try {
      const res = await fetch(isEdit ? `/api/users/${user!.id}` : "/api/users", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unable to save user");
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save user");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Full Name</span>
          <input name="name" required defaultValue={user?.name} className="input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Email</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={user?.email}
            className="input"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">
            Password {isEdit && <span className="text-ink-400">(leave blank to keep current)</span>}
          </span>
          <input
            name="password"
            type="password"
            required={!isEdit}
            minLength={8}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Role</span>
          <select name="role" defaultValue={user?.role ?? "IMPORTER"} className="input">
            <option value="IMPORTER">Importer</option>
            <option value="EXPORTER">Exporter</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Company</span>
          <input name="company" defaultValue={user?.company ?? ""} className="input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Phone</span>
          <input name="phone" defaultValue={user?.phone ?? ""} className="input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Country</span>
          <input name="country" defaultValue={user?.country ?? ""} className="input" />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={user?.isActive ?? true}
          className="h-4 w-4 rounded border-ink-300 text-brand-600"
        />
        Active account
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Save Changes" : "Create User"}
        </button>
      </div>
    </form>
  );
}
