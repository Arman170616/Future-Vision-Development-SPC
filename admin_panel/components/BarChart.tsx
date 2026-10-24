'use client';

import { useMemo, useState } from 'react';
import { formatMoney } from '@/lib/api';

export interface Bar {
  key: string;
  label: string;
  title: string;
  value: number;
  /** Extra detail shown next to the value, e.g. "≈ 9.677 OMR / day" */
  note?: string;
}

/** Nice round axis maximum: 1, 2, 2.5 or 5 × 10ⁿ above the largest value. */
const niceMax = (max: number) => {
  if (max <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  for (const step of [1, 2, 2.5, 5, 10]) if (step * pow >= max) return step * pow;
  return 10 * pow;
};

/** Animated column chart; bars grow from the baseline one after another. Click selects a bar. */
export default function BarChart({ bars, activeKey, onSelect, currency = 'OMR', average }: {
  bars: Bar[];
  activeKey?: string | null;
  onSelect?: (bar: Bar) => void;
  currency?: string;
  /** Dashed reference line, e.g. the month's spending spread per day */
  average?: { value: number; label: string } | null;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const top = useMemo(() => niceMax(Math.max(0, average?.value ?? 0, ...bars.map(b => b.value))), [bars, average]);
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  const dense = bars.length > 16;
  const shownLabel = (i: number) => !dense || i === 0 || (i + 1) % 5 === 0 || i === bars.length - 1;
  const focus = bars.find(b => b.key === (hover ?? activeKey));
  // Key on the data so the grow animation replays whenever the period changes
  const animKey = bars.map(b => `${b.key}:${b.value}`).join('|');

  return (
    <div>
      <div className="mb-2 h-6 text-sm">
        {focus ? (
          <span>
            <span className="text-muted">{focus.title}: </span>
            <strong>{formatMoney(focus.value)} {currency}</strong>
            {focus.note && <span className="ml-2 text-muted">{focus.note}</span>}
          </span>
        ) : (
          <span className="text-muted">Hover a bar for details{onSelect ? ' · click to list its expenses' : ''}</span>
        )}
      </div>
      <div className="flex gap-2">
        {/* Y axis */}
        <div className="relative w-14 shrink-0 text-right text-[10px] text-muted" style={{ height: 240 }}>
          {ticks.map(t => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - t) * 100}%` }}>
              {top * t >= 1000 ? `${((top * t) / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k` : Math.round(top * t)}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          {/* grid lines */}
          <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: 240 }}>
            {ticks.map(t => (
              <div key={t} className={`absolute inset-x-0 border-t ${t === 0 ? 'border-line' : 'border-dashed border-line/60'}`} style={{ top: `${(1 - t) * 100}%` }} />
            ))}
          </div>
          {average && average.value > 0 && (
            <div className="pointer-events-none absolute inset-x-0 z-10 animate-[fade-up_.6s_.5s_both]" style={{ top: `${(1 - average.value / top) * 240}px` }}>
              <div className="border-t-2 border-dashed border-sky-500/80" />
              <span className="absolute -top-6 right-0 rounded-md bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">{average.label}</span>
            </div>
          )}
          <div key={animKey} className={`relative flex items-end ${dense ? 'gap-[3px]' : 'gap-2 sm:gap-3'}`} style={{ height: 240 }}>
            {bars.map((bar, i) => {
              const pct = top ? (bar.value / top) * 100 : 0;
              const active = bar.key === activeKey;
              return (
                <button
                  key={bar.key}
                  type="button"
                  onClick={() => onSelect?.(bar)}
                  onMouseEnter={() => setHover(bar.key)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(bar.key)}
                  onBlur={() => setHover(null)}
                  aria-label={`${bar.title}: ${formatMoney(bar.value)} ${currency}`}
                  className="group relative flex h-full flex-1 items-end"
                >
                  <span
                    className={`w-full rounded-t-md transition-[filter,opacity] duration-200 group-hover:brightness-110 ${
                      activeKey && !active ? 'opacity-45' : ''
                    }`}
                    style={{
                      height: `${Math.max(pct, bar.value > 0 ? 1.5 : 0)}%`,
                      background: active
                        ? 'linear-gradient(to top, rgb(var(--accent)), rgb(var(--accent-2)))'
                        : 'linear-gradient(to top, rgb(var(--accent) / 0.85), rgb(var(--accent-2) / 0.75))',
                      boxShadow: active ? '0 0 0 2px rgb(var(--accent) / 0.35), 0 8px 18px -8px rgb(var(--accent) / 0.8)' : undefined,
                      transformOrigin: 'bottom',
                      animation: `bar-grow .7s cubic-bezier(.2,.7,.2,1) ${Math.min(i * (dense ? 18 : 45), 700)}ms both`,
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className={`mt-2 flex ${dense ? 'gap-[3px]' : 'gap-2 sm:gap-3'}`}>
            {bars.map((bar, i) => (
              <span key={bar.key} className={`flex-1 text-center text-[10px] sm:text-xs ${bar.key === activeKey ? 'font-bold text-accent' : 'text-muted'}`}>
                {shownLabel(i) ? bar.label : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
