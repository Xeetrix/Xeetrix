import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full text-center space-y-5 bg-white border border-slate-200 rounded-2xl p-10 shadow-card">
        <div className="flex justify-center">
          <BrandLogo size="lg" variant="badge" showText={false} />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          The Xeetrix Holding Group page or venture route you requested could not be found.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary px-5 py-2.5 text-sm gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Xeetrix Group</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
