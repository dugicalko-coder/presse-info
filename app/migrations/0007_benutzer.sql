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

-- Hauptadmin (Passwort nur als PBKDF2-Hash gespeichert)
INSERT OR IGNORE INTO users (username, email, name, role, status, pw_hash, pw_salt)
VALUES ('Admin', NULL, 'Hauptadmin', 'admin', 'active', 'cd8e4cd821b97965a2a82d2f8a4630a5a9904073a0761192bc73f6f79791d0ad', 'cfdb9e8dd99a2e59c258e54499508a2e');
