'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Check, Copy, HandCoins, KeyRound, Power, ShieldCheck, Trash2, UserPlus, Wand2 } from 'lucide-react';
import { ApiError, api } from '@/lib/api';
import { useMessages } from '@/lib/messages';

interface LoginInfo {
  has_login: boolean;
  member: string;
  username?: string;
  email?: string;
  is_active?: boolean;
  last_login?: string | null;
  is_approver?: boolean;
}

/** Strong, readable password: no look-alike characters. */
const generatePassword = () => {
  const sets = ['ABCDEFGHJKMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '!@#$%&*?'];
  const all = sets.join('');
  const random = (n: number) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % n;
  };
  const chars = sets.map(s => s[random(s.length)]);
  while (chars.length < 14) chars.push(all[random(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
};

const suggestUsername = (name: string) =>
  name
    .toLowerCase()
    .replace(/^(dr|mr|mrs|ms|eng)\.?\s+/, '')
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('.');

/** Admin-panel login for a team member: create, reset password, disable or remove. */
export default function TeamLoginCard({ memberId }: { memberId: number | string }) {
  const { push } = useMessages();
  const [info, setInfo] = useState<LoginInfo | null>(null);
  const [mode, setMode] = useState<'create' | 'password' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<{ username: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api<LoginInfo>(`/team-members/${memberId}/login/`).then(setInfo).catch(() => setInfo(null));
  }, [memberId]);

  const open = (next: 'create' | 'password') => {
    setMode(next);
    setErrors({});
    setPassword(generatePassword());
    if (next === 'create' && info) setUsername(suggestUsername(info.member));
  };

  const send = async (body: Record<string, unknown>, success?: (res: LoginInfo & { detail: string }) => void) => {
    setBusy(true);
    setErrors({});
    try {
      const res = await api<LoginInfo & { detail: string }>(`/team-members/${memberId}/login/`, { json: body });
      setInfo(res);
      push(res.detail);
      success?.(res);
    } catch (err) {
      if (err instanceof ApiError && err.data?.errors) setErrors(err.data.errors);
      else push(err instanceof Error ? err.message : 'Could not save the login.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = mode === 'create' ? { username, password } : { password };
    send(body, res => {
      setIssued({ username: res.username ?? username, password });
      setMode(null);
    });
  };

  const remove = async () => {
    if (!info || !window.confirm(`Remove ${info.member}'s login? They will no longer be able to sign in. Their tasks stay assigned.`)) return;
    setBusy(true);
    try {
      const res = await api<LoginInfo & { detail: string }>(`/team-members/${memberId}/login/`, { method: 'DELETE' });
      setInfo(res);
      setIssued(null);
      push(res.detail);
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not remove the login.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!issued) return;
    const loginUrl = `${window.location.origin}/admin/`;
    await navigator.clipboard.writeText(`FutureInnvo admin panel\n${loginUrl}\nUsername: ${issued.username}\nPassword: ${issued.password}`).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (!info) return <div className="skeleton mb-6 h-28" />;

  return (
    <section className="card mb-6 overflow-hidden">
      <h2 className="card-head flex items-center gap-2 !text-sm">
        <ShieldCheck className="h-4 w-4" /> Admin panel login
      </h2>
      <div className="space-y-4 p-5">
        <p className="text-sm text-muted">
          With a login, {info.member} can sign in at <span className="font-medium text-ink">futureinnvo.com/admin</span> to see the tasks assigned
          to them, update their status, write progress notes and raise expense requests. They cannot see anything else.
        </p>

        {info.has_login ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-[rgb(var(--surface)/0.6)] p-3">
            <span className="chip-icon h-10 w-10"><KeyRound className="h-5 w-5 text-accent" /></span>
            <div className="mr-auto min-w-0">
              <div className="font-semibold">
                {info.username}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${info.is_active ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                  {info.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="text-xs text-muted">
                {info.last_login ? `Last signed in ${new Date(info.last_login).toLocaleString()}` : 'Has not signed in yet'}
              </div>
            </div>
            <button type="button" onClick={() => open('password')} disabled={busy} className="btn-ghost"><KeyRound className="h-4 w-4" /> New password</button>
            <button type="button" onClick={() => send({ is_active: !info.is_active })} disabled={busy} className="btn-ghost">
              <Power className="h-4 w-4" /> {info.is_active ? 'Disable' : 'Enable'}
            </button>
            <button type="button" onClick={remove} disabled={busy} className="btn-ghost text-red-600"><Trash2 className="h-4 w-4" /> Remove</button>
          </div>
        ) : null}

        {info.has_login ? (
          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${info.is_approver ? 'border-orange-400/50 bg-orange-500/[0.07]' : 'border-line'}`}>
            <input
              type="checkbox"
              checked={Boolean(info.is_approver)}
              disabled={busy}
              onChange={e => send({ is_approver: e.target.checked })}
              className="mt-1 h-4 w-4 accent-[rgb(var(--accent))]"
            />
            <span className="text-sm">
              <span className="flex items-center gap-1.5 font-semibold"><HandCoins className="h-4 w-4 text-orange-500" /> Approves expense requests</span>
              <span className="mt-0.5 block text-xs text-muted">
                The CEO approves automatically once she has a login — tick this only to choose other or extra approvers. When anyone is ticked, only the ticked people can approve.
              </span>
            </span>
          </label>
        ) : (
          mode !== 'create' && (
            <button type="button" onClick={() => open('create')} className="btn-primary"><UserPlus className="h-4 w-4" /> Create login</button>
          )
        )}

        {mode && (
          <form onSubmit={submit} className="space-y-4 rounded-xl border border-accent/30 bg-accent/5 p-4 animate-[fade-up_.3s_both]">
            {mode === 'create' && (
              <div>
                <label htmlFor="login-username" className="label">Username</label>
                <input id="login-username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="off" className={`input ${errors.username ? 'input-error' : ''}`} />
                {errors.username && <p className="err">{errors.username.join(' ')}</p>}
              </div>
            )}
            <div>
              <label htmlFor="login-password" className="label">{mode === 'create' ? 'Password' : 'New password'}</label>
              <div className="flex gap-2">
                <input id="login-password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" className={`input font-mono ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setPassword(generatePassword())} className="btn-ghost shrink-0" title="Generate a strong password"><Wand2 className="h-4 w-4" /> Generate</button>
              </div>
              {errors.password ? <p className="err">{errors.password.join(' ')}</p> : <p className="help">At least 8 characters, not too common or similar to their name.</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setMode(null)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : mode === 'create' ? 'Create login' : 'Set password'}</button>
            </div>
          </form>
        )}

        {issued && (
          <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm dark:border-green-900 dark:bg-green-950/40 animate-[pop-in_.3s_both]">
            <p className="mb-2 font-semibold text-green-800 dark:text-green-200">Share these details with {info.member} — the password is shown only once:</p>
            <div className="mb-3 grid gap-1 font-mono text-ink">
              <span>Username: <strong>{issued.username}</strong></span>
              <span>Password: <strong>{issued.password}</strong></span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={copy} className="btn-ghost">{copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy details'}</button>
              <button type="button" onClick={() => setIssued(null)} className="btn-ghost">Done</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
