-- Presseinfo: Artikel, Presseaussendungen, Einreichungen, Newsletter. Nur additive Aenderungen.
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  topic TEXT,
  region TEXT,
  kind TEXT NOT NULL DEFAULT 'news',
  sender TEXT,
  sender_url TEXT,
  author TEXT NOT NULL DEFAULT 'Presseinfo Redaktion',
  image TEXT,
  source_name TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_articles_pub ON articles (status, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_cat ON articles (category, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_kind ON articles (kind, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_region ON articles (region, published_at);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  region TEXT,
  timing TEXT,
  package TEXT,
  status TEXT NOT NULL DEFAULT 'neu',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
