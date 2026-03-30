'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate, useInView, motion } from 'framer-motion';

interface AnimatedCounterProps {
  /** The target number to count up to */
  value: number;
  /** Text appended after the number, e.g. "%" or "K+" */
  suffix?: string;
  /** Text prepended before the number, e.g. "$" */
  prefix?: string;
  /** Animation duration in seconds (default 1.5) */
  duration?: number;
  /** Optional style overrides for the wrapping span */
  style?: React.CSSProperties;
  className?: string;
}

export default function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1.5,
  style,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isInView) {
      if (prefersReduced) {
        count.set(value);
      } else {
        const controls = animate(count, value, {
          duration,
          ease: 'easeOut',
        });
        return () => controls.stop();
      }
    }
  }, [isInView, value, duration, count]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
