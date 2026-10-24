'use client';

import { CheckCircle2, CircleHelp, XCircle } from 'lucide-react';
import { mediaUrl } from '@/lib/api';
import type { Cell } from '@/lib/types';

export function BoolIcon({ value }: { value: boolean | null | undefined }) {
  if (value === null || value === undefined) return <CircleHelp className="h-5 w-5 text-muted" aria-label="Unknown" />;
  return value ? (
    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" aria-label="Yes" />
  ) : (
    <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" aria-label="No" />
  );
}

/** Renders a list_display / readonly value from the API. `html` only comes from ModelAdmin display methods (format_html). */
export default function CellView({ cell }: { cell: Cell | undefined }) {
  if (!cell) return <span className="text-muted">-</span>;
  if ('bool' in cell) return <BoolIcon value={cell.bool} />;
  if (cell.file) {
    return (
      <a href={mediaUrl(cell.file.url)} target="_blank" rel="noopener noreferrer" className="link break-all">
        {cell.file.name}
      </a>
    );
  }
  if (cell.html !== undefined) return <span className="[&_img]:inline-block" dangerouslySetInnerHTML={{ __html: cell.html }} />;
  return <span className={cell.text === '-' ? 'text-muted' : ''}>{cell.text}</span>;
}
