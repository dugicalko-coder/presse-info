-- Row Level Security: Die Tabellen liegen im oeffentlichen Schema und waeren sonst ueber die
-- Supabase-API (anon-Key) les- und schreibbar. Die App verbindet sich als Rolle "postgres"
-- (umgeht RLS), daher sind keine Policies noetig: anon/authenticated erhalten keinen Zugriff.
ALTER TABLE IF EXISTS _migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessions ENABLE ROW LEVEL SECURITY;
