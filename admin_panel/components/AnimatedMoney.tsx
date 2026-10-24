'use client';

import { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/api';

/** Counts a currency amount up from 0 (ease-out), formatted with 3 decimals. */
export default function AnimatedMoney({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !value) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{formatMoney(shown)}</>;
}
