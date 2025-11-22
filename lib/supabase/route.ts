import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

// Supabase-klient for API routes som leser bearer-token fra Authorization header
export function createSupabaseForRoute(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') ?? '';

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );
}
