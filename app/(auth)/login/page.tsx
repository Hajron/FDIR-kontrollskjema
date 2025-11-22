'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signErr) {
      setLoading(false);
      setError(signErr.message);
      return;
    }

    // Etter vellykket innlogging: hent session og synk access-token til cookie
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      // Gjør token tilgjengelig for server-side requireUser()
      document.cookie = `sb-access-token=${session.access_token}; Path=/; SameSite=Lax`;
    }

    // Hard redirect så server-layout leser den nye cookie’n
    window.location.href = '/';
  };

  return (
    <main className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Logg inn</h1>

      {error && <p className="text-red-600">{error}</p>}

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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="px-3 py-2 bg-black text-white rounded disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Logger inn…' : 'Logg inn'}
        </button>
      </form>

      <p className="text-sm">
        Har du ikke konto?{' '}
        <a href="/register" className="text-blue-600 underline">Registrer</a>
      </p>
    </main>
  );
}
