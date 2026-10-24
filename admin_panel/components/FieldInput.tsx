'use client';

import { mediaUrl } from '@/lib/api';
import type { FieldDesc, Option, Value } from '@/lib/types';
import RelationPicker from './RelationPicker';

type Props = {
  desc: FieldDesc;
  value: Value;
  onChange: (value: Value) => void;
  labels?: Option[];
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  /** Pending upload for file fields */
  file?: File | null;
  onFile?: (file: File | null) => void;
  clear?: boolean;
  onClear?: (clear: boolean) => void;
  compact?: boolean;
};

/** Input for one Django form field, chosen by the type the API reports. */
export default function FieldInput({ desc, value, onChange, labels, disabled, invalid, id, file, onFile, clear, onClear, compact }: Props) {
  const off = disabled || desc.disabled;
  const cls = `input ${invalid ? 'input-error' : ''}`;
  const common = { id, disabled: off, 'aria-invalid': invalid || undefined };

  switch (desc.type) {
    case 'boolean':
      return (
        <input
          {...common}
          type="checkbox"
          checked={Boolean(value)}
          onChange={e => onChange(e.target.checked)}
          className="h-5 w-5 rounded border-line accent-[rgb(var(--accent))]"
        />
      );
    case 'textarea':
      return <textarea {...common} rows={compact ? 2 : 5} value={value ?? ''} onChange={e => onChange(e.target.value)} className={`${cls} resize-y`} />;
    case 'json':
      return (
        <textarea
          {...common}
          rows={compact ? 2 : 5}
          value={typeof value === 'string' ? value : value === null || value === undefined ? '' : JSON.stringify(value, null, 2)}
          onChange={e => onChange(e.target.value)}
          className={`${cls} font-mono`}
        />
      );
    case 'select':
      return (
        <select {...common} value={value === null || value === undefined ? '' : String(value)} onChange={e => onChange(e.target.value)} className={cls}>
          {(desc.choices ?? []).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      );
    case 'fk':
    case 'm2m':
      return (
        <RelationPicker
          id={id}
          target={desc.target!}
          multiple={desc.type === 'm2m'}
          value={value}
          labels={labels}
          onChange={onChange}
          disabled={off}
          required={desc.required}
          invalid={invalid}
        />
      );
    case 'integer':
      return <input {...common} type="number" step={1} value={value ?? ''} onChange={e => onChange(e.target.value)} className={cls} />;
    case 'decimal':
      return <input {...common} type="number" step="any" value={value ?? ''} onChange={e => onChange(e.target.value)} className={cls} />;
    case 'date':
      return <input {...common} type="date" value={value ?? ''} onChange={e => onChange(e.target.value)} className={cls} />;
    case 'datetime':
      return <input {...common} type="datetime-local" value={value ?? ''} onChange={e => onChange(e.target.value)} className={cls} />;
    case 'time':
      return <input {...common} type="time" value={value ?? ''} onChange={e => onChange(e.target.value)} className={cls} />;
    case 'password':
      return <input {...common} type="password" autoComplete="new-password" value={value ?? ''} onChange={e => onChange(e.target.value)} className={cls} />;
    case 'email':
      return <input {...common} type="email" value={value ?? ''} onChange={e => onChange(e.target.value)} className={cls} maxLength={desc.max_length} />;
    case 'url':
      return <input {...common} type="url" value={value ?? ''} onChange={e => onChange(e.target.value)} className={cls} maxLength={desc.max_length} />;
    case 'file': {
      const current = value as { name: string; url: string | null } | null;
      return (
        <div className="space-y-2">
          {current && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {desc.image && current.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(current.url)} alt="" className="h-14 w-14 rounded-lg object-cover border border-line" />
              )}
              <span className="text-muted">Currently:</span>
              <a href={mediaUrl(current.url)} target="_blank" rel="noopener noreferrer" className="link break-all">{current.name}</a>
              {!desc.required && onClear && (
                <label className="inline-flex items-center gap-1.5 text-muted">
                  <input type="checkbox" checked={Boolean(clear)} onChange={e => onClear(e.target.checked)} disabled={off} /> Clear
                </label>
              )}
            </div>
          )}
          <input
            {...common}
            type="file"
            onChange={e => onFile?.(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-accent hover:file:bg-accent/20"
          />
          {file && <div className="text-xs text-muted">Selected: {file.name}</div>}
        </div>
      );
    }
    default:
      return <input {...common} type="text" value={value ?? ''} onChange={e => onChange(e.target.value)} className={cls} maxLength={desc.max_length} />;
  }
}
