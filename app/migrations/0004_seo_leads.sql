-- SEO-Felder, Dienstleister-Kennzeichen und Leads (additiv)
ALTER TABLE articles ADD COLUMN meta_title TEXT;
ALTER TABLE articles ADD COLUMN meta_description TEXT;
ALTER TABLE articles ADD COLUMN focus_keyword TEXT;
ALTER TABLE articles ADD COLUMN keywords TEXT;
ALTER TABLE articles ADD COLUMN image_alt TEXT;
ALTER TABLE articles ADD COLUMN image_prompt TEXT;
ALTER TABLE articles ADD COLUMN faq TEXT;
ALTER TABLE articles ADD COLUMN service INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner TEXT NOT NULL,
  article_slug TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location TEXT,
  message TEXT,
  timing TEXT,
  status TEXT NOT NULL DEFAULT 'neu',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at);

-- Doppelte Fotos entfernen: Redaktionsbeiträge ohne eigenes Bild bekommen eine Titelkarte
UPDATE articles SET image = NULL WHERE kind <> 'presse';

-- Presseaussendungen: eigene, einzigartige KI-Bilder
UPDATE articles SET image = '/assets/img/artikel/' || slug || '.webp' WHERE slug IN ('presseinfo-startet-portal-nachrichten-presseaussendungen','heizexperten-waermepumpen-r290-wien-noe-burgenland','solar-wien-photovoltaikanlagen-haushalte-betriebe','alpenkraft-projektbau-wohnungssanierung-wien','kranwien-turmdrehkrane-baustellen-wien');
