// Server-only Konfiguration aus Umgebungsvariablen (Vercel).
type AppEnv = {
  DATABASE_URL?: string;
  HF_ENV?: string;
  APP_SLUG?: string;
};

export function bindings(): AppEnv {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  return {
    // Supabase-Integration setzt POSTGRES_URL (Pooler); DATABASE_URL als manuelle Alternative.
    DATABASE_URL: env.DATABASE_URL || env.POSTGRES_URL || env.POSTGRES_PRISMA_URL || undefined,
    HF_ENV: env.VERCEL_ENV,
    APP_SLUG: "presseinfo",
  };
}
