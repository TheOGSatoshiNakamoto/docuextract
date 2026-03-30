'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export interface BentoItem {
  /** How many grid columns this cell spans (1 or 2) */
  colSpan?: 1 | 2;
  /** How many grid rows this cell spans (1 or 2) */
  rowSpan?: 1 | 2;
  children: React.ReactNode;
  /** Extra style overrides for the cell */
  style?: React.CSSProperties;
}

interface BentoGridProps {
  items: BentoItem[];
  /** Number of columns in the base grid (default 3) */
  columns?: number;
  /** Gap between cells in px (default 16) */
  gap?: number;
  style?: React.CSSProperties;
  className?: string;
}

const CELL_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: 'easeOut' as const,
    },
  }),
};

function BentoCell({
  item,
  index,
  isInView,
}: {
  item: BentoItem;
  index: number;
  isInView: boolean;
}) {
  const { colSpan = 1, rowSpan = 1, children, style } = item;

  return (
    <motion.div
      custom={index}
      variants={CELL_VARIANTS}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.1 }}
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        background: '#161b27',
        border: '1px solid #2a3147',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'default',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

export default function BentoGrid({
  items,
  columns = 3,
  gap = 16,
  style,
  className,
}: BentoGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Trigger once when 20% of the grid is in view
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        ...style,
      }}
    >
      {items.map((item, i) => (
        <BentoCell key={i} item={item} index={i} isInView={isInView} />
      ))}
    </div>
  );
}
