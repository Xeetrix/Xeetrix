import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CompassIcon } from "lucide-react";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center gap-4 py-32 text-center">
      <CompassIcon className="h-12 w-12 text-brand-500" />
      <h1 className="font-display text-3xl font-bold text-ink-950">
        Page not found
      </h1>
      <p className="max-w-md text-ink-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Back to Home
      </Link>
    </Container>
  );
}
