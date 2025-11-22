'use client';
import { supabase } from '@/lib/supabase/client';
import { useState } from 'react';

export default function AttachmentUploader({ formId }: { formId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null); setOk(null);
    const { data: { user }, error: ue } = await supabase.auth.getUser();
    if (ue || !user) { setError(ue?.message || 'Ikke innlogget'); return; }
    const path = `${user.id}/${formId}/${Date.now()}_${file.name}`;

    const { error: se } = await supabase.storage.from('attachments').upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (se) { setError(se.message); return; }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';

    await fetch(`/api/forms/${formId}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ path, mime: file.type, size: file.size })
    });
    setOk('Lastet opp');
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium">Vedlegg</label>
      <input type="file" onChange={e => e.target.files && upload(e.target.files[0])} />
      {ok && <div className="text-green-600 text-sm">{ok}</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  );
}
