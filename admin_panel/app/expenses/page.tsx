'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarClock, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, FileText, Pencil, Plus, Receipt,
  CalendarCheck, Divide, FolderKanban, HandCoins, Layers, PauseCircle, PenLine, Repeat, Search, Trash2, TrendingUp, Wallet, X,
} from 'lucide-react';
import AnimatedMoney from '@/components/AnimatedMoney';
import BarChart, { Bar } from '@/components/BarChart';
import DonutChart from '@/components/DonutChart';
import ExpenseRequests from '@/components/ExpenseRequests';
import Shell from '@/components/Shell';
import { api, editHref, formatMoney, mediaUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useMessages } from '@/lib/messages';
import type { Cell, ChangeList } from '@/lib/types';

const MODEL = 'expenses.expense';
const FIXED_MODEL = 'expenses.recurringexpense';
type Period = 'daily' | 'monthly' | 'yearly';

interface Stats {
  currency: string;
  period: Period;
  year: number;
  month: number;
  scope_label: string;
  scope_total: string;
  scope_count: number;
  scope_per_day: string | null;
  scope_days: number;
  tiles: { today: string; week: string; month: string; month_per_day: string; month_days: number; year: string; all_time: string; count: number };
  series: { key: string; label: string; title: string; value: string; per_day?: string; days?: number; params: Record<string, string> }[];
  fixed: FixedCost[];
  projects: { id: number; title: string; total: string; count: number; categories: { label: string; value: string }[] }[];
  type_counts: { all: number; normal?: number; fixed?: number; request?: number; project: number; pending_requests: number };
  fixed_totals: { monthly: string; per_day: string; days: number };
  categories: { key: string; label: string; value: string; count: number }[];
  years: number[];
}

interface FixedCost {
  id: number;
  title: string;
  category: string;
  amount: string;
  frequency: 'monthly' | 'yearly';
  schedule: string;
  monthly: string;
  per_day: string;
  next_date: string | null;
  is_active: boolean;
  booked: number;
}

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

type ExpenseType = 'all' | 'normal' | 'fixed' | 'request' | 'project';

