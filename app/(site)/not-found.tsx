import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center gap-4 py-32 text-center">
      <div className="mb-2">
        <BrandLogo size="xl" variant="badge" showText={false} />
      </div>
      <h1 className="font-display text-3xl font-bold text-slate-900">
        Page Not Found
      </h1>
      <p className="max-w-md text-slate-600 text-sm">
        The flight page or resource you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-bold text-white hover:bg-brand-800 transition-colors shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Home &amp; Flight Search
      </Link>
    </Container>
  );
}
