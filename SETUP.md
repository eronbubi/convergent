# Claudemotion – Supabase verbinden

Ohne Supabase läuft die Seite mit Demo-Posts. Registrierung, E-Mail-Bestätigung, Uploads und der echte
Kopier-Zähler funktionieren, sobald diese Schritte erledigt sind (ca. 10 Minuten).

## 1. Projekt anlegen

1. Auf [supabase.com](https://supabase.com) ein kostenloses Projekt erstellen.
2. **Project Settings → API Keys** öffnen und notieren:
   - **Project URL** (z. B. `https://abcd1234.supabase.co`)
   - **Publishable key** (`sb_publishable_…`, früher „anon key“)
   - **Secret key** (`sb_secret_…`, früher „service_role key“). Der bleibt geheim und gehört nur auf den Server.

## 2. Datenbank einrichten

**SQL Editor → New query**, den kompletten Inhalt von [`supabase/schema.sql`](supabase/schema.sql) einfügen und
**Run** drücken. Das legt an:

- Tabellen `profiles`, `posts`, `prompt_copies` mit Row Level Security
- den Storage-Bucket `media` (öffentlich lesbar, max. 50 MB, Clips plus die daraus genommenen Standbilder). Jeder Nutzer darf nur in seinen eigenen Ordner schreiben.
- die Funktionen für den For-You-Feed, die Suche und den Kopier-Zähler

Das Skript kann gefahrlos erneut ausgeführt werden.

## 3. Login und E-Mails

**Authentication → Sign In / Providers → Email**: „Confirm email“ muss **an** sein (Standard).

**Authentication → URL Configuration**:

- **Site URL**: die Adresse der Seite, z. B. `https://claudemotion.vercel.app`
- **Redirect URLs**: dieselbe Adresse mit `/**` dahinter, plus `http://localhost:3000/**` für lokale Tests

**Authentication → Emails → Templates**: Die Links in den Mails müssen auf `/auth/confirm` der Seite zeigen.
Am einfachsten die fertigen Vorlagen einfügen:

| Vorlage          | Datei                                                                            | Betreff               |
| ---------------- | -------------------------------------------------------------------------------- | --------------------- |
| Confirm signup   | [`supabase/templates/confirm-signup.html`](supabase/templates/confirm-signup.html) | Confirm your email    |
| Reset password   | [`supabase/templates/reset-password.html`](supabase/templates/reset-password.html) | Reset your password   |

> Der eingebaute Supabase-Mailversand ist auf wenige Mails pro Stunde begrenzt und nur zum Testen gedacht.
> Für echten Betrieb unter **Authentication → Emails → SMTP Settings** einen Anbieter eintragen
> (z. B. Resend, Postmark oder Brevo).

## 4. Umgebungsvariablen

Lokal eine Datei `.env.local` anlegen (Vorlage: [`.env.example`](.env.example)):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Auf **Vercel** unter **Project → Settings → Environment Variables** dieselben vier Variablen eintragen
(`NEXT_PUBLIC_SITE_URL` = die echte Domain) und danach neu deployen.

`SUPABASE_SECRET_KEY` wird nur gebraucht, um Kopien von **nicht angemeldeten** Besuchern zu zählen. Ohne ihn
zählen nur Kopien angemeldeter Nutzer.

## 5. Testen

```bash
npm install
npm run dev
```

1. `/signup` → Konto anlegen → Mail öffnen → Link führt zu `/welcome`
2. `/new` → Clip hochladen, Standbild wählen, Prompt, Modell, empfohlene Modelle, Prompt Engineer und Tags ausfüllen
3. Im Feed oder auf der Post-Seite „Copy prompt“ klicken → Zähler steigt (einmal pro Person)

## Wie der For-You-Feed sortiert

Jeder Post bekommt eine Punktzahl aus

- **Kopien**: `ln(1 + Anzahl) × 1,2`
- **Frische**: bis zu 4 Punkte, die über ein paar Tage abklingen
- **Deinen Tags**: Tags von Posts, deren Prompt du schon kopiert hast, geben Bonus (nur angemeldet)

Die Gewichte stehen in `feed_posts` in `supabase/schema.sql` und lassen sich dort anpassen.
