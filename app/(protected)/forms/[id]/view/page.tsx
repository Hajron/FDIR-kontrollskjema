'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function ViewForm({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<any>(null);

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

  if (!form) return <p>Laster…</p>;

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">{form.title || form.form_type}</h1>
      <a className="px-3 py-2 border rounded inline-block" href={`/api/forms/${params.id}/pdf`} target="_blank">Last ned PDF</a>
    </main>
  );
}
