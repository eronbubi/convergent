# Claudemotion

Eine Plattform für Motion-Stücke, die mit Code gemacht sind. Jeder Post zeigt den Clip, ein Standbild daraus
(das Foto im Feed), den exakten Prompt, das Modell, das den Code geschrieben hat, empfohlene Modelle und den Prompt
Engineer. Besucher kopieren Prompts mit einem Klick, und die Seite zählt, wie viele Leute das getan haben.

## Funktionen

- Registrierung mit Benutzername, E-Mail-Bestätigung, Login, Passwort-Reset, Profil bearbeiten
- Posts mit Clip (MP4/WebM/MOV, bis 50 MB und 3 Minuten). Das Foto wird per Schieberegler direkt aus dem Clip gewählt.
- Titel, Prompt, Modell und empfohlene Modelle als Freitext (Vorschläge kommen aus Modellen, die schon auf der Seite stehen), Prompt Engineer, bis zu 6 Tags
- Im Feed läuft der Clip beim Hover (Maus) bzw. sobald er im Bild ist (Touch); auf der Post-Seite mit eigenem Player
- For-You-Feed mit drei Posts pro Reihe und Endlos-Scrollen, dazu „Latest“, „Most copied“ und Tag-Filter
- Suche nach Nutzern, Tags und Titeln (⌘K oder `/`)
- Kopier-Zähler pro Post, einmal pro Person bzw. Browser
- Profilseiten mit eigenen Posts und Posts, bei denen jemand als Prompt Engineer genannt ist
- Handgezeichnete Linien, Scroll-Animationen, ruhiges Smooth-Scrolling; „Bewegung reduzieren“ im System wird respektiert

## Technik

Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, Motion, Lenis, Rough.js, Supabase
(Auth, Postgres, Storage).

```bash
npm install
npm run dev      # http://localhost:3000
```

Ohne Supabase-Zugangsdaten läuft die Seite mit Demo-Posts aus `public/demo`. Wie man Supabase verbindet, steht in
[SETUP.md](SETUP.md).

## Struktur

| Pfad                       | Inhalt                                                        |
| -------------------------- | ------------------------------------------------------------- |
| `src/app`                  | Seiten, API-Routen (`/api/posts`, `/api/search`, `/api/copy`) und Server Actions |
| `src/components`           | UI: Feed, Post-Karten, Upload, Suche, Zeichnungen (`sketch/`) |
| `src/lib/data.ts`          | Datenzugriff (Supabase oder Demo-Daten)                       |
| `supabase/schema.sql`      | Tabellen, Sicherheitsregeln, Feed-Ranking, Storage            |
| `supabase/templates`       | E-Mail-Vorlagen im Stil der Seite                             |
