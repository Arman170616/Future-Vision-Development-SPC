'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, FilePlus2, History, Info, List, Plus, Trash2, X } from 'lucide-react';
import CellView from '@/components/CellView';
import FieldInput from '@/components/FieldInput';
import Shell from '@/components/Shell';
import ProjectCosts from '@/components/ProjectCosts';
import TaskNotes from '@/components/TaskNotes';
import TeamLoginCard from '@/components/TeamLoginCard';
import { ApiError, api, capfirst, editHref, listHref } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useMessages } from '@/lib/messages';
import type { FieldDesc, FieldErrors, FormData_, InlineSchema, Option, Value } from '@/lib/types';

type RowState = {
  key: string;
  id?: number | string;
  values: Record<string, Value>;
  files: Record<string, File | null>;
  clears: Record<string, boolean>;
  labels: Record<string, Option[]>;
  readonly: InlineSchema['rows'][number]['readonly'];
  delete: boolean;
  str?: string;
};

type InlineErrors = Record<string, { non_form: string[]; rows: FieldErrors[] }>;

let rowSeq = 0;
const newKey = () => `row-${++rowSeq}`;

const slugify = (text: string, max = 50) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, max)
    .replace(/-+$/, '');

const isEditable = (desc: FieldDesc) => desc.type !== 'readonly' && desc.type !== 'password_hash';

function blankRow(inline: InlineSchema): RowState {
  return { key: newKey(), values: { ...inline.empty }, files: {}, clears: {}, labels: {}, readonly: {}, delete: false };
}

function initialRows(inline: InlineSchema): RowState[] {
  const rows: RowState[] = inline.rows.map(r => ({
    key: newKey(),
    id: r.id,
    values: { ...r.values },
    files: {},
    clears: {},
    labels: r.labels,
    readonly: r.readonly,
    delete: false,
    str: r.str,
  }));
  // Django shows `extra` blank forms (up to max_num)
  const extra = inline.can_add ? Math.max(0, Math.min(inline.extra, inline.max_num - rows.length)) : 0;
  for (let i = 0; i < extra; i++) rows.push(blankRow(inline));
  return rows;
}

function ChangeFormPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { push } = useMessages();
  const { user } = useAuth();
  const model = params.get('model') ?? '';
  const id = params.get('id');
  const isAdd = !id;

  const [data, setData] = useState<FormData_ | null>(null);
  const [loadError, setLoadError] = useState('');
  const [values, setValues] = useState<Record<string, Value>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [clears, setClears] = useState<Record<string, boolean>>({});
  const [inlineRows, setInlineRows] = useState<Record<string, RowState[]>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [inlineErrors, setInlineErrors] = useState<InlineErrors>({});
  const [sentOrder, setSentOrder] = useState<Record<string, string[]>>({});
  const [openSets, setOpenSets] = useState<Record<number, boolean>>({});
  const [slugEdited, setSlugEdited] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<null | { object: string; model_count: Record<string, number>; perms_needed: string[]; protected: string[] }>(null);

  const load = useCallback(() => {
    if (!model) return;
    setLoadError('');
    setData(null);
    api<FormData_>(`/models/${model}/form/`, { query: { id } })
      .then(res => {
        setData(res);
        setValues(res.values);
        setFiles({});
        setClears({});
        setErrors({});
        setInlineErrors({});
        setSlugEdited({});
        setInlineRows(Object.fromEntries(res.inlines.map(inline => [inline.prefix, initialRows(inline)])));
        setOpenSets({});
      })
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Could not load this form.'));
  }, [model, id]);

  useEffect(load, [load]);

  const canSave = Boolean(data?.permissions.save);

  const setValue = (name: string, value: Value) => {
    setValues(prev => {
      const next = { ...prev, [name]: value };
      // Prepopulated fields (e.g. slug from title) follow their sources until edited by hand
      if (data && isAdd) {
        Object.entries(data.prepopulated).forEach(([target, sources]) => {
          if (sources.includes(name) && !slugEdited[target]) {
            next[target] = slugify(sources.map(s => String(next[s] ?? '')).join(' '), data.fields[target]?.max_length);
          }
        });
      }
      return next;
    });
    if (data && name in data.prepopulated) setSlugEdited(prev => ({ ...prev, [name]: true }));
  };

  const updateRow = (prefix: string, key: string, patch: Partial<RowState>) =>
    setInlineRows(prev => ({ ...prev, [prefix]: prev[prefix].map(r => (r.key === key ? { ...r, ...patch } : r)) }));

  const submit = async (mode: 'save' | 'continue' | 'another') => {
    if (!data) return;
    setBusy(true);
    const form = new FormData();
    const payloadValues: Record<string, Value> = {};
    Object.entries(data.fields).forEach(([name, desc]) => {
      if (!isEditable(desc)) return;
      if (desc.type === 'file') {
        if (files[name]) form.append(name, files[name]!);
        if (clears[name]) payloadValues[`${name}__clear`] = true;
        return;
      }
      payloadValues[name] = values[name];
    });

    const inlinesPayload: Record<string, unknown[]> = {};
    const order: Record<string, string[]> = {};
    data.inlines.forEach(inline => {
      const rows = inlineRows[inline.prefix] ?? [];
      // Existing rows first — the server matches initial forms by position
      const ordered = [...rows.filter(r => r.id !== undefined), ...rows.filter(r => r.id === undefined && !r.delete)];
      order[inline.prefix] = ordered.map(r => r.key);
      inlinesPayload[inline.prefix] = ordered.map((row, index) => {
        const rowValues: Record<string, Value> = {};
        inline.columns.forEach(col => {
          if (!isEditable(col)) return;
          if (col.type === 'file') {
            const upload = row.files[col.name];
            if (upload) form.append(`${inline.prefix}-${index}-${col.name}`, upload);
            if (row.clears[col.name]) rowValues[`${col.name}__clear`] = true;
            return;
          }
          rowValues[col.name] = row.values[col.name];
        });
        return { ...(row.id !== undefined && { id: row.id }), values: rowValues, ...(row.delete && { delete: true }) };
      });
    });
    form.append('payload', JSON.stringify({ values: payloadValues, inlines: inlinesPayload }));

    try {
      const res = await api<{ id: number | string; detail: string }>(isAdd ? `/models/${model}/` : `/models/${model}/${id}/`, { form });
      push(res.detail);
      if (mode === 'save') router.push(listHref(model));
      else if (mode === 'continue') {
        if (isAdd) router.replace(editHref(model, res.id));
        else load();
      } else {
        if (isAdd) load();
        else router.push(editHref(model));
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setErrors(err.data?.errors ?? {});
        setInlineErrors(err.data?.inline_errors ?? {});
        setSentOrder(order);
        push('Please correct the errors below.', 'error');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        push(err instanceof Error ? err.message : 'Save failed.', 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  const openDelete = async () => {
    try {
      setDeleteInfo(await api(`/models/${model}/${id}/delete-preview/`));
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not prepare deletion.', 'error');
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      const res = await api<{ detail: string }>(`/models/${model}/${id}/`, { method: 'DELETE' });
      push(res.detail);
      router.push(listHref(model));
    } catch (err) {
      push(err instanceof Error ? err.message : 'Delete failed.', 'error');
      setDeleteInfo(null);
    } finally {
      setBusy(false);
    }
  };

  const rowErrors = (prefix: string, key: string): FieldErrors | undefined => {
    const index = sentOrder[prefix]?.indexOf(key) ?? -1;
    return index >= 0 ? inlineErrors[prefix]?.rows[index] : undefined;
  };

  const title = useMemo(() => {
    if (!data) return 'Loading…';
    if (isAdd) return `Add ${data.model.verbose_name}`;
    return `${canSave ? 'Change' : 'View'} ${data.model.verbose_name}`;
  }, [data, isAdd, canSave]);

  if (!model) return <Shell title="Unknown model"><p>No model selected.</p></Shell>;

  const renderField = (name: string) => {
    if (!data) return null;
    const desc = data.fields[name];
    if (!desc) return null;
    const errs = errors[name];
    const fieldId = `field-${name}`;

    if (desc.type === 'password_hash') {
      return (
        <div key={name}>
          <span className="label">{desc.label}</span>
          <p className="text-sm text-muted">
            Raw passwords are not stored, so there is no way to see this user’s password, but you can change the password using{' '}
            <Link href={`/password/?user=${data.object?.id}`} className="link">this form</Link>.
          </p>
        </div>
      );
    }
    if (desc.type === 'readonly') {
      return (
        <div key={name}>
          <span className="label">{desc.label}</span>
          <div className="text-sm"><CellView cell={data.readonly_values[name]} /></div>
          {desc.help_text && <p className="help">{desc.help_text}</p>}
        </div>
      );
    }
    if (desc.type === 'boolean') {
      return (
        <div key={name}>
          <label htmlFor={fieldId} className="inline-flex items-center gap-2.5 text-sm font-semibold">
            <FieldInput id={fieldId} desc={desc} value={values[name]} onChange={v => setValue(name, v)} disabled={!canSave} />
            {desc.label}
          </label>
          {desc.help_text && <p className="help">{desc.help_text}</p>}
          {errs && <p className="err">{errs.join(' ')}</p>}
        </div>
      );
    }
    return (
      <div key={name}>
        <label htmlFor={fieldId} className={`label ${desc.required ? '' : 'font-medium'}`}>
          {desc.label}
          {desc.required && <span className="text-accent"> *</span>}
        </label>
        <FieldInput
          id={fieldId}
          desc={desc}
          value={values[name]}
          onChange={v => setValue(name, v)}
          labels={data.labels[name]}
          disabled={!canSave}
          invalid={Boolean(errs)}
          file={files[name]}
          onFile={f => setFiles(prev => ({ ...prev, [name]: f }))}
          clear={clears[name]}
          onClear={c => setClears(prev => ({ ...prev, [name]: c }))}
        />
        {desc.help_text && <p className="help">{desc.help_text}</p>}
        {errs && <p className="err">{errs.join(' ')}</p>}
      </div>
    );
  };

  const isWide = (name: string) => {
    const desc = data?.fields[name];
    if (!desc) return true;
    return ['textarea', 'json', 'm2m', 'file', 'password_hash'].includes(desc.type) || (desc.type === 'text' && !desc.max_length) || (desc.type === 'readonly' && name === 'description');
  };

  const renderInline = (inline: InlineSchema) => {
    const rows = inlineRows[inline.prefix] ?? [];
    const live = rows.filter(r => !r.delete).length;
    const canAddRow = canSave && inline.can_add && live < inline.max_num;
    const errs = inlineErrors[inline.prefix];
    const editable = (row: RowState) => canSave && (row.id === undefined ? inline.can_add : inline.can_change);

    const cellInput = (row: RowState, col: FieldDesc, compact: boolean) => {
      const e = rowErrors(inline.prefix, row.key)?.[col.name];
      if (col.type === 'readonly') return <CellView cell={row.readonly[col.name]} />;
      return (
        <>
          <FieldInput
            desc={col}
            compact={compact}
            value={row.values[col.name]}
            onChange={v => updateRow(inline.prefix, row.key, { values: { ...row.values, [col.name]: v } })}
            labels={row.labels[col.name]}
            disabled={!editable(row) || row.delete}
            invalid={Boolean(e)}
            file={row.files[col.name]}
            onFile={f => updateRow(inline.prefix, row.key, { files: { ...row.files, [col.name]: f } })}
            clear={row.clears[col.name]}
            onClear={c => updateRow(inline.prefix, row.key, { clears: { ...row.clears, [col.name]: c } })}
          />
          {e && <p className="err">{e.join(' ')}</p>}
        </>
      );
    };

    const removeControl = (row: RowState) =>
      row.id !== undefined ? (
        inline.can_delete && canSave ? (
          <label className="inline-flex items-center gap-1.5 text-sm text-red-600">
            <input type="checkbox" checked={row.delete} onChange={e => updateRow(inline.prefix, row.key, { delete: e.target.checked })} />
            Delete
          </label>
        ) : null
      ) : (
        <button
          type="button"
          onClick={() => setInlineRows(prev => ({ ...prev, [inline.prefix]: prev[inline.prefix].filter(r => r.key !== row.key) }))}
          className="rounded-md p-1 text-muted hover:text-red-500"
          aria-label="Remove row"
        >
          <X className="h-4 w-4" />
        </button>
      );

    return (
      <section key={inline.prefix} className="card overflow-hidden">
        <h2 className="card-head !text-sm">{inline.verbose_name_plural}</h2>
        {errs?.non_form?.length ? <p className="err px-5 pt-3">{errs.non_form.join(' ')}</p> : null}

        {inline.style === 'tabular' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {inline.columns.map(col => (
                    <th key={col.name} className="th">
                      {col.label}
                      {col.required && <span className="text-accent"> *</span>}
                    </th>
                  ))}
                  <th className="th w-24">{inline.can_delete ? 'Delete?' : ''}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.key} className={row.delete ? 'opacity-50' : ''}>
                    {inline.columns.map(col => (
                      <td key={col.name} className="td min-w-[10rem]">{cellInput(row, col, true)}</td>
                    ))}
                    <td className="td">{removeControl(row)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={inline.columns.length + 1} className="td text-center text-muted">No {inline.verbose_name_plural.toLowerCase()} yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {rows.map((row, i) => (
              <div key={row.key} className={`p-5 space-y-4 ${row.delete ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {inline.verbose_name}: {row.str ?? `#${i + 1}`}
                  </h3>
                  {removeControl(row)}
                </div>
                {inline.columns.map(col => (
                  <div key={col.name}>
                    <span className="label">
                      {col.label}
                      {col.required && <span className="text-accent"> *</span>}
                    </span>
                    {cellInput(row, col, false)}
                    {col.help_text && <p className="help">{col.help_text}</p>}
                  </div>
                ))}
              </div>
            ))}
            {rows.length === 0 && <p className="p-5 text-sm text-muted">No {inline.verbose_name.toLowerCase()} yet.</p>}
          </div>
        )}

        {canAddRow && (
          <div className="border-t border-line px-5 py-3">
            <button
              type="button"
              onClick={() => setInlineRows(prev => ({ ...prev, [inline.prefix]: [...(prev[inline.prefix] ?? []), blankRow(inline)] }))}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              <Plus className="h-4 w-4" /> Add another {inline.verbose_name}
            </button>
          </div>
        )}
      </section>
    );
  };

  return (
    <Shell
      crumbs={
        data
          ? [
              { label: data.model.app_name },
              { label: capfirst(data.model.verbose_name_plural), href: listHref(model) },
              { label: isAdd ? `Add ${data.model.verbose_name}` : data.object?.str ?? '' },
            ]
          : []
      }
      title={title}
      actions={
        data && !isAdd ? (
          <Link href={`/history/?model=${model}&id=${id}`} className="btn-ghost">
            <History className="h-4 w-4" /> History
          </Link>
        ) : null
      }
    >
      {loadError && <div className="card p-4 text-sm text-red-600">{loadError}</div>}
      {!data && !loadError && <div className="space-y-4">{[0, 1, 2].map(i => <div key={i} className="skeleton h-40" />)}</div>}

      {data && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_440px]">
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            submit('save');
          }}
          className="min-w-0 space-y-6"
          noValidate
        >
          {!isAdd && <p className="text-lg font-semibold -mt-2">{data.object?.str}</p>}
          {errors.__all__ && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {errors.__all__.join(' ')}
            </div>
          )}

          {data.fieldsets.map((set, i) => {
            const collapsible = set.classes.includes('collapse');
            const hasError = set.lines.flat().some(n => errors[n]);
            const open = !collapsible || openSets[i] || hasError;
            return (
              <section key={i} className="card overflow-hidden">
                {set.name && (
                  <button
                    type="button"
                    onClick={() => collapsible && setOpenSets(prev => ({ ...prev, [i]: !open }))}
                    className={`card-head !text-sm flex w-full items-center justify-between text-left text-accent ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
                    aria-expanded={open}
                  >
                    {set.name}
                    {collapsible && <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />}
                  </button>
                )}
                {open && (
                  <div className="space-y-5 p-5">
                    {set.description && <p className="text-sm text-muted">{set.description}</p>}
                    <div className="grid gap-5 lg:grid-cols-2">
                      {set.lines.map((line, j) => (
                        // Short single fields pair up side by side; long ones and multi-field rows span the full width
                        <div key={j} className={line.length > 1 ? 'grid gap-5 md:grid-cols-2 lg:col-span-2' : isWide(line[0]) ? 'lg:col-span-2' : ''}>
                          {line.map(renderField)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}

          {data.inlines.map(renderInline)}

          {/* Submit row */}
          <div className="card sticky bottom-2 sm:bottom-4 z-20 flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 shadow-lg">
            {data.permissions.delete && (
              <button type="button" onClick={openDelete} className="btn-danger mr-auto !px-3 sm:!px-4" aria-label="Delete">
                <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <div className="ml-auto flex flex-wrap justify-end gap-2">
              {canSave ? (
                <>
                  {data.permissions.add && (
                    <button type="button" disabled={busy} onClick={() => submit('another')} className="btn-ghost hidden md:inline-flex">Save and add another</button>
                  )}
                  <button type="button" disabled={busy} onClick={() => submit('continue')} className="btn-ghost !px-3 sm:!px-4">
                    <span className="sm:hidden">Save &amp; continue</span>
                    <span className="hidden sm:inline">Save and continue editing</span>
                  </button>
                  <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save'}</button>
                </>
              ) : (
                <Link href={listHref(model)} className="btn-ghost">Close</Link>
              )}
            </div>
          </div>
        </form>

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-20">
          {!isAdd && model === 'tasks.task' && <TaskNotes taskId={id!} compact />}
          {!isAdd && model === 'teams.teammember' && user?.is_superuser && <TeamLoginCard memberId={id!} />}
          {!isAdd && model === 'projects.project' && user?.is_superuser && <ProjectCosts projectId={id!} />}
          {model !== 'tasks.task' && (
            <section className="card overflow-hidden">
              <h2 className="card-head flex items-center gap-2 !text-sm"><Info className="h-4 w-4" /> {isAdd ? 'New record' : 'Record'}</h2>
              <div className="space-y-4 p-5 text-sm">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">{data.model.app_name}</div>
                  <div className="mt-0.5 text-base font-bold">{isAdd ? `New ${data.model.verbose_name}` : data.object?.str}</div>
                </div>
                <div className="grid gap-2">
                  <Link href={listHref(model)} className="btn-ghost justify-start"><List className="h-4 w-4" /> All {data.model.verbose_name_plural}</Link>
                  {!isAdd && data.permissions.add && <Link href={editHref(model)} className="btn-ghost justify-start"><FilePlus2 className="h-4 w-4" /> Add another {data.model.verbose_name}</Link>}
                  {!isAdd && <Link href={`/history/?model=${model}&id=${id}`} className="btn-ghost justify-start"><History className="h-4 w-4" /> Change history</Link>}
                </div>
                <p className="rounded-xl bg-accent/[0.06] px-3 py-2.5 text-xs text-muted">Fields marked <span className="font-bold text-accent">*</span> are required. Changes are saved when you press <strong className="text-ink">Save</strong>.</p>
              </div>
            </section>
          )}
        </aside>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-2">Are you sure?</h2>
            {deleteInfo.protected.length || deleteInfo.perms_needed.length ? (
              <>
                <p className="text-sm text-muted mb-3">Deleting “{deleteInfo.object}” is not possible:</p>
                <ul className="mb-4 list-disc pl-5 text-sm text-red-600">
                  {deleteInfo.perms_needed.map(p => <li key={p}>You don’t have permission to delete: {p}</li>)}
                  {deleteInfo.protected.map(p => <li key={p}>Protected related object: {p}</li>)}
                </ul>
                <div className="flex justify-end">
                  <button onClick={() => setDeleteInfo(null)} className="btn-ghost">Close</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted mb-3">
                  Are you sure you want to delete “{deleteInfo.object}”? All of the following related items will be deleted:
                </p>
                <ul className="mb-5 space-y-1 text-sm">
                  {Object.entries(deleteInfo.model_count).map(([name, count]) => (
                    <li key={name} className="flex justify-between rounded-md bg-canvas px-3 py-1.5">
                      <span>{name}</span>
                      <strong>{count}</strong>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setDeleteInfo(null)} className="btn-ghost">No, take me back</button>
                  <button onClick={confirmDelete} disabled={busy} className="btn-danger">Yes, I’m sure</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}

export default function EditPage() {
  return (
    <Suspense>
      <ChangeFormPage />
    </Suspense>
  );
}
