'use client';

import { CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { Option } from '@/lib/types';

type Props = {
  target: string;
  multiple?: boolean;
  value: (number | string)[] | number | string | null;
  labels?: Option[];
  onChange: (value: (number | string)[] | number | string | null) => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  id?: string;
};

/** Searchable select for ForeignKey (single) and ManyToMany (multiple) fields. */
export default function RelationPicker({ target, multiple, value, labels, onChange, disabled, required, invalid, id }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [known, setKnown] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Start fixed + hidden so the panel never lands at the end of <body> (which would scroll the page)
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({ position: 'fixed', visibility: 'hidden', top: 0, left: 0 });
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => {
    if (multiple) return ((value as (number | string)[]) ?? []).map(String);
    return value === null || value === undefined || value === '' ? [] : [String(value)];
  }, [value, multiple]);

  // Depend on the label contents, not the array identity (callers may pass a new array each render)
  const labelsKey = (labels ?? []).map(o => `${o.id}:${o.label}`).join('|');
  useEffect(() => {
    if (labels?.length) setKnown(prev => ({ ...prev, ...Object.fromEntries(labels.map(o => [String(o.id), o.label])) }));
  }, [labelsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load (and search) options while the list is open
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timer = window.setTimeout(() => {
      api<{ results: Option[] }>(`/models/${target}/options/`, { query: { q: query } })
        .then(res => {
          setOptions(res.results);
          setKnown(prev => ({ ...prev, ...Object.fromEntries(res.results.map(o => [String(o.id), o.label])) }));
        })
        .catch(() => setOptions([]))
        .finally(() => setLoading(false));
    }, query ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [open, query, target]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!boxRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // The list is portalled to <body> so cards with overflow-hidden / backdrop-filter can't clip it.
  // Position it under the field (or above, when there isn't room) and follow scrolling/resizing.
  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle({ position: 'fixed', visibility: 'hidden', top: 0, left: 0 });
      return;
    }
    const place = () => {
      const rect = boxRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom;
      const up = below < 320 && rect.top > below;
      setPanelStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        ...(up ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
        maxHeight: Math.max(180, Math.min(360, (up ? rect.top : below) - 16)),
      });
    };
    place();
    searchRef.current?.focus({ preventScroll: true });
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  const choose = (opt: Option) => {
    const key = String(opt.id);
    if (multiple) {
      const next = selected.includes(key) ? selected.filter(v => v !== key) : [...selected, key];
      onChange(next.map(v => (/^\d+$/.test(v) ? Number(v) : v)));
    } else {
      onChange(opt.id);
      setOpen(false);
    }
  };

  const remove = (key: string) => {
    if (multiple) onChange(selected.filter(v => v !== key).map(v => (/^\d+$/.test(v) ? Number(v) : v)));
    else onChange(null);
  };

  return (
    <div ref={boxRef} className="relative">
      <div
        id={id}
        role="combobox"
        aria-expanded={open}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen(o => !o)}
        onKeyDown={e => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`input flex min-h-[2.5rem] flex-wrap items-center gap-1.5 cursor-pointer ${invalid ? 'input-error' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {selected.length === 0 && <span className="text-muted/80">{multiple ? 'Choose…' : '---------'}</span>}
        {selected.map(key =>
          multiple ? (
            <span key={key} className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-ink">
              {known[key] ?? `#${key}`}
              {!disabled && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    remove(key);
                  }}
                  aria-label={`Remove ${known[key] ?? key}`}
                  className="text-muted hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ) : (
            <span key={key} className="flex-1 truncate">{known[key] ?? `#${key}`}</span>
          ),
        )}
        <span className="ml-auto flex items-center gap-1">
          {!multiple && selected.length > 0 && !required && !disabled && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onChange(null);
              }}
              aria-label="Clear"
              className="text-muted hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-muted" />
        </span>
      </div>

      {open && createPortal(
        <div
          ref={panelRef}
          style={panelStyle}
          className="z-[100] flex flex-col rounded-2xl border border-line bg-surface p-2 shadow-2xl animate-[pop-in_.15s_ease-out_both]"
        >
          <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="input mb-2" />
          <ul className="min-h-0 flex-1 overflow-y-auto" role="listbox" aria-multiselectable={multiple}>
            {loading && [0, 1, 2].map(i => <li key={i} className="skeleton mb-1.5 h-9" />)}
            {!loading && options.length === 0 && <li className="px-3 py-2 text-sm text-muted">No results.</li>}
            {!loading &&
              options.map(opt => {
                const active = selected.includes(String(opt.id));
                // "Name - Position" style labels get a two-line layout
                const [main, ...rest] = opt.label.split(' - ');
                const sub = rest.join(' - ');
                const initials = main.replace(/^(dr|mr|mrs|ms|eng)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => choose(opt)}
                      className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${active ? 'bg-accent/15' : 'hover:bg-accent/10'}`}
                    >
                      <span className="chip-icon h-8 w-8 shrink-0 !rounded-full text-[11px] font-bold text-accent">{initials || '#'}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate ${active ? 'font-semibold text-accent' : 'font-medium text-ink'}`}>{main}</span>
                        {sub && <span className="block truncate text-xs text-muted">{sub}</span>}
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0 text-accent" />}
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
}
