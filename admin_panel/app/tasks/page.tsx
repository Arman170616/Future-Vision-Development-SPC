'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Hourglass, ListTodo, Pencil, Plus, Search, Trash2, XCircle } from 'lucide-react';
import CountUp from '@/components/CountUp';
import Shell from '@/components/Shell';
import { ApiError, api, editHref } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useMessages } from '@/lib/messages';
import type { Cell, ChangeList } from '@/lib/types';

const MODEL = 'tasks.task';

interface Summary {
  total: number;
  by_frequency: Record<string, number>;
  pending_approval: number;
  in_progress: number;
  overdue: number;
  due_this_week: number;
  can_approve: boolean;
}

const FREQUENCIES = [
  { value: '', label: 'All' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'once', label: 'One-time' },
];

const text = (cell?: Cell) => (cell?.text && cell.text !== '-' ? cell.text : '');

// Badge colours keyed by the choice labels Django returns
const badge: Record<string, string> = {
  'Not started': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'In progress': 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  'On hold': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  Cancelled: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  'Pending approval': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  Approved: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Medium: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
  Urgent: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

const Badge = ({ label }: { label: string }) =>
  label ? <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[label] ?? 'bg-accent/10 text-accent'}`}>{label}</span> : <span className="text-muted">-</span>;

function TasksPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { push } = useMessages();
  const { user } = useAuth();
  const isMember = Boolean(user?.team_member && !user.is_superuser);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [data, setData] = useState<ChangeList | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState(params.get('q') ?? '');

  const frequency = params.get('f_frequency') ?? '';
  const query = useMemo(() => Object.fromEntries(params.entries()), [params]);

  const load = useCallback(() => {
    setError('');
    Promise.all([api<Summary>('/tasks/summary/'), api<ChangeList>(`/models/${MODEL}/`, { query })])
      .then(([s, list]) => {
        setSummary(s);
        setData(list);
        setSelected(new Set());
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load tasks.'));
  }, [query]);

  useEffect(load, [load]);
  useEffect(() => setSearch(params.get('q') ?? ''), [params]);

  const go = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    if (!('p' in changes)) next.delete('p');
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    router.push(`/tasks/?${next.toString()}`);
  };

  const runAction = async (action: string, ids: (string | number)[], confirmText?: string) => {
    if (!ids.length || (confirmText && !window.confirm(confirmText))) return;
    setBusy(true);
    try {
      const res = await api<{ messages: string[] }>(`/models/${MODEL}/action/`, { json: { action, ids } });
      res.messages.forEach(m => push(m));
      load();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Action failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const deleteTask = async (id: string | number, name: string) => {
    if (!window.confirm(`Delete the task “${name}”? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await api<{ detail: string }>(`/models/${MODEL}/${id}/`, { method: 'DELETE' });
      push(res.detail);
      load();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Delete failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const filter = (name: string) => data?.filters.find(f => f.name === name);
  const canApprove = Boolean(summary?.can_approve);
  const canAdd = Boolean(data?.model.perms.add);
  const canDelete = Boolean(data?.model.perms.delete);
  const ids = data?.rows.map(r => String(r.id)) ?? [];
  const allSelected = ids.length > 0 && ids.every(id => selected.has(id));

  const stats = summary
    ? [
        { label: 'Total tasks', value: summary.total, icon: ListTodo, tone: 'text-accent', onClick: () => router.push('/tasks/') },
        { label: 'Pending approval', value: summary.pending_approval, icon: Hourglass, tone: 'text-amber-600', onClick: () => go({ f_approval_status: 'pending' }) },
        { label: 'In progress', value: summary.in_progress, icon: Clock, tone: 'text-sky-600', onClick: () => go({ f_status: 'in_progress' }) },
        { label: 'Due this week', value: summary.due_this_week, icon: CalendarDays, tone: 'text-violet-600', onClick: undefined },
        { label: 'Overdue', value: summary.overdue, icon: AlertTriangle, tone: 'text-red-600', onClick: undefined },
      ]
    : [];

  const actionsFor = (row: ChangeList['rows'][number], compact = false) => {
    const approval = text(row.cells.approval_status);
    return (
      <div className={`flex items-center gap-1 ${compact ? '' : 'justify-end'}`}>
        {canApprove && approval !== 'Approved' && (
          <button onClick={() => runAction('approve_tasks', [row.id])} disabled={busy} title="Approve" className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950">
            <CheckCircle2 className="h-4 w-4" />
          </button>
        )}
        {canApprove && approval !== 'Rejected' && (
          <button onClick={() => runAction('reject_tasks', [row.id])} disabled={busy} title="Reject" className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
            <XCircle className="h-4 w-4" />
          </button>
        )}
        <Link href={editHref(MODEL, row.id)} title="Edit" className="rounded-lg p-2 text-accent hover:bg-accent/10">
          <Pencil className="h-4 w-4" />
        </Link>
        {canDelete && (
          <button onClick={() => deleteTask(row.id, row.str)} disabled={busy} title="Delete" className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  const endCell = (row: ChangeList['rows'][number]) => {
    const overdue = row.cells.overdue?.bool;
    return (
      <span className={overdue ? 'font-semibold text-red-600' : ''}>
        {text(row.cells.end_date) || '—'}
        {overdue && <span className="ml-1.5 text-xs">(overdue)</span>}
      </span>
    );
  };

  return (
    <Shell
      crumbs={[{ label: isMember ? 'My tasks' : 'Tasks' }]}
      title={isMember ? 'My tasks' : 'Tasks'}
      actions={
        canAdd && (
          <Link href={editHref(MODEL)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add task
          </Link>
        )
      }
    >
      {error && <div className="card mb-4 p-4 text-sm text-red-600">{error}</div>}

      {/* Summary */}
      <div className="stagger mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, tone, onClick }) => (
          <button key={label} onClick={onClick} disabled={!onClick} className="card card-hover p-4 text-left disabled:cursor-default disabled:hover:transform-none">
            <span className="flex items-start justify-between gap-2">
              <span className="text-3xl font-bold leading-none"><CountUp value={value} /></span>
              <span className="chip-icon h-9 w-9 shrink-0"><Icon className={`h-4 w-4 ${tone}`} /></span>
            </span>
            <span className="mt-2 block text-xs font-medium text-muted">{label}</span>
          </button>
        ))}
      </div>

      {/* Frequency bar */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1.5 [scrollbar-width:none]">
        {FREQUENCIES.map(f => {
          const count = f.value ? summary?.by_frequency[f.value] ?? 0 : summary?.total ?? 0;
          const active = frequency === f.value;
          return (
            <button
              key={f.value || 'all'}
              onClick={() => go({ f_frequency: f.value || null })}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${active ? 'bg-accent' : 'text-ink hover:bg-accent/10'}`}
              style={active ? { color: 'rgb(var(--on-accent))' } : undefined}
            >
              {f.label}
              <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/25' : 'bg-canvas text-muted'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="card mb-4 flex flex-wrap items-center gap-2 p-3">
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            go({ q: search.trim() || null });
          }}
          className="relative min-w-[12rem] flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search task name, client, notes…" className="input pl-9" />
        </form>
        {(['status', 'approval_status', 'priority'] as const).map(name => {
          const f = filter(name);
          if (!f) return null;
          return (
            <select key={name} value={f.value} onChange={e => go({ [`f_${name}`]: e.target.value || null })} className="input !w-auto">
              <option value="">{name === 'approval_status' ? 'Any approval' : `Any ${f.label.toLowerCase()}`}</option>
              {f.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          );
        })}
        {[...params.keys()].length > 0 && (
          <button onClick={() => router.push('/tasks/')} className="text-sm link">Clear</button>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="card mb-4 flex flex-wrap items-center gap-2 p-3 text-sm">
          <span className="mr-auto font-medium">{selected.size} selected</span>
          {canApprove && (
            <>
              <button onClick={() => runAction('approve_tasks', [...selected])} disabled={busy} className="btn-ghost text-green-700 dark:text-green-400"><CheckCircle2 className="h-4 w-4" /> Approve</button>
              <button onClick={() => runAction('reject_tasks', [...selected])} disabled={busy} className="btn-ghost text-red-600"><XCircle className="h-4 w-4" /> Reject</button>
            </>
          )}
          <button onClick={() => runAction('mark_completed', [...selected])} disabled={busy} className="btn-ghost">Mark completed</button>
          {canDelete && (
            <button onClick={() => runAction('delete_selected', [...selected], `Delete ${selected.size} task(s)? This cannot be undone.`)} disabled={busy} className="btn-danger"><Trash2 className="h-4 w-4" /> Delete</button>
          )}
        </div>
      )}

      {!data && !error && <div className="space-y-3">{[0, 1, 2, 3, 4].map(i => <div key={i} className="skeleton h-14" />)}</div>}
      {data && data.rows.length === 0 && (
        <div className="card p-10 text-center">
          <ListTodo className="mx-auto mb-3 h-10 w-10 text-muted" />
          <p className="font-semibold">No tasks here yet</p>
          {canAdd && <Link href={editHref(MODEL)} className="btn-primary mt-4"><Plus className="h-4 w-4" /> Add task</Link>}
        </div>
      )}

      {data && data.rows.length > 0 && (
        <>
          {/* Table (tablet & desktop) */}
          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th w-10">
                    <input type="checkbox" aria-label="Select all" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(ids))} />
                  </th>
                  <th className="th">Task name</th>
                  <th className="th">Client</th>
                  <th className="th">Frequency</th>
                  <th className="th">Start date</th>
                  <th className="th">End date</th>
                  <th className="th">Status</th>
                  <th className="th">Priority</th>
                  <th className="th">Approval</th>
                  <th className="th hidden 2xl:table-cell">Assigned to</th>
                  <th className="th text-right sticky right-0 !bg-[rgb(var(--surface))] shadow-[-8px_0_12px_-10px_rgba(0,0,0,0.25)]">Actions</th>
                </tr>
              </thead>
              <tbody className="stagger">
                {data.rows.map(row => {
                  const id = String(row.id);
                  return (
                    <tr key={id} className={selected.has(id) ? 'bg-accent/5' : 'hover:bg-accent/5'}>
                      <td className="td">
                        <input
                          type="checkbox"
                          aria-label={`Select ${row.str}`}
                          checked={selected.has(id)}
                          onChange={() => setSelected(prev => {
                            const next = new Set(prev);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            return next;
                          })}
                        />
                      </td>
                      <td className="td min-w-[12rem]">
                        <Link href={editHref(MODEL, row.id)} className="font-semibold text-accent hover:underline">{row.str}</Link>
                      </td>
                      <td className="td">{text(row.cells.client) || <span className="text-muted">-</span>}</td>
                      <td className="td whitespace-nowrap">{text(row.cells.frequency)}</td>
                      <td className="td whitespace-nowrap">{text(row.cells.start_date)}</td>
                      <td className="td whitespace-nowrap">{endCell(row)}</td>
                      <td className="td"><Badge label={text(row.cells.status)} /></td>
                      <td className="td"><Badge label={text(row.cells.priority)} /></td>
                      <td className="td"><Badge label={text(row.cells.approval_status)} /></td>
                      <td className="td whitespace-nowrap hidden 2xl:table-cell">{text(row.cells.assigned_to) || <span className="text-muted">-</span>}</td>
                      <td className="td sticky right-0 bg-surface shadow-[-8px_0_12px_-10px_rgba(0,0,0,0.25)]">{actionsFor(row)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards (phones) */}
          <div className="stagger space-y-3 md:hidden">
            {data.rows.map(row => (
              <div key={row.id} className="card p-4">
                <div className="mb-2 flex items-start gap-2">
                  <Link href={editHref(MODEL, row.id)} className="mr-auto font-semibold text-accent">{row.str}</Link>
                  <Badge label={text(row.cells.approval_status)} />
                </div>
                {text(row.cells.client) && <div className="mb-2 text-sm text-muted">{text(row.cells.client)}</div>}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <Badge label={text(row.cells.frequency)} />
                  <Badge label={text(row.cells.status)} />
                  <Badge label={text(row.cells.priority)} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{text(row.cells.start_date)} → {endCell(row)}</span>
                  {actionsFor(row, true)}
                </div>
              </div>
            ))}
          </div>

          {data.num_pages > 1 && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <button onClick={() => go({ p: String(data.page - 1) })} disabled={data.page <= 1} className="btn-ghost !px-2" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
              <span>Page {data.page} of {data.num_pages}</span>
              <button onClick={() => go({ p: String(data.page + 1) })} disabled={data.page >= data.num_pages} className="btn-ghost !px-2" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
          <p className="mt-3 text-xs text-muted">{data.count} task{data.count === 1 ? '' : 's'}{canApprove ? '' : ' · Only administrators can approve tasks.'}</p>
        </>
      )}
    </Shell>
  );
}

export default function Page() {
  return (
    <Suspense>
      <TasksPage />
    </Suspense>
  );
}
