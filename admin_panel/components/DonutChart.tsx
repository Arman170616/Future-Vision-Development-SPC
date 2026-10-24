'use client';

import { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/api';

export interface Slice {
  key: string;
  label: string;
  value: number;
}

// Warm palette matching the brand, then cooler accents for contrast
const COLORS = ['#e05a4f', '#f4a07a', '#f0c05a', '#5fb88f', '#4aa3c7', '#7c83db', '#c46bc0', '#e88aa8', '#9c8b7a', '#3d9970', '#b5651d'];

/** Animated doughnut: segments draw in around the ring; legend shows amount and share. */
export default function DonutChart({ slices, total, currency = 'OMR', onSelect, activeKey }: {
  slices: Slice[];
  total: number;
  currency?: string;
  onSelect?: (slice: Slice) => void;
  activeKey?: string | null;
}) {
  const [drawn, setDrawn] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const dataKey = slices.map(s => `${s.key}:${s.value}`).join('|');

  useEffect(() => {
    setDrawn(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(id);
  }, [dataKey]);

  const r = 70;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const focus = slices.find(s => s.key === (hover ?? activeKey));

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-48 w-48 shrink-0">
        <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
          <circle cx="90" cy="90" r={r} fill="none" stroke="rgb(var(--line))" strokeWidth="22" />
          {total > 0 &&
            slices.map((s, i) => {
              const len = (s.value / total) * c;
              const seg = (
                <circle
                  key={s.key}
                  cx="90"
                  cy="90"
                  r={r}
                  fill="none"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={hover === s.key || activeKey === s.key ? 28 : 22}
                  strokeDasharray={`${drawn ? Math.max(len - 1.5, 0) : 0} ${c}`}
                  strokeDashoffset={-offset}
                  style={{ transition: `stroke-dasharray .9s cubic-bezier(.2,.7,.2,1) ${i * 70}ms, stroke-width .2s`, cursor: onSelect ? 'pointer' : 'default' }}
                  onMouseEnter={() => setHover(s.key)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onSelect?.(s)}
                />
              );
              offset += len;
              return seg;
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] uppercase tracking-wider text-muted">{focus ? focus.label : 'Total'}</span>
          <span className="text-lg font-bold">{formatMoney(focus ? focus.value : total)}</span>
          <span className="text-[11px] text-muted">{currency}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2">
        {slices.length === 0 && <li className="text-sm text-muted">No expenses in this period.</li>}
        {slices.map((s, i) => {
          const pct = total ? (s.value / total) * 100 : 0;
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => onSelect?.(s)}
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
                className={`w-full rounded-xl px-2 py-1.5 text-left transition-colors ${activeKey === s.key ? 'bg-accent/10' : 'hover:bg-accent/5'}`}
              >
                <span className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="mr-auto truncate">{s.label}</span>
                  <span className="font-semibold">{formatMoney(s.value)}</span>
                  <span className="w-12 text-right text-xs text-muted">{pct.toFixed(1)}%</span>
                </span>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-line/60">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: drawn ? `${pct}%` : 0, background: COLORS[i % COLORS.length], transition: `width .9s cubic-bezier(.2,.7,.2,1) ${i * 70}ms` }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
