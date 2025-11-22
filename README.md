-= UNDER UTVIKLING =-
# Kontrollskjema – Next.js + Supabase (protected + bearer)

## 🚀 Rask start (første gang)

### Forutsetninger
- **Node.js** v18+ (sjekk med `node --version`)
- **npm** v9+ (installeres med Node.js)
- **Git** (for å klone repoet)
- En Supabase project (se https://supabase.com/pricing)

### 1. Klon repositoriet
```powershell
git clone https://github.com/Hajron/FDIR-kontrollskjema.git
cd kontrollskjema-app
```

### 2. Installer dependencies
```powershell
npm install
```
Dette installerer alle pakker definert i `package.json`. Tar 1-2 minutter.

### 3. Sett opp miljøvariabler
Lag en `.env.local` fil i rotmappen. Hent verdiene fra Supabase:

**Hvor får jeg disse verdiene?**
1. Logg inn på [Supabase Dashboard](https://app.supabase.com)
2. Velg ditt prosjekt
3. Gå til **Settings → API**
4. Kopier `Project URL` og `anon public key`

**Fyll inn i `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

⚠️ **VIKTIG**: Lagre `.env.local` lokalt og COMMIT den ALDRI til Git!

### 4. Database-oppsett (bare første gang)
I Supabase Dashboard, gå til **SQL Editor** og kjør disse SQL-filene i rekkefølgen:
1. `supabase/001_schema.sql` - opprett tabeller
2. `supabase/002_rls.sql` - sett opp sikkerhet
3. `supabase/003_storage.sql` - oppsett for vedlegg

### 5. Opprett Storage bucket
1. Gå til **Storage** i Supabase Dashboard
2. Klikk **Create bucket**
3. Navn: `attachments`
4. Gjør det **Private**

### 6. Start utviklingsserver
```powershell
npm run dev
```
Åpne http://localhost:3000 i nettleseren din.

---

## 📋 Tilgjengelige kommandoer

```powershell
# Utviklingsserver (auto reload)
npm run dev

# Bygg for produksjon
npm run build

# Start produksjonssserver
npm start

# Kjør tester
npm test
```

---

## 🔒 Sikkerhet & autentisering

- **Protected routes**: App bruker **(protected)**-route group med `requireUser()` for å beskytte sider
- **Bearer tokens**: Klienten sender `Authorization: Bearer <token>` til API-ruter
- **Server-side auth**: `lib/supabase/server.ts` håndterer token-validering
- **Vedlegg**: Lastes opp via Supabase Storage SDK som innlogget bruker

---

## 📁 Prosjektstruktur

```
kontrollskjema-app/
├── app/                  # Next.js App Router
│   ├── (auth)/          # Login & Register sider
│   ├── (protected)/     # Beskyttede sider (krever innlogging)
│   └── api/             # API ruter (backend)
├── components/          # React komponenter
├── lib/                 # Utility funksjoner
│   ├── supabase/       # Supabase klient-setup
│   ├── auth.ts         # Auth helper
│   └── pdf/            # PDF generering
├── .env.local          # Miljøvariabler (IKKE commit denne!)
├── .gitignore          # Git ignore regler
└── package.json        # Dependencier
```

---

## ❌ Felsøking

### Port 3000 er allerede i bruk
```powershell
npm run dev -- -p 3001  # Bruk annen port
```

### "Cannot find module" feil
```powershell
rm -r node_modules package-lock.json
npm install
```

### Supabase tilkoblingsfeil
- Sjekk at `.env.local` har korrekt URL og API-nøkkel
- Bekreft at databasen er tilgjengelig i Supabase Dashboard
- Sjekk at SQL-filene ble kjørt korrekt

### Environment variabler blir ikke lest
- Sørg for at `.env.local` ligger i **rotmappen** (samme plass som `package.json`)
- Restart dev-serveren etter å ha endret `.env.local`

---

## 📚 Dokumentasjon

- [Next.js](https://nextjs.org/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [React Hook Form](https://react-hook-form.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Bidrag

Lag en ny branch for features:
```powershell
git checkout -b feature/ny-feature
git add .
git commit -m "Legg til ny feature"
git push origin feature/ny-feature
```
