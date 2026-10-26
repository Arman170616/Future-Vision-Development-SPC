'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, Check, CheckCircle2, FileText, FolderKanban, HandCoins, Hourglass, Pencil, Plus, ShieldCheck, X, XCircle } from 'lucide-react';
import { api, editHref, formatMoney, mediaUrl, timeAgo } from '@/lib/api';
import { useMessages } from '@/lib/messages';
import type { FileValue } from '@/lib/types';

const MODEL = 'expenses.expenserequest';

type Status = 'pending' | 'approved' | 'rejected';

interface RequestItem {
  id: number;
  title: string;
  amount: string;
  category: string;
  project: { id: number; title: string } | null;
  paid_to: string;
  needed_by: string | null;
  reason: string;
  attachment: FileValue | null;
  status: Status;
  requested_by: string;
  mine: boolean;
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string;
  expense_id: number | null;
  created_at: string;
}

interface Feed {
  items: RequestItem[];
  counts: Record<Status, number>;
  pending_total: string;
  status: Status | 'all';
  can_approve: boolean;
  approvers: string[];
  approver_note: string;
}

const TABS: { key: Status | 'all'; label: string; icon: typeof Hourglass }[] = [
  { key: 'pending', label: 'Waiting', icon: Hourglass },
  { key: 'approved', label: 'Approved', icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
  { key: 'all', label: 'All', icon: HandCoins },
];

const STATUS_STYLE: Record<Status, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-red-500/15 text-red-700 dark:text-red-300',
};
const STATUS_LABEL: Record<Status, string> = { pending: 'Waiting for approval', approved: 'Approved', rejected: 'Rejected' };

