'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import SectionRenderer from '@/components/forms/SectionRenderer';
import AttachmentUploader from '@/components/forms/AttachmentUploader';
import { KS0322_SECTIONS } from '@/lib/schema/ks0322';
import { KS0319_SECTIONS } from '@/lib/schema/ks0319';

type Form = { id: string; form_type: 'KS0322'|'KS0319'; title?: string };

export default function EditFormPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<Form | null>(null);
  const [sectionKey, setSectionKey] = useState<string>('I.Anmerkninger');
  const [sectionData, setSectionData] = useState<any>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const res = await fetch(`/api/forms/${params.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      setForm(json.data);
    })();
  }, [params.id]);

  const schema = useMemo(() => {
    if (!form) return [];
    return form.form_type === 'KS0322' ? KS0322_SECTIONS : KS0319_SECTIONS;
  }, [form]);

  const currentFields = useMemo(() => {
    const def = (schema as any).find((s: any) => s.key === sectionKey);
    return def?.fields ?? [{ name: 'comment', type: 'text' }];
  }, [schema, sectionKey]);

  const save = useCallback(async (dataOverride?: any) => {
    const payload = dataOverride ?? sectionData;
    if (!dirty && !dataOverride) return;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';

    const res = await fetch(`/api/forms/${params.id}/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ section_key: sectionKey, data: payload }),
    });
    if (res.ok) setDirty(false);
  }, [params.id, sectionKey, sectionData, dirty]);

  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">Rediger: {form?.title || form?.form_type || params.id}</h1>

      <div className="flex gap-2 items-center">
        <select className="border p-2 rounded" value={sectionKey} onChange={e=>setSectionKey(e.target.value)}>
          {(schema as any).map((s: any) => <option key={s.key}>{s.key}</option>)}
        </select>
        <button className="px-3 py-2 border rounded" onClick={()=>save()} disabled={!dirty}>Lagre nå</button>
        <span className="text-sm text-gray-500">{dirty ? 'Ulagrede endringer…' : 'Lagret'}</span>
      </div>

      <SectionRenderer
        sectionKey={sectionKey}
        fields={currentFields as any}
        initialData={sectionData}
        onSave={(vals) => { setSectionData(vals); setDirty(true); }}
      />

      {form && <AttachmentUploader formId={form.id} />}
    </main>
  );
}
