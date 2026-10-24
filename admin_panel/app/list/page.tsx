'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Filter, Plus, Search } from 'lucide-react';
import CellView from '@/components/CellView';
import FieldInput from '@/components/FieldInput';
import Shell from '@/components/Shell';
import { ApiError, api, capfirst, editHref } from '@/lib/api';
import { useMessages } from '@/lib/messages';
import type { ChangeList, Value } from '@/lib/types';

function ChangeListPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { push } = useMessages();
  const model = params.get('model') ?? '';

  const [data, setData] = useState<ChangeList | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState('');
  const [edits, setEdits] = useState<Record<string, Record<string, Value>>>({});
  const [editErrors, setEditErrors] = useState<Record<string, Record<string, string[]>>>({});
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState(params.get('q') ?? '');

  const query = useMemo(() => Object.fromEntries([...params.entries()].filter(([k]) => k !== 'model')), [params]);

  const load = useCallback(() => {
    if (!model) return;
    setError('');
    api<ChangeList>(`/models/${model}/`, { query })
      .then(res => {
        setData(res);
        setSelected(new Set());
        setEdits({});
        setEditErrors({});
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load this list.'));
  }, [model, query]);

  useEffect(load, [load]);
  useEffect(() => setSearch(params.get('q') ?? ''), [params]);

  /** Change one or more query parameters (resets the page unless `p` is set). */
  const go = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    if (!('p' in changes)) next.delete('p');
    Object.entries(changes).forEach(([k, v]) => (v === null || v === '' ? next.delete(k) : next.set(k, v)));
    router.push(`/list/?${next.toString()}`);
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    go({ q: search.trim() || null });
  };

  const toggleSort = (name: string) => {
    const current = data?.ordering ?? '';
    go({ o: current === name ? `-${name}` : current === `-${name}` ? null : name });
  };

  const allIds = data?.rows.map(r => String(r.id)) ?? [];
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));

  const runAction = async () => {
    if (!data || !action) return;
    const desc = data.actions.find(a => a.name === action)?.description ?? action;
    if (action === 'delete_selected' && !window.confirm(`Are you sure you want to delete the ${selected.size} selected item(s)? All related items will be deleted too.`)) return;
    setBusy(true);
    try {
      const res = await api<{ messages: string[] }>(`/models/${model}/action/`, { json: { action, ids: [...selected] } });
      res.messages.forEach(m => push(m));
      setAction('');
      load();
    } catch (err) {
      const extra = err instanceof ApiError && err.data?.protected?.length ? ` Protected: ${err.data.protected.join(', ')}` : '';
      push(`${desc}: ${err instanceof Error ? err.message : 'failed'}${extra}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  const saveEdits = async () => {
    if (!data) return;
    setBusy(true);
    const rows = Object.fromEntries(
      Object.entries(edits).map(([id, changes]) => [id, { ...data.rows.find(r => String(r.id) === id)!.editable, ...changes }]),
    );
    try {
      const res = await api<{ messages: string[] }>(`/models/${model}/bulk-edit/`, { json: { rows } });
      res.messages.forEach(m => push(m));
      load();
    } catch (err) {
      if (err instanceof ApiError && err.data?.errors) setEditErrors(err.data.errors);
      push(err instanceof Error ? err.message : 'Could not save changes.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!model) return <Shell title="Unknown model"><p>No model selected.</p></Shell>;

  const info = data?.model;
  const filtersActive = data?.filters.some(f => f.value) || params.get('q') || params.get('dh_y');
  const dh = data?.date_hierarchy;

  return (
    <Shell
      crumbs={info ? [{ label: info.app_name }, { label: capfirst(info.verbose_name_plural) }] : []}
      title={info ? `Select ${info.verbose_name} to ${info.perms.change ? 'change' : 'view'}` : 'Loading…'}
      actions={
        info?.perms.add && (
          <Link href={editHref(model)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add {info.verbose_name}
          </Link>
        )
      }
    >
      {error && <div className="card border-red-300 p-4 text-sm text-red-600">{error}</div>}
      {!data && !error && <div className="space-y-3">{[0, 1, 2, 3, 4].map(i => <div key={i} className="skeleton h-14" />)}</div>}

      {data && (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* Search */}
            {data.search_enabled && (
              <form onSubmit={submitSearch} className="card flex flex-wrap items-center gap-2 p-3">
                <div className="relative flex-1 min-w-[12rem]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="input pl-9" />
                </div>
                <button type="submit" className="btn-ghost">Search</button>
                <span className="text-sm text-muted">
                  {data.count} result{data.count === 1 ? '' : 's'}
                  {filtersActive && (
                    <> (<button type="button" onClick={() => router.push(`/list/?model=${model}`)} className="link">{data.total_count} total</button>)</>
                  )}
                </span>
              </form>
            )}

            {/* Date hierarchy */}
            {dh && (dh.options.length > 0 || dh.year) && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted">{dh.label}:</span>
                {dh.year && <button onClick={() => go({ dh_y: null, dh_m: null })} className="link">‹ All dates</button>}
                {dh.year && dh.month && <button onClick={() => go({ dh_m: null })} className="link">‹ {dh.year}</button>}
                {dh.options.map(opt => (
                  <button key={opt.value} onClick={() => go(dh.level === 'year' ? { dh_y: opt.value } : { dh_m: opt.value })} className="rounded-full border border-line px-3 py-0.5 hover:border-accent hover:text-accent">
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            {data.actions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <label htmlFor="action" className="font-medium">Action:</label>
                <select id="action" value={action} onChange={e => setAction(e.target.value)} className="input !w-auto">
                  <option value="">---------</option>
                  {data.actions.map(a => (
                    <option key={a.name} value={a.name}>{a.description}</option>
                  ))}
                </select>
                <button onClick={runAction} disabled={!action || selected.size === 0 || busy} className="btn-ghost">Go</button>
                <span className="text-muted">{selected.size} of {data.rows.length} selected</span>
              </div>
            )}

            {/* Results */}
            <div className="card overflow-x-auto">
              {data.rows.length === 0 ? (
                <p className="p-8 text-center text-muted">0 {data.model.verbose_name_plural}</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      {data.actions.length > 0 && (
                        <th className="th w-10">
                          <input
                            type="checkbox"
                            aria-label="Select all"
                            checked={allSelected}
                            onChange={() => setSelected(allSelected ? new Set() : new Set(allIds))}
                          />
                        </th>
                      )}
                      {data.columns.map(col => (
                        <th key={col.name} className="th">
                          {col.sortable ? (
                            <button onClick={() => toggleSort(col.name)} className="inline-flex items-center gap-1 hover:text-accent uppercase">
                              {capfirst(col.label)}
                              {data.ordering === col.name ? <ArrowUp className="h-3.5 w-3.5" /> : data.ordering === `-${col.name}` ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                            </button>
                          ) : (
                            capfirst(col.label)
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="stagger">
                    {data.rows.map(row => {
                      const id = String(row.id);
                      return (
                        <tr key={id} className={selected.has(id) ? 'bg-accent/5' : 'hover:bg-accent/5'}>
                          {data.actions.length > 0 && (
                            <td className="td">
                              <input
                                type="checkbox"
                                aria-label={`Select ${row.str}`}
                                checked={selected.has(id)}
                                onChange={() =>
                                  setSelected(prev => {
                                    const next = new Set(prev);
                                    if (next.has(id)) next.delete(id);
                                    else next.add(id);
                                    return next;
                                  })
                                }
                              />
                            </td>
                          )}
                          {data.columns.map(col => {
                            if (col.editable) {
                              const desc = data.editable_fields[col.name];
                              const value = edits[id]?.[col.name] ?? row.editable?.[col.name];
                              const errs = editErrors[id]?.[col.name];
                              return (
                                <td key={col.name} className="td">
                                  <div className={desc.type === 'boolean' ? '' : 'min-w-[7rem]'}>
                                    <FieldInput
                                      desc={desc}
                                      compact
                                      value={value}
                                      invalid={Boolean(errs)}
                                      onChange={v => setEdits(prev => ({ ...prev, [id]: { ...prev[id], [col.name]: v } }))}
                                    />
                                    {errs && <div className="err">{errs.join(' ')}</div>}
                                  </div>
                                </td>
                              );
                            }
                            const cell = <CellView cell={row.cells[col.name]} />;
                            return (
                              <td key={col.name} className={`td ${col.link ? 'min-w-[12rem]' : ''}`}>
                                {col.link ? (
                                  <Link href={editHref(model, row.id)} className="font-semibold text-accent hover:underline">
                                    {cell}
                                  </Link>
                                ) : (
                                  cell
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {Object.keys(edits).length > 0 && (
              <div className="flex justify-end">
                <button onClick={saveEdits} disabled={busy} className="btn-primary">Save</button>
              </div>
            )}

            {/* Pagination */}
            {data.num_pages > 1 && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <button onClick={() => go({ p: String(data.page - 1) })} disabled={data.page <= 1} className="btn-ghost !px-2" aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: data.num_pages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === data.num_pages || Math.abs(n - data.page) <= 2)
                  .map((n, i, arr) => (
                    <span key={n} className="flex items-center gap-2">
                      {i > 0 && n - arr[i - 1] > 1 && <span className="text-muted">…</span>}
                      <button
                        onClick={() => go({ p: String(n) })}
                        className={`min-w-[2.25rem] rounded-lg px-2 py-1.5 ${n === data.page ? 'bg-accent font-semibold' : 'border border-line hover:border-accent'}`}
                        style={n === data.page ? { color: 'rgb(var(--on-accent))' } : undefined}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                <button onClick={() => go({ p: String(data.page + 1) })} disabled={data.page >= data.num_pages} className="btn-ghost !px-2" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-muted">{data.count} {data.model.verbose_name_plural}</span>
              </div>
            )}
          </div>

          {/* Filters */}
          {data.filters.length > 0 && (
            <aside className="card w-full xl:w-64 shrink-0 p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                <Filter className="h-4 w-4" /> Filter
              </h2>
              {filtersActive && (
                <button onClick={() => router.push(`/list/?model=${model}`)} className="mb-3 text-sm link">✕ Clear all filters</button>
              )}
              <div className="space-y-4">
                {data.filters.map(f => (
                  <div key={f.name}>
                    <h3 className="mb-1.5 text-sm font-semibold">By {f.label.toLowerCase()}</h3>
                    <ul className="space-y-0.5 text-sm">
                      {[{ value: '', label: 'All' }, ...f.options].map(opt => (
                        <li key={opt.value}>
                          <button
                            onClick={() => go({ [`f_${f.name}`]: opt.value || null })}
                            className={`w-full rounded-md px-2 py-1 text-left ${f.value === opt.value ? 'bg-accent/15 font-semibold text-accent' : 'hover:bg-accent/10'}`}
                          >
                            {opt.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      )}
    </Shell>
  );
}

export default function ListPage() {
  return (
    <Suspense>
      <ChangeListPage />
    </Suspense>
  );
}
