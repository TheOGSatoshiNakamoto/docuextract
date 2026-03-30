'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export interface BentoCell {
  id: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  children: React.ReactNode;
  className?: string;
}

interface BentoGridProps {
  cells: BentoCell[];
  /** Number of columns (default 3) */
  cols?: 2 | 3;
  className?: string;
}

export default function BentoGrid({ cells, cols = 3, className = '' }: BentoGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div
      ref={ref}
      className={`grid gap-4 ${cols === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} ${className}`}
    >
      {cells.map((cell, i) => (
        <BentoCell key={cell.id} cell={cell} index={i} inView={inView} />
      ))}
    </div>
  );
}

function BentoCell({
  cell,
  index,
  inView,
}: {
  cell: BentoCell;
  index: number;
  inView: boolean;
}) {
  const colSpanClass =
    cell.colSpan === 2
      ? 'md:col-span-2'
      : cell.colSpan === 3
        ? 'md:col-span-3'
        : 'col-span-1';
  const rowSpanClass = cell.rowSpan === 2 ? 'md:row-span-2' : '';

  return (
    <motion.div
      className={`rounded-xl overflow-hidden ${colSpanClass} ${rowSpanClass} ${cell.className ?? ''}`}
      style={{ background: '#161E2E' }}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        transition: { duration: 0.1 },
      }}
    >
      {cell.children}
    </motion.div>
  );
}
