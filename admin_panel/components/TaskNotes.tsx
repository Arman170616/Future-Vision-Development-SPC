'use client';

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { History, MessageSquare, Send } from 'lucide-react';
import { ApiError, api, timeAgo } from '@/lib/api';
import { useMessages } from '@/lib/messages';

interface Note {
  id: number;
  kind: 'note' | 'event';
  body: string;
  created_at: string;
  author: { id: number; name: string; role: 'admin' | 'team' | 'staff' } | null;
  mine: boolean;
}

interface Thread {
  notes: Note[];
  can_post: boolean;
}

const fullTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const RoleBadge = ({ role }: { role: 'admin' | 'team' | 'staff' }) =>
  role === 'admin' ? (
    <span className="rounded-full bg-accent/15 px-1.5 py-px text-[9px] font-bold uppercase text-accent">Admin</span>
  ) : role === 'team' ? (
    <span className="rounded-full bg-sky-500/15 px-1.5 py-px text-[9px] font-bold uppercase text-sky-600 dark:text-sky-300">Team</span>
  ) : null;

/** Conversation + history of a task: admins and the assigned member reply to each other here. */
export default function TaskNotes({ taskId, compact = false }: { taskId: number | string; compact?: boolean }) {
  const { push } = useMessages();
  const [thread, setThread] = useState<Thread | null>(null);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLElement>(null);
  const end = useRef<HTMLLIElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const load = useCallback(
    () =>
      api<Thread>(`/tasks/${taskId}/notes/`)
        .then(setThread)
        .catch(() => setThread(prev => prev ?? { notes: [], can_post: false })),
    [taskId],
  );

  useEffect(() => {
    load().then(() => {
      if (window.location.hash === '#notes') root.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    // Keep the thread live while the task is open, so replies appear without reloading
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 20_000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const count = thread?.notes.length ?? 0;
    if (count > lastCount.current && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
    lastCount.current = count;
  }, [thread]);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!body.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await api<Thread>(`/tasks/${taskId}/notes/`, { json: { body } });
      setThread(res);
      setBody('');
      push('Note added — everyone on this task has been notified.');
      window.setTimeout(() => end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    } catch (err) {
      if (err instanceof ApiError && err.data?.errors?.body) setError(err.data.errors.body.join(' '));
      else setError(err instanceof Error ? err.message : 'Could not add the note.');
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
  };

  const noteCount = thread?.notes.filter(n => n.kind === 'note').length ?? 0;

  return (
    <section ref={root} id="notes" className={`card scroll-mt-24 overflow-hidden ${compact ? '' : 'mt-6'}`}>
      <h2 className="card-head flex items-center gap-2 !text-sm">
        <MessageSquare className="h-4 w-4" /> Notes & updates
        {thread && <span className="font-medium normal-case tracking-normal text-muted">· {noteCount} note{noteCount === 1 ? '' : 's'}</span>}
      </h2>

      <div className="p-5">
        {!thread && <div className="space-y-3">{[0, 1].map(i => <div key={i} className="skeleton h-16" />)}</div>}

        {thread && (
          <div ref={scroller} className={compact ? 'xl:-mr-2 xl:max-h-[calc(100vh-26rem)] xl:min-h-[8rem] xl:overflow-y-auto xl:pr-2' : ''}>
          <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-line">
            {thread.notes.length === 0 && <li className="pl-10 text-sm text-muted">No notes yet. Start the conversation below.</li>}
            {thread.notes.map(note =>
              note.kind === 'event' ? (
                <li key={note.id} className="relative flex items-center gap-3 pl-0 text-xs text-muted animate-[fade-up_.35s_both]">
                  <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-[rgb(var(--surface))]">
                    <History className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    <strong className="font-semibold text-ink">{note.author?.name ?? 'System'}</strong> {note.body}
                    <span className="mx-1">·</span>
                    <time dateTime={note.created_at} title={fullTime(note.created_at)}>{fullTime(note.created_at)}</time>
                  </span>
                </li>
              ) : (
                <li key={note.id} className="relative flex gap-3 animate-[fade-up_.35s_both]">
                  <span
                    className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${note.mine ? 'text-[rgb(var(--on-accent))]' : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'}`}
                    style={note.mine ? { background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' } : undefined}
                  >
                    {(note.author?.name ?? '?').slice(0, 1).toUpperCase()}
                  </span>
                  <div className={`min-w-0 flex-1 rounded-2xl border px-4 py-3 ${note.mine ? 'border-accent/25 bg-accent/[0.06]' : 'border-line bg-[rgb(var(--surface)/0.7)]'}`}>
                    <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      <strong className="text-sm text-ink">{note.mine ? 'You' : note.author?.name ?? 'Unknown'}</strong>
                      {note.author && <RoleBadge role={note.author.role} />}
                      <time className="ml-auto text-muted" dateTime={note.created_at} title={timeAgo(note.created_at)}>{fullTime(note.created_at)}</time>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{note.body}</p>
                  </div>
                </li>
              ),
            )}
            <li ref={end} aria-hidden className="!mt-0" />
          </ol>
          </div>
        )}

        {thread?.can_post && (
          <form onSubmit={submit} className="mt-6 border-t border-line pt-5">
            <label htmlFor="task-note" className="label">Add a note</label>
            <textarea
              id="task-note"
              rows={3}
              value={body}
              onChange={e => {
                setBody(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={onKey}
              placeholder="Write an update, a question or a reply…"
              className={`input resize-y ${error ? 'input-error' : ''}`}
              maxLength={5000}
            />
            {error ? <p className="err">{error}</p> : <p className="help">Saved with the date and time. Everyone on this task gets a notification. Ctrl/⌘ + Enter to send.</p>}
            <div className="mt-3 flex justify-end">
              <button type="submit" disabled={busy || !body.trim()} className="btn-primary">
                <Send className="h-4 w-4" /> {busy ? 'Saving…' : 'Save note'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
