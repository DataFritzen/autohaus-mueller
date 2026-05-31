# AlltagsArena Web

Professionelles Web-App-Grundgeruest fuer AlltagsArena.

## Setup

```powershell
cd web
npm install
npm run dev
```

Danach laeuft die App standardmaessig auf `http://localhost:3000`.

## Umgebung

Kopiere `.env.example` nach `.env.local` und setze die Supabase-Werte:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` darf nur serverseitig genutzt werden.

## Aktueller Status

Dieses Geruest enthaelt:

- App-Struktur
- Supabase-Migration
- TypeScript-Domain-Types
- UI-Grundseiten fuer Hero-Erstellung und Arena
- Hero-Preview-API
- plausible Zufallswert-API
- Alias-Player-API
- Hero-Speichern-API
- Datenschutzorientiertes Datenmodell

Die Python-Referenzlogik bleibt vorerst die fachliche Quelle fuer Hero-Generierung und Kampfmechanik.

## Erste Checks nach Installation

```powershell
npm run typecheck
npm run dev
```

Danach im Browser pruefen:

- `/heroes`
- Button `Profil wuerfeln`
- Button `Werte pruefen`
- Spieler-Alias setzen
- Button `Held speichern`
