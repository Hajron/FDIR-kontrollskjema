// lib/auth.ts
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function requireUser() {
  const cookieStore = cookies();
  const bearer = cookieStore.get('sb-access-token')?.value; // <- NYTT

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
      // Bruk bearer-token hvis vi har satt den fra klienten
      ...(bearer ? { global: { headers: { Authorization: `Bearer ${bearer}` } } } : {}),
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return user;
}
