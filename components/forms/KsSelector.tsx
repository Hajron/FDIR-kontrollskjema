'use client';
import { useState } from 'react';

export default function KsSelector({ onCreate }: { onCreate: (t: 'KS0322'|'KS0319', title: string)=>void }) {
  const [type, setType] = useState<'KS0322'|'KS0319'>('KS0322');
  const [title, setTitle] = useState('');
  return (
    <div className="space-y-2">
      <select className="border p-2 rounded" value={type} onChange={e=>setType(e.target.value as any)}>
        <option value="KS0322">KS-0322 (fullstendig)</option>
        <option value="KS0319">KS-0319 (periodisk)</option>
      </select>
      <input className="border p-2 rounded w-full" placeholder="Tittel (valgfritt)" value={title} onChange={e=>setTitle(e.target.value)} />
      <button className="px-3 py-2 bg-black text-white rounded" onClick={()=>onCreate(type, title)}>Opprett</button>
    </div>
  );
}
