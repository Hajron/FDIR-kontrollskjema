# Kontrollskjema – Next.js + Supabase (protected + bearer)

## Oppsett
1. Lag `.env.local` med:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
2. Kjør SQL i Supabase (i denne rekkefølgen): `supabase/001_schema.sql`, `002_rls.sql`
3. Opprett Storage bucket `attachments` (private) i Dashboard, så `supabase/003_storage.sql`
4. Installer & start:
   ```bash
   npm install
   npm run dev
   ```

## Viktig
- App bruker **(protected)**-route group med `requireUser()` for å beskytte sider.
- Klienten sender **Authorization: Bearer <token>** til API-ruter.
- Historikk og alle mutate-kall sender token (se sider under `app/(protected)/forms/`).
- Vedlegg lastes opp via Supabase Storage SDK som innlogget bruker.
