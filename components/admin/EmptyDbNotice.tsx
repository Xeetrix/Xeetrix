import { AlertTriangle } from "lucide-react";

export function EmptyDbNotice({ entity }: { entity: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-6 py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-amber-500" />
      <p className="font-semibold text-amber-800">No database connected</p>
      <p className="max-w-md text-sm text-amber-700">
        Set <code className="rounded bg-amber-100 px-1 py-0.5">DATABASE_URL</code> in
        your environment and run{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5">npm run db:push</code> (then{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5">npm run db:seed</code>) to
        start managing {entity} here. The public storefront will stay empty until then.
      </p>
    </div>
  );
}
