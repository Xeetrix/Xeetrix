'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { trustPoints } from '@/lib/content/home';

export function TrustStrip() {
  return (
    <section aria-label="Why work with Xeetrix" className="relative border-y border-white/10 bg-white/[0.02] py-16">
      <Container>
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {trustPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-3"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyber-blue" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-white">{point.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{point.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
