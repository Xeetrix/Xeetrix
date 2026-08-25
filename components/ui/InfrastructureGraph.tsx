'use client';

import { motion, useReducedMotion } from 'framer-motion';

const nodes = [
  { label: 'LLC', angle: -90 },
  { label: 'EIN', angle: -30 },
  { label: 'Banking', angle: 30 },
  { label: 'Payments', angle: 90 },
  { label: 'Website', angle: 150 },
  { label: 'Compliance', angle: 210 },
];

const RADIUS = 168;
const CENTER = 200;

function pointOnCircle(angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  };
}

export function InfrastructureGraph({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label="Diagram showing Your Business connected to LLC, EIN, Banking, Payments, Website, and Compliance"
      className={className}
    >
      <defs>
        <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0070F3" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0070F3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0070F3" />
          <stop offset="100%" stopColor="#7928CA" />
        </linearGradient>
      </defs>

      {nodes.map((node, index) => {
        const point = pointOnCircle(node.angle);
        return (
          <motion.line
            key={`line-${node.label}`}
            x1={CENTER}
            y1={CENTER}
            x2={point.x}
            y2={point.y}
            stroke="url(#line-gradient)"
            strokeWidth={1.25}
            strokeOpacity={0.45}
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.45 }}
            transition={{ duration: 1, delay: reduceMotion ? 0 : 0.15 * index, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}

      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={64}
        fill="url(#node-glow)"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />
      <circle cx={CENTER} cy={CENTER} r={46} fill="#0a0a0d" stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
      <text
        x={CENTER}
        y={CENTER - 4}
        textAnchor="middle"
        className="fill-white"
        style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.02em' }}
      >
        YOUR
      </text>
      <text
        x={CENTER}
        y={CENTER + 12}
        textAnchor="middle"
        className="fill-white"
        style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.02em' }}
      >
        BUSINESS
      </text>

      {nodes.map((node, index) => {
        const point = pointOnCircle(node.angle);
        return (
          <motion.g
            key={node.label}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.4 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <circle cx={point.x} cy={point.y} r={34} fill="#0a0a0d" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
            <text
              x={point.x}
              y={point.y + 4}
              textAnchor="middle"
              className="fill-white/85"
              style={{ fontSize: 10.5, fontWeight: 600 }}
            >
              {node.label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