const day = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Expense requests: anyone asks, the approver (CEO) approves or rejects; approval books the expense. */
export default function ExpenseRequests({ onDecided }: { onDecided?: () => void }) {
  const { push } = useMessages();
  const [tab, setTab] = useState<Status | 'all'>('pending');
  const [feed, setFeed] = useState<Feed | null>(null);
  const [deciding, setDeciding] = useState<{ id: number; approve: boolean } | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<Feed>('/expense-requests/', { query: { status: tab } }).then(setFeed).catch(() => undefined);
  }, [tab]);

  useEffect(load, [load]);

  const decide = async () => {
    if (!deciding) return;
    setBusy(true);
    try {
      const res = await api<{ detail: string }>(`/expense-requests/${deciding.id}/decide/`, {
        json: { decision: deciding.approve ? 'approve' : 'reject', note },
      });
      push(res.detail);
      setDeciding(null);
      setNote('');
      load();
      onDecided?.();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not save the decision.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line/70 p-4" style={{ background: 'linear-gradient(90deg, rgb(249 115 22 / 0.10), transparent 70%)' }}>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-300"><HandCoins className="h-5 w-5" /></span>
        <div className="mr-auto">
          <h2 className="font-bold">Expense requests</h2>
          <p className="text-xs text-muted">
            Needs approval before it is spent
            {feed && feed.approvers.length > 0 && <> · approver: <strong className="text-ink">{feed.approvers.join(', ')}</strong></>}
          </p>
        </div>
        {feed && feed.counts.pending > 0 && (
          <div className="text-right text-sm">
            <div><strong className="text-base text-orange-600 dark:text-orange-300">{formatMoney(feed.pending_total)} OMR</strong></div>
            <div className="text-xs text-muted">{feed.counts.pending} waiting for approval</div>
          </div>
        )}
        <Link href={editHref(MODEL)} className="btn-primary"><Plus className="h-4 w-4" /> New request</Link>
      </div>

      {feed?.approver_note && (
        <p className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{feed.approver_note} Create it under <strong>Team members → open her → Admin panel login</strong>.</span>
        </p>
      )}

      <div className="flex flex-wrap gap-1 border-b border-line/70 px-4 py-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count = key === 'all' ? null : feed?.counts[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${tab === key ? 'bg-accent/10 text-accent' : 'text-muted hover:text-ink'}`}
            >
              <Icon className="h-4 w-4" /> {label}
              {count ? <span className={`rounded-full px-1.5 text-[11px] ${key === 'pending' ? 'bg-orange-500 text-white' : 'bg-line'}`}>{count}</span> : null}
            </button>
          );
        })}
      </div>

      {!feed && <div className="space-y-3 p-4">{[0, 1].map(i => <div key={i} className="skeleton h-28" />)}</div>}
      {feed && feed.items.length === 0 && (
        <div className="p-10 text-center text-sm text-muted">
          <HandCoins className="mx-auto mb-2 h-8 w-8 opacity-50" />
          {tab === 'pending' ? 'Nothing is waiting for approval.' : 'No requests here yet.'}
        </div>
      )}
      {feed && feed.items.length > 0 && (
        <ul className="stagger divide-y divide-line/70">
          {feed.items.map(item => (
            <li key={item.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span>{item.mine ? 'You' : item.requested_by} · {timeAgo(item.created_at)}</span>
                    <span>{item.category}</span>
                    {item.project && <span className="flex items-center gap-1 text-accent"><FolderKanban className="h-3.5 w-3.5" /> {item.project.title}</span>}
                    {item.paid_to && <span>To: {item.paid_to}</span>}
                    {item.needed_by && <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> Needed by {day(item.needed_by)}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold leading-none">{formatMoney(item.amount)} <span className="text-xs font-medium text-muted">OMR</span></div>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[rgb(var(--canvas)/0.7)] px-3 py-2 text-sm">{item.reason}</p>

              {item.status !== 'pending' && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
                  <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0" />
                  <span>
                    {item.status === 'approved' ? 'Approved' : 'Rejected'} by <strong className="text-ink">{item.decided_by}</strong>
                    {item.decided_at && <> on {day(item.decided_at)}</>}
                    {item.decision_note && <> — “{item.decision_note}”</>}
                  </span>
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.attachment?.url && (
                  <a href={mediaUrl(item.attachment.url)} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> Quotation</a>
                )}
                {item.status === 'pending' && item.mine && (
                  <Link href={editHref(MODEL, item.id)} className="btn-ghost !py-1.5 text-xs"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                )}
                {item.expense_id && (
                  <Link href={editHref('expenses.expense', item.expense_id)} className="btn-ghost !py-1.5 text-xs">View expense</Link>
                )}
                {item.status === 'pending' && feed.can_approve && deciding?.id !== item.id && (
                  <span className="ml-auto flex gap-2">
                    <button type="button" onClick={() => { setDeciding({ id: item.id, approve: false }); setNote(''); }} className="btn-ghost !py-1.5 text-red-600"><X className="h-4 w-4" /> Reject</button>
                    <button type="button" onClick={() => { setDeciding({ id: item.id, approve: true }); setNote(''); }} className="btn !py-1.5 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"><Check className="h-4 w-4" /> Approve</button>
                  </span>
                )}
              </div>

              {deciding?.id === item.id && (
                <div className={`mt-3 rounded-xl border p-3 animate-[pop-in_.2s_both] ${deciding.approve ? 'border-emerald-500/40 bg-emerald-500/[0.06]' : 'border-red-500/40 bg-red-500/[0.06]'}`}>
                  <label htmlFor={`note-${item.id}`} className="label">{deciding.approve ? 'Approve' : 'Reject'} — note for {item.mine ? 'yourself' : item.requested_by} (optional)</label>
                  <textarea id={`note-${item.id}`} rows={2} value={note} onChange={e => setNote(e.target.value)} className="input" placeholder={deciding.approve ? 'e.g. Go ahead, use the company card' : 'e.g. Please get a cheaper quote'} />
                  <div className="mt-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setDeciding(null)} className="btn-ghost">Cancel</button>
                    <button type="button" disabled={busy} onClick={decide} className={`btn text-white shadow-sm ${deciding.approve ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                      {busy ? 'Saving…' : deciding.approve ? 'Approve & add to expenses' : 'Reject request'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
