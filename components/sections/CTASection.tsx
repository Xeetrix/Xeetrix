import { Container } from '@/components/ui/Container';
import { MagneticButton } from '@/components/ui/MagneticButton';

type CTASectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
};

export function CTASection({
  eyebrow = 'Get Started',
  title = 'Ready to Build Your US Business Infrastructure?',
  description = "Tell us where you are today. We'll help you understand the next practical steps.",
  primary = { label: 'Start Your Setup', href: '/get-started' },
  secondary = { label: 'Talk to Xeetrix', href: '/contact' },
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial-fade blur-3xl"
      />
      <Container>
        <div className="card-glass mx-auto max-w-3xl rounded-[32px] border border-white/10 px-8 py-16 text-center">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-cyber-blue">
            {eyebrow}
          </span>
          <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-lg leading-relaxed text-muted">{description}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <MagneticButton href={primary.href}>{primary.label}</MagneticButton>
            <MagneticButton href={secondary.href} variant="secondary">
              {secondary.label}
            </MagneticButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
