'use client';
import { useEffect, useMemo, useState } from 'react';

type Vessel = {
  id?: string | number;
  name?: string;
  radio_call_sign?: string;
  // legg gjerne til flere felt du ser i API-svaret (imo, mmsi, etc.)
};

export default function VesselSearch({
  onPick,
}: {
  onPick: (v: Vessel) => void;
}) {
  const [mode, setMode] = useState<'name' | 'radio'>('radio');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [results, setResults] = useState<Vessel[]>([]);

  const placeholder = useMemo(
    () => (mode === 'name' ? 'Søk på fartøynavn…' : 'Søk på radiokallesignal…'),
    [mode]
  );

  useEffect(() => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setErr(null);
        // Enkel heuristikk: vi prøver begge endepunkter hvis uklart
        const base = 'https://api.fiskeridir.no/vessel-api/api/v1/vessels';
        const url =
          mode === 'name'
            ? `${base}?name=${encodeURIComponent(q)}`
            : `${base}?radio_call_sign=${encodeURIComponent(q)}`;

        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `HTTP ${res.status}`);
        }
        const data = await res.json();
        // Anta at data er liste; hvis ikke, håndter objekt
        const list: Vessel[] = Array.isArray(data) ? data : [data];
        setResults(list.slice(0, 20));
      } catch (e: any) {
        if (e.name !== 'AbortError') setErr(e.message || 'Ukjent feil');
      } finally {
        setLoading(false);
      }
    }, 350); // debounce
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [mode, q]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="radio">Kallesignal</option>
          <option value="name">Navn</option>
        </select>
        <input
          className="flex-1 border p-2 rounded"
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading && <div className="text-sm text-gray-500">Søker…</div>}
      {err && <div className="text-sm text-red-600">Feil: {err}</div>}

      {results.length > 0 && (
        <ul className="rounded border divide-y bg-white">
          {results.map((v, idx) => (
            <li key={(v.id as any) ?? idx} className="p-2">
              <button
                className="text-left w-full hover:bg-gray-50 rounded p-1"
                onClick={() => onPick(v)}
                title="Velg fartøy"
              >
                <div className="font-medium">{v.name || 'Ukjent navn'}</div>
                <div className="text-sm text-gray-600">
                  Radio: {v.radio_call_sign || '—'}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
