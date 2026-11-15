import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full text-center space-y-5 bg-white border border-slate-200 rounded-2xl p-10 shadow-card">
        <div className="font-mono text-3xl font-bold text-[#0B5336]">404</div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          The page or route you requested could not be found.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary px-5 py-2.5 text-sm gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
