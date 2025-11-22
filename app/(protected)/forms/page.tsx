'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

type FormRow = {
  id: string;
  form_type: 'KS0322' | 'KS0319';
  title: string | null;
  status: 'draft' | 'submitted';
  updated_at: string;
};

type TabKey = 'all' | 'draft' | 'submitted';

export default function FormsList() {
  const [items, setItems] = useState<FormRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('all');
  const [query, setQuery] = useState(''); // enkel tittel-søk

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const res = await fetch('/api/forms', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const text = await res.text();
      let json: any = null;
      try { json = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) {
        setError(json?.error ?? text ?? `HTTP ${res.status}`);
        setLoading(false);
        return;
      }
      setItems((json?.data ?? []) as FormRow[]);
      setLoading(false);
    })();
  }, []);

  // Filtrer på valgt tab + søk
  const filtered = useMemo(() => {
    let list = items;
    if (tab === 'draft') list = list.filter(i => i.status === 'draft');
    if (tab === 'submitted') list = list.filter(i => i.status === 'submitted');

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(i =>
        (i.title ?? '').toLowerCase().includes(q) ||
        i.form_type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, tab, query]);

  const counts = useMemo(() => ({
    all: items.length,
    draft: items.filter(i => i.status === 'draft').length,
    submitted: items.filter(i => i.status === 'submitted').length,
  }), [items]);

  const lastDraft = useMemo(
    () => [...items]
      .filter(i => i.status === 'draft')
      .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0],
    [items]
  );

  if (loading) return <main>Laster…</main>;
  if (error)   return <main className="text-red-600">Feil: {error}</main>;

  return (
    <main className="space-y-4">
      {/* Toppstripe */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Mine kontroller</h1>
        <div className="flex items-center gap-2">
          {lastDraft && (
            <Link
              href={`/forms/${lastDraft.id}/edit`}
              className="px-3 py-2 rounded border hover:bg-gray-50"
              title="Gå til sist påbegynte utkast"
            >
              Fortsett sist
            </Link>
          )}
          <Link
            href="/forms/new"
            className="px-3 py-2 rounded bg-black text-white hover:opacity-90"
          >
            Ny kontroll
          </Link>
        </div>
      </div>

      {/* Faner + søk */}
      <div className="flex flex-wrap items-center gap-2">
        <Tab label={`Alle (${counts.all})`} active={tab==='all'} onClick={() => setTab('all')} />
        <Tab label={`Påbegynte (${counts.draft})`} active={tab==='draft'} onClick={() => setTab('draft')} />
        <Tab label={`Utførte (${counts.submitted})`} active={tab==='submitted'} onClick={() => setTab('submitted')} />
        <div className="ml-auto w-full sm:w-64">
          <input
            placeholder="Søk i tittel/typenavn…"
            className="w-full border rounded p-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tom-tilfelle */}
      {filtered.length === 0 && (
        <div className="rounded border p-4 bg-white">
          <p className="mb-3">Ingen {tab === 'draft' ? 'påbegynte' : tab === 'submitted' ? 'utførte' : ''} kontroller.</p>
          <Link
            href="/forms/new"
            className="inline-block px-3 py-2 rounded bg-black text-white hover:opacity-90"
          >
            Opprett ny kontroll
          </Link>
        </div>
      )}

      {/* Liste */}
      {filtered.length > 0 && (
        <ul className="divide-y rounded border bg-white">
          {filtered.map((f) => (
            <li key={f.id} className="py-3 px-3 flex justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium truncate">
                    {f.title || (f.form_type === 'KS0322' ? 'Fullstendig kontroll' : 'Periodisk forenklet kontroll')}
                  </div>
                  <Badge
                    color={f.status === 'submitted' ? 'green' : 'gray'}
                    label={f.status === 'submitted' ? 'Utført' : 'Utkast'}
                  />
                  <Badge
                    color="blue"
                    label={f.form_type === 'KS0322' ? 'Fullstendig' : 'Periodisk'}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Sist oppdatert: {new Date(f.updated_at).toLocaleString()}
                </div>
              </div>
              <Link
                className="shrink-0 self-center text-blue-600 hover:underline"
                href={`/forms/${f.id}/${f.status === 'draft' ? 'edit' : 'view'}`}
              >
                Åpne
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

/* Små UI-hjelpere */

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded border text-sm ${
        active ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function Badge({ label, color }: { label: string; color: 'green'|'gray'|'blue' }) {
  const classes = color === 'green'
    ? 'bg-green-100 text-green-800 border-green-200'
    : color === 'blue'
    ? 'bg-blue-100 text-blue-800 border-blue-200'
    : 'bg-gray-100 text-gray-800 border-gray-200';
  return (
    <span className={`text-xs px-2 py-1 rounded border ${classes}`}>
      {label}
    </span>
  );
}
