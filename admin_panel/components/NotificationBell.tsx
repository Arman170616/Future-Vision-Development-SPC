'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Bell, BellOff, CheckCheck, CheckCircle2, ChevronRight, MessageSquare, ShieldCheck, Sparkles, UserPlus, type LucideIcon } from 'lucide-react';
import { api, editHref, timeAgo } from '@/lib/api';

interface Item {
  id: number;
  kind: 'assigned' | 'created' | 'note' | 'status' | 'approval';
  message: string;
  task_id: number | null;
  actor: string | null;
  created_at: string;
  read: boolean;
}

interface Feed {
  unread: number;
  items: Item[];
}

const KINDS: Record<Item['kind'], { icon: LucideIcon; label: string; tone: string }> = {
  assigned: { icon: UserPlus, label: 'Assigned to you', tone: 'bg-violet-500/15 text-violet-600 dark:text-violet-300' },
  created: { icon: Sparkles, label: 'New task', tone: 'bg-amber-500/15 text-amber-600 dark:text-amber-300' },
  note: { icon: MessageSquare, label: 'New note', tone: 'bg-sky-500/15 text-sky-600 dark:text-sky-300' },
  status: { icon: CheckCircle2, label: 'Status update', tone: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' },
  approval: { icon: ShieldCheck, label: 'Approval', tone: 'bg-rose-500/15 text-rose-600 dark:text-rose-300' },
};

/** Fired by pages that change notifications, so the bell refreshes immediately. */
export const NOTIFICATIONS_CHANGED = 'fi-notifications-changed';

const POLL_MS = 30_000;

export default function NotificationBell() {
  const router = useRouter();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [ring, setRing] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const lastUnread = useRef<number | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const apply = useCallback((next: Feed) => {
    // Shake the bell when something new arrives
    if (lastUnread.current !== null && next.unread > lastUnread.current) {
      setRing(true);
      window.setTimeout(() => setRing(false), 1200);
    }
    lastUnread.current = next.unread;
    setFeed(next);
  }, []);

  const load = useCallback(() => {
    api<Feed>('/notifications/').then(apply).catch(() => undefined);
  }, [apply]);

  useEffect(() => {
    load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, POLL_MS);
    window.addEventListener('focus', load);
    window.addEventListener(NOTIFICATIONS_CHANGED, load);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', load);
      window.removeEventListener(NOTIFICATIONS_CHANGED, load);
    };
  }, [load]);

  // The panel is portalled to <body> (the header's blur would otherwise show the page through it)
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = button.current?.getBoundingClientRect();
      if (rect) setPos({ top: rect.bottom + 10, right: Math.max(12, window.innerWidth - rect.right) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const markRead = (body: { ids?: number[]; all?: boolean }) =>
    api<Feed>('/notifications/', { json: body }).then(apply).catch(() => undefined);

  const openItem = (item: Item) => {
    setOpen(false);
    // Opening one notification clears every unread one about the same task
    const ids = (feed?.items ?? []).filter(i => !i.read && (i.id === item.id || (item.task_id && i.task_id === item.task_id))).map(i => i.id);
    if (ids.length) markRead({ ids });
    if (item.task_id) router.push(`${editHref('tasks.task', item.task_id)}#notes`);
  };

  const unread = feed?.unread ?? 0;
  const items = (feed?.items ?? []).filter(i => tab === 'all' || !i.read);

  const renderItem = (item: Item) => {
    const kind = KINDS[item.kind] ?? KINDS.note;
    const Icon = kind.icon;
    return (
      <li key={item.id}>
        <button
          type="button"
          onClick={() => openItem(item)}
          className={`group relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[rgb(var(--canvas))] ${item.read ? '' : 'bg-accent/[0.05]'}`}
        >
          {!item.read && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-accent" aria-hidden />}
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${kind.tone}`}><Icon className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {kind.label}
              <span className="font-normal normal-case tracking-normal" title={new Date(item.created_at).toLocaleString()}>· {timeAgo(item.created_at)}</span>
            </span>
            <span className={`mt-0.5 block text-sm leading-snug ${item.read ? 'text-muted' : 'font-medium text-ink'}`}>{item.message}</span>
          </span>
          {!item.read ? (
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent shadow-[0_0_0_3px_rgb(var(--accent)/0.2)]" aria-label="unread" />
          ) : (
            <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted opacity-0 transition group-hover:opacity-100" />
          )}
        </button>
      </li>
    );
  };

  const panelEl = open && pos && (
    <div
      ref={panel}
      role="dialog"
      aria-label="Notifications"
      style={{ top: pos.top, right: pos.right }}
      className="fixed z-[60] w-[min(26rem,calc(100vw-24px))] overflow-hidden rounded-2xl border border-line bg-[rgb(var(--surface))] text-ink shadow-[0_24px_60px_-15px_rgb(0_0_0/0.35),0_0_0_1px_rgb(var(--ink)/0.03)] animate-[pop-in_.2s_both] origin-top-right"
    >
      <div className="relative overflow-hidden border-b border-line px-4 pb-3 pt-4" style={{ background: 'linear-gradient(120deg, rgb(var(--accent) / 0.14), rgb(var(--accent-2) / 0.08) 55%, transparent)' }}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl text-[rgb(var(--on-accent))] shadow-md" style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' }}>
            <Bell className="h-4 w-4" />
          </span>
          <div className="mr-auto">
            <div className="text-base font-bold leading-tight">Notifications</div>
            <div className="text-xs text-muted">{unread ? `${unread} unread` : 'You’re all caught up'}</div>
          </div>
          {unread > 0 && (
            <button type="button" onClick={() => markRead({ all: true })} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent transition hover:bg-accent/10">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>
        <div className="mt-3 inline-flex rounded-xl border border-line bg-[rgb(var(--surface))] p-0.5 text-xs font-semibold">
          {(['all', 'unread'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1 transition ${tab === t ? 'bg-accent text-[rgb(var(--on-accent))] shadow-sm' : 'text-muted hover:text-ink'}`}
            >
              {t === 'all' ? 'All' : `Unread${unread ? ` (${unread})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      <ul className="max-h-[min(60vh,28rem)] divide-y divide-line/70 overflow-y-auto">
        {!feed && [0, 1, 2].map(i => <li key={i} className="skeleton m-3 h-14" />)}
        {feed && items.length === 0 && (
          <li className="px-6 py-12 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgb(var(--canvas))]"><BellOff className="h-5 w-5 text-muted" /></span>
            <span className="block text-sm font-semibold">{tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</span>
            <span className="mt-1 block text-xs text-muted">New tasks, notes and status changes show up here.</span>
          </li>
        )}
        {items.map(renderItem)}
      </ul>
    </div>
  );

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => {
          setOpen(o => !o);
          if (!open) load();
        }}
        className={`btn-ghost relative !px-3 ${open || unread ? '!border-accent text-accent' : ''}`}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
      >
        <Bell className={`h-4 w-4 ${ring ? 'animate-[bell-ring_1s_ease-in-out]' : ''}`} />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow ring-2 ring-[rgb(var(--surface))] animate-[pop-in_.3s_both]">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {panelEl && createPortal(panelEl, document.body)}
    </>
  );
}
