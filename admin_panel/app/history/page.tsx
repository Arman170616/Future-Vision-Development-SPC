'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Shell from '@/components/Shell';
import { api, editHref } from '@/lib/api';

interface HistoryData {
  object: string;
  entries: { time: string; user: string; action: string; message: string }[];
}

function HistoryPage() {
  const params = useSearchParams();
  const model = params.get('model') ?? '';
  const id = params.get('id') ?? '';
  const [data, setData] = useState<HistoryData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (model && id) {
      api<HistoryData>(`/models/${model}/${id}/history/`)
        .then(setData)
        .catch(err => setError(err instanceof Error ? err.message : 'Could not load history.'));
    }
  }, [model, id]);

  return (
    <Shell
      title={data ? `Change history: ${data.object}` : 'Change history'}
      crumbs={data ? [{ label: data.object, href: editHref(model, id) }, { label: 'History' }] : []}
    >
      {error && <div className="card p-4 text-sm text-red-600">{error}</div>}
      {data && (
        <div className="card overflow-x-auto">
          {data.entries.length === 0 ? (
            <p className="p-6 text-sm text-muted">This object doesn’t have a change history. It probably wasn’t added via this admin site.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Date/time</th>
                  <th className="th">User</th>
                  <th className="th">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry, i) => (
                  <tr key={i}>
                    <td className="td whitespace-nowrap">{new Date(entry.time).toLocaleString()}</td>
                    <td className="td">{entry.user}</td>
                    <td className="td">{entry.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Shell>
  );
}

export default function Page() {
  return (
    <Suspense>
      <HistoryPage />
    </Suspense>
  );
}
