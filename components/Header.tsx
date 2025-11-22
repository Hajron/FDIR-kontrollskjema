'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    try {
      setBusy(true);
      await supabase.auth.signOut();
    } finally {
      // Fjern server-lesbar token-cookie uansett
      document.cookie = 'sb-access-token=; Path=/; Max-Age=0; SameSite=Lax';
      router.push('/login');
      setBusy(false);
    }
  };

  return (
    <header className="mb-4 flex items-center justify-between">
      <a href="/" className="font-semibold">Kontrollskjema</a>
      <button
        onClick={logout}
        disabled={busy}
        className="px-3 py-2 border rounded disabled:opacity-50"
        title="Logg ut"
      >
        {busy ? 'Logger ut…' : 'Logg ut'}
      </button>
    </header>
  );
}
