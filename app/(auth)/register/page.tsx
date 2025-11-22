'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const { error: signErr } = await supabase.auth.signUp({ email, password });
    if (signErr) {
      setLoading(false);
      setError(signErr.message);
      return;
    }

    // Forsøk å hente session (finnes kun hvis e-postbekreftelse er AV)
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      // Bekreftelse AV: sett token-cookie og hard-redirect (så server-layout leser cookie)
      document.cookie = `sb-access-token=${session.access_token}; Path=/; SameSite=Lax`;
      window.location.href = '/';
      return;
    }

    // Bekreftelse PÅ: ingen session ennå – gi klar beskjed og lenke til login
    setLoading(false);
    setInfo('Takk! Sjekk e-posten din for å bekrefte kontoen. Klikk deretter på lenken i e-posten og logg inn.');
  };

  return (
    <main className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Registrer</h1>

      {error && <p className="text-red-600">{error}</p>}
      {info && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          {info}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="E-post"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Passord"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="px-3 py-2 bg-black text-white rounded disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Oppretter…' : 'Opprett konto'}
        </button>
      </form>

      <p className="text-sm">
        Har du allerede konto?{' '}
        <a href="/login" className="text-blue-600 underline">Logg inn</a>
      </p>
    </main>
  );
}
