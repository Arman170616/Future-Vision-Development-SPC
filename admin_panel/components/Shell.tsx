'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, KeyRound, ListTodo, LogOut, Menu, Moon, Plus, Search, Sun, Wallet, X, XCircle, AlertTriangle, Info } from 'lucide-react';
import { SITE_URL, editHref, listHref } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useMessages } from '@/lib/messages';
import Logo from '@/components/Logo';
import NotificationBell from '@/components/NotificationBell';
import { toggleTheme } from '@/lib/theme';

export interface Crumb {
  label: string;
  href?: string;
}

function Messages() {
  const { messages, dismiss } = useMessages();
  if (!messages.length) return null;
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-200 dark:border-green-900',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900',
    info: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900',
  };
  const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
  return (
    <div className="space-y-2 mb-5" role="status" aria-live="polite">
      {messages.map(m => {
        const Icon = icons[m.level];
        return (
          <div key={m.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[m.level]}`}>
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{m.text}</span>
            <button onClick={() => dismiss(m.id)} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { index } = useAuth();
  const params = useSearchParams();
  const pathname = usePathname();
  const current = params.get('model');
  const [filter, setFilter] = useState('');

  const apps = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!index) return [];
    return index.apps
      .map(app => ({ ...app, models: app.models.filter(m => !q || m.name.toLowerCase().includes(q) || app.name.toLowerCase().includes(q)) }))
      .filter(app => app.models.length);
  }, [index, filter]);

  return (
    <nav aria-label="Models" className="space-y-5">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Start typing to filter…" className="input pl-9" />
      </label>
      {apps.map(app => (
        <div key={app.app_label}>
          <div className="px-2 mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
            {app.name}
          </div>
          <ul className="space-y-0.5">
            {app.models.map(model => (
              <li key={model.key} className="group flex items-center">
                <Link
                  href={listHref(model.key)}
                  onClick={onNavigate}
                  className={`relative flex-1 rounded-lg px-3 py-1.5 text-sm transition-all duration-200 ${
                    current === model.key || (model.key === 'tasks.task' && pathname.startsWith('/tasks')) || (model.key === 'expenses.expense' && pathname.startsWith('/expenses'))
                      ? 'bg-gradient-to-r from-accent/20 to-accent/5 text-accent font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-full before:bg-accent'
                      : 'text-ink hover:bg-accent/10 hover:translate-x-0.5'
                  }`}
                >
                  {model.name}
                </Link>
                {model.perms.add && (
                  <Link href={editHref(model.key)} onClick={onNavigate} title={`Add ${model.name}`} className="ml-1 rounded-md p-1 text-muted hover:text-accent hover:bg-accent/10">
                    <Plus className="h-4 w-4" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {index && !apps.length && <p className="px-2 text-sm text-muted">No models match.</p>}
    </nav>
  );
}

export default function Shell({ crumbs = [], title, actions, children }: { crumbs?: Crumb[]; title?: string; actions?: ReactNode; children: ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [navOpen, setNavOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);

  useEffect(() => {
    if (ready && !user) {
      const next = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(`/login/?next=${encodeURIComponent(next)}`);
    }
  }, [ready, user, router, pathname, params]);

  useEffect(() => {
    if (title) document.title = `${title} | FutureInnvo Administration`;
  }, [title]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="admin-bg" aria-hidden><span /><span /><span /></div>
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-2xl border-2 border-accent/30 border-t-accent" />
          <span className="text-lg font-bold text-gradient">F</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="admin-bg" aria-hidden><span /><span /><span /></div>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-[rgb(var(--glass)/0.7)] backdrop-blur-xl after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-gradient-to-r after:from-transparent after:via-accent/50 after:to-transparent">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
          <button onClick={() => setNavOpen(true)} className="lg:hidden rounded-lg p-2 hover:bg-accent/10" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={40} className="transition-transform duration-300 hover:rotate-6 hover:scale-105" />
            <span className="hidden sm:block leading-tight">
              <span className="block font-extrabold tracking-wide text-ink">FUTURE<span className="text-gradient">INNVO</span></span>
              <span className="block text-[11px] font-medium text-muted">Administration</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1 text-sm">
            <span className="hidden lg:flex items-center gap-2 mr-2 rounded-full border border-line bg-[rgb(var(--glass)/0.6)] py-1 pl-1 pr-3 text-muted">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <strong className="text-ink">{user.name}</strong>
              {user.is_superuser ? (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">Admin</span>
              ) : user.team_member ? (
                <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-600 dark:text-sky-300">Team</span>
              ) : null}
            </span>
            <NotificationBell />
            <Link href="/tasks/" className={`btn-ghost !px-3 ${pathname.startsWith('/admin/tasks') || pathname.startsWith('/tasks') ? '!border-accent text-accent' : ''}`} title="Tasks">
              <ListTodo className="h-4 w-4" />
              <span className="hidden xl:inline">{user.team_member && !user.is_superuser ? 'My tasks' : 'Tasks'}</span>
            </Link>
            {user.is_superuser && (
              <Link href="/expenses/" className={`btn-ghost !px-3 ${pathname.startsWith('/expenses') ? '!border-accent text-accent' : ''}`} title="Expenses">
                <Wallet className="h-4 w-4" />
                <span className="hidden xl:inline">Expenses</span>
              </Link>
            )}
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3" title="View site">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden xl:inline">View site</span>
            </a>
            <Link href="/password/" className="btn-ghost !px-3" title="Change password">
              <KeyRound className="h-4 w-4" />
              <span className="hidden xl:inline">Change password</span>
            </Link>
            <button onClick={() => setDark(toggleTheme())} className="btn-ghost !px-3" aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                logout();
                router.replace('/login/');
              }}
              className="btn-ghost !px-3"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xl:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-line/70 bg-[rgb(var(--glass)/0.45)] backdrop-blur-xl sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
          <Sidebar />
        </aside>
        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fade-up_.2s_both]" onClick={() => setNavOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-surface p-4 shadow-2xl animate-[fade-up_.3s_both]">
              <button onClick={() => setNavOpen(false)} className="mb-3 rounded-lg p-2 hover:bg-accent/10" aria-label="Close navigation">
                <X className="h-5 w-5" />
              </button>
              <Sidebar onNavigate={() => setNavOpen(false)} />
            </div>
          </div>
        )}

        {/* Content */}
        {/* key re-runs the entrance animation on every navigation */}
        <main key={`${pathname}?${params.toString()}`} className="page-enter flex-1 min-w-0 p-4 lg:p-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <Link href="/" className="hover:text-accent">Home</Link>
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span aria-hidden>›</span>
                {crumb.href ? <Link href={crumb.href} className="hover:text-accent">{crumb.label}</Link> : <span className="text-ink">{crumb.label}</span>}
              </span>
            ))}
          </nav>
          <Messages />
          {(title || actions) && (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {title && <h1 className="mr-auto text-2xl md:text-3xl font-bold tracking-tight text-ink">{title}</h1>}
              {actions}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
