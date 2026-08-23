const capabilities = [
  'LLC Filing',
  'EIN Application',
  'Registered Agent Coordination',
  'Business Banking Assistance',
  'Payment Readiness',
  'Website & E-commerce Launch',
  'Compliance Tracking',
  'CPA & Bookkeeping Coordination',
];

export function CapabilityMarquee() {
  return (
    <section aria-label="What Xeetrix helps with" className="relative border-y border-white/10 bg-white/[0.02] py-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="flex overflow-hidden">
        <div className="flex shrink-0 animate-marquee items-center gap-16 pr-16">
          {capabilities.map((item) => (
            <span key={item} className="whitespace-nowrap text-lg font-semibold text-white/35 transition-colors hover:text-white/70">
              {item}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 animate-marquee items-center gap-16 pr-16" aria-hidden="true">
          {capabilities.map((item) => (
            <span key={`${item}-dup`} className="whitespace-nowrap text-lg font-semibold text-white/35 transition-colors hover:text-white/70">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
