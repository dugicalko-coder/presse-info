-- Benutzer (Admin, Redakteure, Bots), Sitzungen und Freigabe-Workflow (additiv)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email TEXT UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'redakteur',
  status TEXT NOT NULL DEFAULT 'pending',
  pw_hash TEXT,
  pw_salt TEXT,
  api_token_hash TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
ALTER TABLE articles ADD COLUMN submitted_by INTEGER;
ALTER TABLE articles ADD COLUMN review_note TEXT;
-- Hauptadmin wird direkt in der Datenbank angelegt (kein Passwort-Hash im Repository).
