import type { ReactNode } from 'react';
import { Info } from 'lucide-react';

export function Callout({ title = 'Important', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-cyber-blue/25 bg-cyber-blue/[0.06] p-5">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyber-blue" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <div className="mt-1.5 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </div>
  );
}
