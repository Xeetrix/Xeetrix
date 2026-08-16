'use client';

import { useEffect, useRef, useState } from 'react';

import { gsap } from '@/lib/gsap';

const HOVER_SELECTOR = 'a, button, [role="button"], [data-cursor="hover"]';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const moveDot = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' });
    const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' });
    const moveRing = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

    function handlePointerMove(event: PointerEvent) {
      moveDot(event.clientX);
      moveDotY(event.clientY);
      moveRing(event.clientX);
      moveRingY(event.clientY);
    }

    function handlePointerOver(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      setHovering(Boolean(target?.closest(HOVER_SELECTOR)));
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerover', handlePointerOver);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', handlePointerOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[999] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference will-change-transform"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[998] -translate-x-1/2 -translate-y-1/2 rounded-full border mix-blend-difference will-change-transform transition-[width,height,background-color] duration-300 ease-out"
        style={{
          width: hovering ? 56 : 32,
          height: hovering ? 56 : 32,
          borderColor: 'rgba(255,255,255,0.6)',
          backgroundColor: hovering ? 'rgba(255,255,255,0.12)' : 'transparent',
        }}
      />
    </>
  );
}
