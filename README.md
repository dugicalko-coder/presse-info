# Presseinfo.at

Nachrichten- und Presseportal für Österreich (TanStack Start, React 19, Postgres/Supabase, Vercel).

- Code: `app/` (Vercel Root Directory)
- Datenbank: Supabase Postgres, Verbindung über `POSTGRES_URL` bzw. `DATABASE_URL`
- Migrationen: `app/migrations/*.sql` (SQLite-Dialekt, werden beim ersten Request automatisch nach Postgres übersetzt und angewendet)
- Neue Beiträge: siehe `app/content/REDAKTION.md` – JSON schreiben, `node content/new-article.mjs`, committen, pushen → Vercel deployt automatisch.
