'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Plus, Wallet } from 'lucide-react';
import { api, editHref, formatMoney } from '@/lib/api';

interface Summary {
  scope_total: string;
  scope_count: number;
  categories: { key: string; label: string; value: string }[];
}

/** What a project has cost so far (AI usage, servers, …), shown beside the project form. */
export default function ProjectCosts({ projectId }: { projectId: number | string }) {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    api<Summary>('/expenses/stats/', { query: { period: 'yearly', project: projectId } }).then(setData).catch(() => undefined);
  }, [projectId]);

  const top = Math.max(1, ...(data?.categories.map(c => Number(c.value)) ?? [1]));

  return (
    <section className="card overflow-hidden">
      <h2 className="card-head flex items-center gap-2 !text-sm"><Wallet className="h-4 w-4" /> Project costs</h2>
      <div className="space-y-4 p-5">
        {!data && <div className="skeleton h-24" />}
        {data && (
          <>
            <div>
              <div className="text-2xl font-bold">{formatMoney(data.scope_total)} <span className="text-xs font-medium text-muted">OMR</span></div>
              <div className="text-xs text-muted">{data.scope_count} cost{data.scope_count === 1 ? '' : 's'} recorded · all time</div>
            </div>
            {data.categories.length > 0 && (
              <ul className="space-y-2">
                {data.categories.map(c => (
                  <li key={c.key} className="text-xs">
                    <div className="flex justify-between gap-2"><span className="text-muted">{c.label}</span><span className="font-semibold">{formatMoney(c.value)}</span></div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-line/60">
                      <div className="h-full rounded-full" style={{ width: `${(Number(c.value) / top) * 100}%`, background: 'linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent-2)))' }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-2">
              <Link href={`/expenses/?type=project&project=${projectId}`} className="btn-ghost justify-start"><ArrowRight className="h-4 w-4" /> See all costs</Link>
              <Link href={editHref('expenses.expense')} className="btn-ghost justify-start"><Plus className="h-4 w-4" /> Add a cost (choose this project)</Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