const TYPES: { key: ExpenseType; label: string; icon: typeof Layers; hint: string }[] = [
  { key: 'all', label: 'All', icon: Layers, hint: 'Every expense' },
  { key: 'normal', label: 'Normal', icon: PenLine, hint: 'Entered by hand' },
  { key: 'fixed', label: 'Fixed', icon: Repeat, hint: 'Booked every month' },
  { key: 'request', label: 'Requests', icon: HandCoins, hint: 'Need CEO approval' },
  { key: 'project', label: 'Projects', icon: FolderKanban, hint: 'Costs per project' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const text = (cell?: Cell) => (cell?.text && cell.text !== '-' ? cell.text : '');

function ExpensesPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { push } = useMessages();
  const { user } = useAuth();
  const now = new Date();

  const period = (['daily', 'monthly', 'yearly'].includes(params.get('period') ?? '') ? params.get('period') : 'monthly') as Period;
  const year = Number(params.get('year')) || now.getFullYear();
  const month = Number(params.get('month')) || now.getMonth() + 1;
  const selectedBar = params.get('bar');
  const category = params.get('f_category') ?? '';
  const type = (TYPES.some(t => t.key === params.get('type')) ? params.get('type') : 'all') as ExpenseType;
  const projectId = params.get('project') ?? '';
  // Stats / list scope for the selected type tab
  const scope = useMemo(() => {
    if (type === 'normal' || type === 'fixed' || type === 'request') return { stats: { source: type }, list: { f_source: type } };
    if (type === 'project') return { stats: { project: projectId || 'any' }, list: { f_project: projectId || '__any' } };
    return { stats: {}, list: {} };
  }, [type, projectId]);

  const [stats, setStats] = useState<Stats | null>(null);
  const [list, setList] = useState<ChangeList | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(params.get('q') ?? '');

  // The list follows the chart: whole period by default, or the clicked bar
  const listQuery = useMemo(() => {
    const q: Record<string, string> = {};
    const bar = stats?.series.find(s => s.key === selectedBar);
    if (bar) Object.assign(q, bar.params);
    else if (period === 'daily') Object.assign(q, { dh_y: String(year), dh_m: String(month) });
    else if (period === 'monthly') q.dh_y = String(year);
    if (category) q.f_category = category;
    Object.assign(q, scope.list);
    if (params.get('q')) q.q = params.get('q')!;
    if (params.get('p')) q.p = params.get('p')!;
    return q;
  }, [stats, selectedBar, period, year, month, category, params, scope]);

  const loadStats = useCallback(() => {
    api<Stats>('/expenses/stats/', { query: { period, year, month, ...scope.stats } })
      .then(setStats)
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load expenses.'));
  }, [period, year, month, scope]);

  useEffect(loadStats, [loadStats]);

  useEffect(() => {
    if (!stats) return;
    api<ChangeList>(`/models/${MODEL}/`, { query: listQuery })
      .then(setList)
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load expenses.'));
  }, [stats, listQuery]);

  useEffect(() => setSearch(params.get('q') ?? ''), [params]);

  const go = (changes: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params.toString());
    if (!keepPage) next.delete('p');
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    router.push(`/expenses/?${next.toString()}`);
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    go({ year: String(d.getFullYear()), month: String(d.getMonth() + 1), bar: null });
  };

  const deleteExpense = async (id: string | number, name: string) => {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    try {
      const res = await api<{ detail: string }>(`/models/${MODEL}/${id}/`, { method: 'DELETE' });
      push(res.detail);
      loadStats();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  if (user && !user.is_superuser) {
    return <Shell title="Expenses"><div className="card p-6 text-sm text-muted">Only administrators can view expenses.</div></Shell>;
  }

  const bars: Bar[] =
    stats?.series.map(s => ({
      key: s.key,
      label: s.label,
      title: s.title,
      value: Number(s.value),
      // Monthly / yearly bars: the total spread over the days of that month or year
      note: s.per_day && Number(s.value) > 0 ? `≈ ${formatMoney(s.per_day)} ${stats.currency} / day (÷ ${s.days} days)` : undefined,
    })) ?? [];
  const average =
    stats && period === 'daily' && stats.scope_per_day && Number(stats.scope_per_day) > 0
      ? { value: Number(stats.scope_per_day), label: `Avg ${formatMoney(stats.scope_per_day)} / day` }
      : null;
  const selected = stats?.series.find(s => s.key === selectedBar);
  const listTotal = list?.rows.reduce((sum, r) => sum + Number(text(r.cells.amount).replace(/,/g, '') || 0), 0) ?? 0;
  const currency = stats?.currency ?? 'OMR';

  const tiles = stats
    ? [
        { label: 'Today', value: stats.tiles.today, icon: CalendarClock },
        { label: 'This week', value: stats.tiles.week, icon: CalendarRange },
        { label: 'This month', value: stats.tiles.month, icon: CalendarDays },
        { label: 'Per day this month', value: stats.tiles.month_per_day, icon: Divide, sub: `${currency} · this month ÷ ${stats.tiles.month_days} days` },
        { label: 'This year', value: stats.tiles.year, icon: TrendingUp },
        { label: 'All time', value: stats.tiles.all_time, icon: Wallet },
      ]
    : [];

  return (
    <Shell
      crumbs={[{ label: 'Expenses' }]}
      title="Expenses"
      actions={<Link href={editHref(MODEL)} className="btn-primary"><Plus className="h-4 w-4" /> Add expense</Link>}
    >
      {error && <div className="card mb-4 p-4 text-sm text-red-600">{error}</div>}

      {/* Totals */}
      {!stats && <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">{[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-24" />)}</div>}
      {stats && (
        <div className="stagger mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
          {tiles.map(({ label, value, icon: Icon, sub }) => (
            <div key={label} className={`card card-hover p-4 ${sub ? 'ring-1 ring-sky-500/30' : ''}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">{label}</span>
                <span className="chip-icon h-8 w-8"><Icon className="h-4 w-4 text-accent" /></span>
              </div>
              <div className="text-xl font-bold leading-none"><AnimatedMoney value={Number(value)} /></div>
              <div className="mt-1 truncate text-[11px] text-muted">{sub ?? currency}</div>
            </div>
          ))}
        </div>
      )}

      {/* Expense types */}
      <div className="stagger mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {TYPES.map(({ key, label, icon: Icon, hint }) => {
          const active = type === key;
          const count =
            !stats ? null
            : key === 'all' ? stats.type_counts.all
            : key === 'project' ? stats.type_counts.project
            : stats.type_counts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => go({ type: key === 'all' ? null : key, project: null, bar: null, f_category: null })}
              className={`card card-hover relative flex items-center gap-3 p-3 text-left ${active ? '!border-accent/60 ring-2 ring-accent/25' : ''}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'text-[rgb(var(--on-accent))]' : 'chip-icon text-accent'}`}
                style={active ? { background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' } : undefined}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-semibold">
                  {label}
                  {count !== null && <span className="rounded-full bg-line/80 px-1.5 text-[11px] font-bold text-muted">{count}</span>}
                </span>
                <span className="block truncate text-xs text-muted">{hint}</span>
              </span>
              {key === 'request' && stats && stats.type_counts.pending_requests > 0 && (
                <span className="absolute -right-1.5 -top-1.5 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow animate-[pop-in_.3s_both]">
                  {stats.type_counts.pending_requests} waiting
                </span>
              )}
            </button>
          );
        })}
      </div>

      {type === 'request' && (
        <div className="mb-6">
          <ExpenseRequests onDecided={loadStats} />
          <p className="mt-3 text-xs text-muted">Below: approved requests that were added to expenses.</p>
        </div>
      )}

      {type === 'project' && stats && (
        <section className="mb-6">
          {stats.projects.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">
              <FolderKanban className="mx-auto mb-2 h-8 w-8 opacity-50" />
              No project costs yet. Choose a <strong className="text-ink">Project</strong> when adding an expense, a fixed cost or a request (e.g. AI usage or servers for Midad School).
            </div>
          ) : (
            <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {stats.projects.map(pr => {
                const active = projectId === String(pr.id);
                const top = Math.max(...pr.categories.map(c => Number(c.value)), 1);
                return (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => go({ project: active ? null : String(pr.id), bar: null })}
                    className={`card card-hover p-4 text-left ${active ? '!border-accent/60 ring-2 ring-accent/25' : projectId ? 'opacity-60' : ''}`}
                  >
                    <div className="mb-2 flex items-start gap-2">
                      <span className="chip-icon h-9 w-9 shrink-0"><FolderKanban className="h-4 w-4 text-accent" /></span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{pr.title}</div>
                        <div className="text-xs text-muted">{pr.count} cost{pr.count === 1 ? '' : 's'} · all time</div>
                      </div>
                    </div>
                    <div className="mb-3 text-2xl font-bold">{formatMoney(pr.total)} <span className="text-xs font-medium text-muted">{currency}</span></div>
                    <ul className="space-y-1.5">
                      {pr.categories.slice(0, 4).map(c => (
                        <li key={c.label} className="text-xs">
                          <div className="flex justify-between gap-2"><span className="truncate text-muted">{c.label}</span><span className="font-semibold">{formatMoney(c.value)}</span></div>
                          <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-line/60">
                            <div className="h-full rounded-full" style={{ width: `${(Number(c.value) / top) * 100}%`, background: 'linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent-2)))' }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          )}
          {projectId && (
            <button type="button" onClick={() => go({ project: null, bar: null })} className="btn-ghost mt-3 !py-1.5 text-xs"><X className="h-3.5 w-3.5" /> All projects</button>
          )}
        </section>
      )}

      {/* Period bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-2xl border border-line bg-[rgb(var(--glass)/0.7)] p-1.5 backdrop-blur">
          {(['daily', 'monthly', 'yearly'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => go({ period: p, bar: null })}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${period === p ? 'shadow' : 'text-ink hover:bg-accent/10'}`}
              style={period === p ? { color: 'rgb(var(--on-accent))', background: 'linear-gradient(120deg, rgb(var(--accent)), rgb(var(--accent-2)))' } : undefined}
            >
              {p}
            </button>
          ))}
        </div>

        {period === 'daily' && (
          <div className="flex items-center gap-1">
            <button onClick={() => shiftMonth(-1)} className="btn-ghost !px-2" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
            <span className="min-w-[9rem] text-center text-sm font-semibold">{MONTHS[month - 1]} {year}</span>
            <button onClick={() => shiftMonth(1)} className="btn-ghost !px-2" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
        {period === 'monthly' && stats && (
          <select value={year} onChange={e => go({ year: e.target.value, bar: null })} className="input !w-auto">
            {stats.years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-6 xl:grid-cols-5">
        <section className="card p-5 xl:col-span-3">
          <div className="mb-4 flex flex-wrap items-baseline gap-2">
            <h2 className="mr-auto text-lg font-bold">
              {period === 'daily' ? 'Daily' : period === 'monthly' ? 'Monthly' : 'Yearly'} expenses
              <span className="ml-2 text-sm font-normal text-muted">{stats?.scope_label}</span>
            </h2>
            {stats && (
              <span className="text-sm">
                <span className="text-muted">Total </span>
                <strong className="text-gradient text-base">{formatMoney(stats.scope_total)} {currency}</strong>
                <span className="text-muted"> · {stats.scope_count} entries</span>
                {stats.scope_per_day && Number(stats.scope_per_day) > 0 && (
                  <span className="ml-2 rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
                    ≈ {formatMoney(stats.scope_per_day)} / day (÷ {stats.scope_days})
                  </span>
                )}
              </span>
            )}
          </div>
          {stats ? (
            <BarChart bars={bars} average={average} activeKey={selectedBar} currency={currency} onSelect={bar => go({ bar: bar.key === selectedBar ? null : bar.key })} />
          ) : (
            <div className="skeleton h-64" />
          )}
        </section>

        <section className="card p-5 xl:col-span-2">
          <h2 className="mb-4 text-lg font-bold">By category <span className="text-sm font-normal text-muted">{stats?.scope_label}</span></h2>
          {stats ? (
            <DonutChart
              slices={stats.categories.map(c => ({ key: c.key, label: c.label, value: Number(c.value) }))}
              total={Number(stats.scope_total)}
              currency={currency}
              activeKey={category || null}
              onSelect={s => go({ f_category: s.key === category ? null : s.key })}
            />
          ) : (
            <div className="skeleton h-48" />
          )}
        </section>
      </div>

      {/* Fixed costs */}
      {(type === 'all' || type === 'fixed') && (
      <section id="fixed" className="card mb-6 scroll-mt-24 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line/70 p-4" style={{ background: 'linear-gradient(90deg, rgb(var(--accent) / 0.08), transparent 70%)' }}>
          <span className="chip-icon h-10 w-10"><Repeat className="h-5 w-5 text-accent" /></span>
          <div className="mr-auto">
            <h2 className="font-bold">Fixed costs</h2>
            <p className="text-xs text-muted">Booked automatically on their day every month · each booked entry can still be edited</p>
          </div>
          {stats && stats.fixed.length > 0 && (
            <div className="text-right text-sm">
              <div><strong className="text-gradient text-base">{formatMoney(stats.fixed_totals.monthly)} {currency}</strong><span className="text-muted"> / month</span></div>
              <div className="text-xs text-muted">≈ {formatMoney(stats.fixed_totals.per_day)} {currency} / day (÷ {stats.fixed_totals.days} days)</div>
            </div>
          )}
          <Link href={editHref(FIXED_MODEL)} className="btn-primary"><Plus className="h-4 w-4" /> Add fixed cost</Link>
        </div>
        {!stats && <div className="grid gap-3 p-4 md:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="skeleton h-28" />)}</div>}
        {stats && stats.fixed.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">
            <Repeat className="mx-auto mb-2 h-8 w-8 opacity-50" />
            No fixed costs yet. Add rent, salaries or subscriptions once — they are booked automatically every month.
          </div>
        )}
        {stats && stats.fixed.length > 0 && (
          <div className="stagger grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {stats.fixed.map(f => (
              <Link
                key={f.id}
                href={editHref(FIXED_MODEL, f.id)}
                className={`card-hover group relative block rounded-2xl border border-line bg-[rgb(var(--surface)/0.7)] p-4 ${f.is_active ? '' : 'opacity-60'}`}
              >
                <div className="mb-3 flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{f.title}</div>
                    <div className="truncate text-xs text-muted">{f.category}</div>
                  </div>
                  {f.is_active ? (
                    <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">{f.schedule}</span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-zinc-500/15 px-2 py-0.5 text-[11px] font-semibold text-muted"><PauseCircle className="h-3 w-3" /> Paused</span>
                  )}
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div className="text-xl font-bold leading-none">{formatMoney(f.amount)} <span className="text-xs font-medium text-muted">{currency}</span></div>
                    <div className="mt-1 text-xs font-medium text-sky-700 dark:text-sky-300">≈ {formatMoney(f.per_day)} / day</div>
                  </div>
                  <Pencil className="h-4 w-4 text-muted opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-line/70 pt-2 text-[11px] text-muted">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  {f.is_active && f.next_date ? `Next: ${shortDate(f.next_date)}` : f.is_active ? 'No more bookings' : 'Not booking'}
                  <span className="ml-auto">{f.booked} booked</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      )}

      {/* List */}
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line/70 p-4">
          <h2 className="mr-auto flex items-center gap-2 font-bold">
            <Receipt className="h-5 w-5 text-accent" />
            {selected ? selected.title : stats?.scope_label ?? 'Expenses'}
            {list && <span className="text-sm font-normal text-muted">· {list.count} · {formatMoney(listTotal)} {currency}{list.num_pages > 1 ? ' on this page' : ''}</span>}
          </h2>
          {selected && <button onClick={() => go({ bar: null })} className="btn-ghost !py-1.5 text-xs"><X className="h-3.5 w-3.5" /> {stats?.scope_label}</button>}
          {category && (
            <button onClick={() => go({ f_category: null })} className="btn-ghost !py-1.5 text-xs">
              <X className="h-3.5 w-3.5" /> {stats?.categories.find(c => c.key === category)?.label ?? category}
            </button>
          )}
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              go({ q: search.trim() || null });
            }}
            className="relative w-full sm:w-64"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, paid to, reference…" className="input pl-9" />
          </form>
        </div>

        {!list && <div className="space-y-2 p-4">{[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div>}
        {list && list.rows.length === 0 && (
          <div className="p-10 text-center">
            <Wallet className="mx-auto mb-3 h-10 w-10 text-muted" />
            <p className="font-semibold">No expenses here</p>
            <Link href={editHref(MODEL)} className="btn-primary mt-4"><Plus className="h-4 w-4" /> Add expense</Link>
          </div>
        )}
        {list && list.rows.length > 0 && (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="th">Date</th>
                    <th className="th">Title</th>
                    <th className="th">Category</th>
                    <th className="th">Paid to</th>
                    <th className="th">Method</th>
                    <th className="th text-right">Amount ({currency})</th>
                    <th className="th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="stagger">
                  {list.rows.map(row => (
                    <tr key={row.id} className="hover:bg-accent/5">
                      <td className="td whitespace-nowrap text-muted">{text(row.cells.date)}</td>
                      <td className="td min-w-[12rem]">
                        <Link href={editHref(MODEL, row.id)} className="font-semibold text-accent hover:underline">{text(row.cells.title)}</Link>
                        {text(row.cells.recurring) && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase text-sky-700 dark:text-sky-300" title={`Booked automatically from “${text(row.cells.recurring)}”`}>
                            <Repeat className="h-3 w-3" /> Fixed
                          </span>
                        )}
                        {text(row.cells.source) === 'Approved request' && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase text-orange-700 dark:text-orange-300" title="Approved expense request">
                            <HandCoins className="h-3 w-3" /> Request
                          </span>
                        )}
                        {text(row.cells.project) && (
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted"><FolderKanban className="h-3 w-3" /> {text(row.cells.project)}</span>
                        )}
                      </td>
                      <td className="td"><span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent whitespace-nowrap">{text(row.cells.category)}</span></td>
                      <td className="td">{text(row.cells.paid_to) || <span className="text-muted">-</span>}</td>
                      <td className="td whitespace-nowrap text-muted">{text(row.cells.payment_method)}</td>
                      <td className="td whitespace-nowrap text-right font-bold">{formatMoney(text(row.cells.amount).replace(/,/g, ''))}</td>
                      <td className="td">
                        <div className="flex items-center justify-end gap-1">
                          {row.cells.receipt?.file && (
                            <a href={mediaUrl(row.cells.receipt.file.url)} target="_blank" rel="noopener noreferrer" title="Receipt" className="rounded-lg p-2 text-muted hover:bg-accent/10 hover:text-accent">
                              <FileText className="h-4 w-4" />
                            </a>
                          )}
                          <Link href={editHref(MODEL, row.id)} title="Edit" className="rounded-lg p-2 text-accent hover:bg-accent/10"><Pencil className="h-4 w-4" /></Link>
                          <button onClick={() => deleteExpense(row.id, text(row.cells.title))} title="Delete" className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phones */}
            <ul className="stagger divide-y divide-line/70 md:hidden">
              {list.rows.map(row => (
                <li key={row.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <Link href={editHref(MODEL, row.id)} className="block truncate font-semibold text-accent">{text(row.cells.title)}</Link>
                    <div className="truncate text-xs text-muted">{text(row.cells.date)} · {text(row.cells.category)}</div>
                  </div>
                  <span className="whitespace-nowrap font-bold">{formatMoney(text(row.cells.amount).replace(/,/g, ''))}</span>
                  <button onClick={() => deleteExpense(row.id, text(row.cells.title))} aria-label="Delete" className="rounded-lg p-2 text-muted hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            {list.num_pages > 1 && (
              <div className="flex items-center gap-2 border-t border-line/70 p-3 text-sm">
                <button onClick={() => go({ p: String(list.page - 1) }, true)} disabled={list.page <= 1} className="btn-ghost !px-2" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
                <span>Page {list.page} of {list.num_pages}</span>
                <button onClick={() => go({ p: String(list.page + 1) }, true)} disabled={list.page >= list.num_pages} className="btn-ghost !px-2" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </>
        )}
      </section>
    </Shell>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ExpensesPage />
    </Suspense>
  );
}
