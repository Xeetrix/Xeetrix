'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
};

const LINK_DISTANCE = 150;
const MOUSE_RADIUS = 180;
const PARTICLE_DENSITY = 16000; // px^2 per particle

export function ParticleNetwork({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId = 0;

    function createParticles() {
      const count = Math.min(140, Math.floor((width * height) / PARTICLE_DENSITY));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.6 + 0.6,
        hue: Math.random() > 0.5 ? 210 : 272,
      }));
    }

    function resize() {
      const parent = canvas!.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    }

    function step() {
      ctx!.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.6;
          particle.x -= (dx / dist) * force;
          particle.y -= (dy / dist) * force;
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            const opacity = (1 - dist / LINK_DISTANCE) * 0.35;
            ctx!.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 90%, 65%, ${opacity})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      for (const particle of particles) {
        const gradient = ctx!.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 4,
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 95%, 70%, 0.9)`);
        gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `hsla(${particle.hue}, 95%, 85%, 0.9)`;
        ctx!.beginPath();
        ctx!.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame() {
      step();
      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(frame);
      }
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function handlePointerLeave() {
      mouse = { x: -9999, y: -9999 };
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    frame();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
