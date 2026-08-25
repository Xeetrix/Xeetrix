import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { Industry } from '@/lib/content/industries';

export function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="card-glass group flex h-full flex-col justify-between rounded-3xl border border-white/10 p-7 transition-colors hover:border-white/25"
    >
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition-colors group-hover:border-cyber-blue/40">
          <industry.icon className="h-5 w-5 text-cyber-blue" strokeWidth={1.7} />
        </div>
        <h3 className="mt-6 text-lg font-semibold text-white">{industry.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{industry.headline}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors group-hover:text-white">
        See the setup
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}
