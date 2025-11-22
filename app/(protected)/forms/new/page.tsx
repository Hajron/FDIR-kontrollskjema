'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import VesselSearch from '@/components/vessel/VesselSearch';
import KsSelector from '@/components/forms/KsSelector';

type Hull = 'Tre' | 'Stål/Aluminium' | 'GRP og Sandwich';
type FormType = 'KS0322' | 'KS0319';

export default function NewFormPage() {
  const router = useRouter();

  // Skjema-meta felter
  const [formType, setFormType] = useState<FormType>('KS0319'); // du ønsket Periodisk/Fullstendig: mappes til KS0319/KS0322
  const [controllerName, setControllerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [hull, setHull] = useState<Hull>('Tre');

  const [vessel, setVessel] = useState<any>(null);
  const [title, setTitle] = useState(''); // valgfritt

  const onPickVessel = (v: any) => {
    setVessel(v);
    if (!title && v?.name) setTitle(v.name);
  };

  const createForm = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';

    // 1) Opprett selve skjemaet (som før)
    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ form_type: formType, title }),
    });

    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch {}

    if (!res.ok) {
      const msg = (json?.error ?? text) || `HTTP ${res.status}`;
      alert(`Kunne ikke opprette skjema: ${msg}`);
      return;
    }

    const id = json?.data?.id;
    if (!id) {
      alert('Uventet svar fra server: mangler id');
      return;
    }

    // 2) Lagre “_meta”-seksjon slik at disse verdiene følger skjemaet videre
    const meta = {
      kontrolltype: formType === 'KS0319' ? 'Periodisk forenklet kontroll' : 'Fullstendig kontroll',
      kontrollor_navn: controllerName || null,
      firma_navn: companyName || null,
      dato: date || null,
      skrogtype: hull,
      vessel: vessel
        ? {
            id: vessel.id ?? null,
            name: vessel.name ?? null,
            radio_call_sign: vessel.radio_call_sign ?? null,
          }
        : null,
      // legg gjerne inn flere felter fra API-responsen ved behov
    };

    await fetch(`/api/forms/${id}/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ section_key: '_meta', data: meta }),
    });

    // 3) Gå til redigering
    router.push(`/forms/${id}/edit`);
  };

  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">Ny kontroll</h1>

      {/* Valg av type kontroll (Periodisk/Fullstendig) */}
      <div className="space-y-2">
        <label className="block font-medium">Type kontroll</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormType('KS0319')}
            className={`px-3 py-2 rounded border ${formType === 'KS0319' ? 'bg-black text-white' : 'bg-white'}`}
          >
            Periodisk forenklet kontroll
          </button>
          <button
            type="button"
            onClick={() => setFormType('KS0322')}
            className={`px-3 py-2 rounded border ${formType === 'KS0322' ? 'bg-black text-white' : 'bg-white'}`}
          >
            Fullstendig kontroll
          </button>
        </div>
      </div>

      {/* Kontrollør og firma */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Navn på kontrollør</label>
          <input
            className="w-full border p-2 rounded"
            value={controllerName}
            onChange={(e) => setControllerName(e.target.value)}
            placeholder="F.eks. Ola Normann"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Firma</label>
          <input
            className="w-full border p-2 rounded"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Firmanavn"
          />
        </div>
      </div>

      {/* Dato */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Dato</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            type="button"
            className="mt-1 text-sm underline"
            onClick={() => setDate(new Date().toISOString().slice(0, 10))}
          >
            Sett dagens dato
          </button>
        </div>

        {/* Skrogtype */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Skrogtype</label>
          <select
            className="w-full border p-2 rounded"
            value={hull}
            onChange={(e) => setHull(e.target.value as any)}
          >
            <option>Tre</option>
            <option>Stål/Aluminium</option>
            <option>GRP og Sandwich</option>
          </select>
        </div>
      </div>

      {/* Fartøysøk */}
      <div className="space-y-2">
        <label className="block font-medium">Søk etter fartøy (navn eller radio call sign)</label>
        <VesselSearch onPick={onPickVessel} />
        {vessel && (
          <div className="text-sm text-gray-700">
            Valgt: <strong>{vessel.name || '—'}</strong> (radio: <strong>{vessel.radio_call_sign || '—'}</strong>)
          </div>
        )}
      </div>

      {/* Valgfri tittel (vises i “Mine kontroller”) */}
      <div>
        <label className="block text-sm text-gray-700 mb-1">Tittel (valgfritt)</label>
        <input
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="F.eks. Kontroll av M/S Eksempel"
        />
      </div>

      {/* Opprett */}
      <div>
        <button
          className="px-4 py-2 rounded bg-black text-white"
          onClick={createForm}
        >
          Opprett
        </button>
      </div>
    </main>
  );
}
