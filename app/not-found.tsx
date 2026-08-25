import { Compass } from 'lucide-react';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Container } from '@/components/ui/Container';
import { MagneticButton } from '@/components/ui/MagneticButton';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-[80vh] items-center overflow-hidden">
        <Container className="flex flex-col items-center py-32 text-center">
          <div className="mesh-gradient flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10">
            <Compass className="h-7 w-7 text-cyber-blue" />
          </div>
          <p className="mt-8 font-mono text-sm tracking-[0.3em] text-white/40">404</p>
          <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            This page didn&apos;t make it to the filing cabinet.
          </h1>
          <p className="mt-4 max-w-md text-balance text-sm leading-relaxed text-muted">
            The page you&apos;re looking for doesn&apos;t exist or has moved. Try one of the links below.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <MagneticButton href="/">Back to Home</MagneticButton>
            <MagneticButton href="/services" variant="secondary">
              Browse Services
            </MagneticButton>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
