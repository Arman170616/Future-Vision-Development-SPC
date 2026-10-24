'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, Eye, EyeOff, ListTodo, Lock, LogIn, User, Wallet } from 'lucide-react';
import Logo from '@/components/Logo';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

function LoginForm() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Only allow in-panel redirects
  const nextParam = params.get('next') ?? '/';
  const next = nextParam.startsWith('/admin/') ? nextParam.slice('/admin'.length) : nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, router, next]);

  useEffect(() => {
    document.title = 'Log in | FutureInnvo Administration';
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username, password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="admin-bg" aria-hidden><span /><span /><span /></div>
      <div className="card grid w-full max-w-4xl overflow-hidden shadow-2xl md:grid-cols-[1.05fr_1fr] animate-[pop-in_.5s_cubic-bezier(.2,.7,.2,1)_both]">
        {/* Brand panel */}
        <div
          className="relative hidden flex-col justify-between overflow-hidden p-10 text-white md:flex"
          style={{ background: 'linear-gradient(145deg, rgb(var(--accent)), rgb(var(--accent-2)))' }}
        >
          <span className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-2xl animate-[drift-b_18s_ease-in-out_infinite]" aria-hidden />
          <span className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-black/10 blur-2xl animate-[drift-a_22s_ease-in-out_infinite]" aria-hidden />
          <div className="relative flex items-center gap-3">
            <Logo size={56} className="!border-white/40 !shadow-black/10" />
            <div className="leading-tight">
              <div className="text-xl font-extrabold tracking-wide">FUTUREINNVO</div>
              <div className="text-sm text-white/80">Administration</div>
            </div>
          </div>
          <div className="relative my-10">
            <h2 className="text-3xl font-bold leading-tight">Run the whole company from one place.</h2>
            <p className="mt-3 max-w-sm text-sm text-white/85">Website content, tasks, expenses and your team — all in the FutureInnvo admin panel.</p>
          </div>
          <ul className="relative space-y-3 text-sm">
            {[
              { icon: ListTodo, text: 'Tasks with approvals & progress notes' },
              { icon: Bell, text: 'Live notifications for your team' },
              { icon: Wallet, text: 'Daily, monthly & yearly expense tracking' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur"><Icon className="h-4 w-4" /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-8 sm:p-10">
          <div className="mb-8">
            <Logo size={64} className="mb-5 md:hidden" />
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">Sign in to the FutureInnvo admin panel</p>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

          <label className="label" htmlFor="username">Username</label>
          <div className="relative mb-4">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input id="username" autoFocus autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required className="input !py-2.5 pl-9" />
          </div>

          <label className="label" htmlFor="password">Password</label>
          <div className="relative mb-6">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="input !py-2.5 pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:bg-accent/10 hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
            <LogIn className="h-4 w-4" /> {busy ? 'Signing in…' : 'Log in'}
          </button>
          <p className="mt-6 text-center text-xs text-muted">Team members: use the login your administrator gave you.</p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
