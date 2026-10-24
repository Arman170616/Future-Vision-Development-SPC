'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import {
  Pencil, Plus, Eye, Trash2, PlusCircle, PenLine, CalendarDays, FolderKanban, GraduationCap, Newspaper,
  Briefcase, Users, ShieldCheck, ListTodo, Hourglass, AlertTriangle, Clock, ArrowRight, LayoutGrid, Wallet, CheckCircle2, type LucideIcon,
} from 'lucide-react';
import AnimatedMoney from '@/components/AnimatedMoney';
import CountUp from '@/components/CountUp';
import Shell from '@/components/Shell';
import { api, editHref, listHref, timeAgo } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface TaskSummary {
  total: number;
  pending_approval: number;
  in_progress: number;
  overdue: number;
  due_this_week: number;
  completed: number;
  can_approve: boolean;
}

const APP_ICONS: Record<string, LucideIcon> = {
  activities: CalendarDays,
  auth: ShieldCheck,
  blog: Newspaper,
  careers: Briefcase,
  courses: GraduationCap,
  expenses: Wallet,
  projects: FolderKanban,
  tasks: ListTodo,
  teams: Users,
};

function Dashboard() {
  const { index, refreshIndex, user } = useAuth();
  const [tasks, setTasks] = useState<TaskSummary | null>(null);
  const [monthSpend, setMonthSpend] = useState<number | null>(null);
  const isMember = Boolean(user?.team_member && !user.is_superuser);

  // Recent actions and task counts change as you work; refresh whenever the dashboard is opened
  useEffect(() => {
    if (!user) return;
    refreshIndex().catch(() => undefined);
    api<TaskSummary>('/tasks/summary/').then(setTasks).catch(() => setTasks(null));
    if (user.is_superuser) {
      api<{ tiles: { month: string } }>('/expenses/stats/', { query: { period: 'monthly' } })
        .then(res => setMonthSpend(Number(res.tiles.month)))
        .catch(() => setMonthSpend(null));
    }
  }, [user, refreshIndex]);

  const canAdd = (key: string) => Boolean(index?.apps.some(app => app.models.some(m => m.key === key && m.perms.add)));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const actionIcon = { add: PlusCircle, change: PenLine, delete: Trash2 };
  const modelCount = index?.apps.reduce((n, app) => n + app.models.length, 0) ?? 0;

  const tiles = tasks
    ? [
        { label: isMember ? 'My tasks' : 'Total tasks', value: tasks.total, icon: ListTodo, href: '/tasks/' },
        isMember
          ? { label: 'Completed', value: tasks.completed, icon: CheckCircle2, href: '/tasks/?f_status=completed' }
          : { label: 'Pending approval', value: tasks.pending_approval, icon: Hourglass, href: '/tasks/?f_approval_status=pending', alert: tasks.can_approve && tasks.pending_approval > 0 },
        { label: 'In progress', value: tasks.in_progress, icon: Clock, href: '/tasks/?f_status=in_progress' },
        { label: 'Overdue', value: tasks.overdue, icon: AlertTriangle, href: '/tasks/', alert: tasks.overdue > 0 },
      ]
    : [];

  return (
    <Shell title="Site administration">
      {/* Welcome banner */}
      <section className="card relative mb-6 overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 right-40 h-56 w-56 rounded-full bg-gradient-to-tr from-[rgb(var(--accent-2)/0.25)] to-transparent blur-2xl" />
        <div className="relative flex flex-wrap items-end gap-6">
          <div className="mr-auto">
            <p className="mb-1 flex items-center gap-2 text-sm text-muted">
              <span className="live-dot" /> {today}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {greeting}, <span className="text-gradient">{user?.name}</span>
            </h2>
            <p className="mt-1 text-muted">
              {isMember ? `Here are the tasks assigned to you, ${user?.team_member?.position ?? ''}.`.replace(', .', '.') : 'Here’s what’s happening across FutureInnvo today.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isMember && <Link href="/tasks/" className="btn-primary"><ListTodo className="h-4 w-4" /> Open my tasks</Link>}
            {canAdd('tasks.task') && <Link href={editHref('tasks.task')} className="btn-primary"><Plus className="h-4 w-4" /> New task</Link>}
            {canAdd('expenses.expense') && <Link href={editHref('expenses.expense')} className="btn-ghost"><Wallet className="h-4 w-4" /> Add expense</Link>}
            {canAdd('courses.course') && <Link href={editHref('courses.course')} className="btn-ghost"><GraduationCap className="h-4 w-4" /> Add course</Link>}
          </div>
        </div>

        {tiles.length > 0 && (
          <div className={`stagger relative mt-6 grid grid-cols-2 gap-3 ${monthSpend !== null ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
            {tiles.map(({ label, value, icon: Icon, href, alert }) => (
              <Link key={label} href={href} className="card card-hover group flex items-center gap-3 p-4">
                <span className={`chip-icon h-11 w-11 shrink-0 ${alert ? '!bg-red-500/15 !shadow-none' : ''}`}>
                  <Icon className={`h-5 w-5 ${alert ? 'text-red-500' : 'text-accent'}`} />
                </span>
                <span className="min-w-0">
                  <span className={`block text-2xl font-bold leading-none ${alert ? 'text-red-500' : ''}`}><CountUp value={value} /></span>
                  <span className="mt-1 block truncate text-xs text-muted">{label}</span>
                </span>
              </Link>
            ))}
            {monthSpend !== null && (
              <Link href="/expenses/" className="card card-hover col-span-2 flex items-center gap-3 p-4 lg:col-span-1">
                <span className="chip-icon h-11 w-11 shrink-0"><Wallet className="h-5 w-5 text-accent" /></span>
                <span className="min-w-0">
                  <span className="block text-xl font-bold leading-none"><AnimatedMoney value={monthSpend} /> <span className="text-xs font-medium text-muted">OMR</span></span>
                  <span className="mt-1 block truncate text-xs text-muted">Expenses this month</span>
                </span>
              </Link>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
            <LayoutGrid className="h-4 w-4" /> Manage content <span className="font-medium normal-case tracking-normal">· {modelCount} sections</span>
          </h2>
          {!index && (
            <div className="grid gap-5 md:grid-cols-2">
              {[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-40" />)}
            </div>
          )}
          <div className="stagger grid content-start gap-5 md:grid-cols-2">
            {index?.apps.map(app => {
              const Icon = APP_ICONS[app.app_label] ?? LayoutGrid;
              return (
                <section key={app.app_label} className="card card-hover overflow-hidden">
                  <h3 className="card-head flex items-center gap-2.5">
                    <span className="chip-icon h-7 w-7"><Icon className="h-4 w-4" /></span>
                    {app.name}
                  </h3>
                  <ul>
                    {app.models.map(model => (
                      <li key={model.key} className="group flex items-center gap-2 border-t border-line/70 px-5 py-2.5 transition-colors hover:bg-accent/5">
                        <Link href={listHref(model.key)} className="mr-auto inline-flex items-center gap-1.5 font-medium hover:text-accent">
                          {model.name}
                          <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </Link>
                        {model.perms.add && (
                          <Link href={editHref(model.key)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-green-700 hover:bg-green-500/10 dark:text-green-400">
                            <Plus className="h-3.5 w-3.5" /> Add
                          </Link>
                        )}
                        <Link href={listHref(model.key)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-accent hover:bg-accent/10">
                          {model.view_only ? <><Eye className="h-3.5 w-3.5" /> View</> : <><Pencil className="h-3.5 w-3.5" /> Change</>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>

        <aside className="card h-fit p-5 xl:sticky xl:top-24">
          <h2 className="mb-1 text-lg font-bold">Recent actions</h2>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">My actions</h3>
          {!index?.recent_actions.length && <p className="text-sm text-muted">None available</p>}
          <ol className="stagger relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-line">
            {index?.recent_actions.map((entry, i) => {
              const Icon = actionIcon[entry.action];
              const tone = entry.action === 'delete' ? 'text-red-500 bg-red-500/10' : entry.action === 'add' ? 'text-green-600 bg-green-500/10' : 'text-accent bg-accent/10';
              const linkable = entry.action !== 'delete' && entry.model_key;
              return (
                <li key={i} className="relative flex gap-3 text-sm">
                  <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-[rgb(var(--surface))] ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 pt-1">
                    {linkable ? (
                      <Link href={editHref(entry.model_key!, entry.object_id)} className="break-words font-medium hover:text-accent">{entry.object_repr}</Link>
                    ) : (
                      <span className="break-words font-medium line-through decoration-muted/50">{entry.object_repr}</span>
                    )}
                    <div className="text-xs text-muted">{entry.model_name} · {timeAgo(entry.time)}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </Shell>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
