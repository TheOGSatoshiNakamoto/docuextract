'use client';

import { useRef, useEffect, useState } from 'react';
import { useInView, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  /** Animation duration in seconds (default 1.5) */
  duration?: number;
  /** Decimal places (default 0) */
  decimals?: number;
}

export default function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1.5,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  // Respect prefers-reduced-motion
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (!inView) return;

    if (prefersReduced) {
      setDisplay(value.toFixed(decimals));
      return;
    }

    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
      onUpdate(v) {
        setDisplay(v.toFixed(decimals));
      },
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
