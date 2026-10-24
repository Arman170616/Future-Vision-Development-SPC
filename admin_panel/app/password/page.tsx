'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Shell from '@/components/Shell';
import { ApiError, api, editHref } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useMessages } from '@/lib/messages';

/** Own password (no ?user=) or, for staff with permission, another user's password (?user=<id>). */
function PasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, replaceToken } = useAuth();
  const { push } = useMessages();
  const target = params.get('user');
  const own = !target || String(user?.id) === target;
  const [fields, setFields] = useState({ old_password: '', new_password1: '', new_password2: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const set = (name: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => setFields(prev => ({ ...prev, [name]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const res = !target
        ? await api<{ detail: string; token?: string }>('/me/password/', { json: fields })
        : await api<{ detail: string; token?: string }>(`/models/auth.user/${target}/password/`, {
            json: { password1: fields.new_password1, password2: fields.new_password2 },
          });
      if (res.token) replaceToken(res.token);
      push(res.detail);
      router.push(target ? editHref('auth.user', target) : '/');
    } catch (err) {
      if (err instanceof ApiError && err.data?.errors) {
        const e2 = err.data.errors as Record<string, string[]>;
        // Map the admin form's field names onto ours
        setErrors({ ...e2, new_password1: e2.new_password1 ?? e2.password1, new_password2: e2.new_password2 ?? e2.password2 });
      } else push(err instanceof Error ? err.message : 'Could not change the password.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const field = (name: keyof typeof fields, label: string, help?: string) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} type="password" autoComplete={name === 'old_password' ? 'current-password' : 'new-password'} value={fields[name]} onChange={set(name)} className={`input ${errors[name] ? 'input-error' : ''}`} />
      {help && <p className="help">{help}</p>}
      {errors[name] && <p className="err">{errors[name].join(' ')}</p>}
    </div>
  );

  return (
    <Shell title={own && !target ? 'Password change' : 'Change user password'} crumbs={[{ label: 'Password change' }]}>
      <form onSubmit={submit} className="card max-w-lg space-y-5 p-6">
        <p className="text-sm text-muted">
          {target ? 'Enter a new password for this user.' : 'Please enter your old password, for security’s sake, and then enter your new password twice so we can verify you typed it in correctly.'}
        </p>
        {!target && field('old_password', 'Old password')}
        {field('new_password1', 'New password', 'Your password can’t be too similar to your other personal information, must contain at least 8 characters, can’t be a commonly used password and can’t be entirely numeric.')}
        {field('new_password2', 'New password confirmation')}
        {errors.__all__ && <p className="err">{errors.__all__.join(' ')}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Change password'}</button>
        </div>
      </form>
    </Shell>
  );
}

export default function Page() {
  return (
    <Suspense>
      <PasswordPage />
    </Suspense>
  );
}
