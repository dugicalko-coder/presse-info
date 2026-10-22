// Postgres (Supabase) mit D1-kompatibler Schnittstelle (prepare/bind/all/first/run/batch),
// damit der bestehende Code unveraendert bleibt. Wendet beim ersten Zugriff alle
// SQL-Dateien aus /migrations an (SQLite-Dialekt wird nach Postgres uebersetzt).
import postgres from "postgres";

import { bindings } from "./bindings.server";

type Row = Record<string, unknown>;
type Sql = ReturnType<typeof postgres>;

let client: Sql | null = null;
let readyPromise: Promise<void> | null = null;

function sqlClient(): Sql | null {
  if (client) return client;
  const url = bindings().DATABASE_URL;
  if (!url) return null;
  const local = /@(localhost|127\.0\.0\.1)/.test(url);
  client = postgres(url, {
    prepare: false, // Supabase-Pooler (Transaktionsmodus)
    max: 3,
    idle_timeout: 20,
    connect_timeout: 15,
    ssl: local ? false : "require",
    onnotice: () => undefined,
  });
  return client;
}

import { sqliteToPg, toPgQuery } from "./sql-dialect";

const MIGRATIONS = import.meta.glob("../../migrations/*.sql", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

async function migrate(sql: Sql) {
  await sql.unsafe("CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
  const done = new Set((await sql.unsafe("SELECT name FROM _migrations")).map((r) => String((r as Row).name)));
  const files = Object.keys(MIGRATIONS).sort().filter((k) => !done.has(k.split("/").pop()!));
  if (!files.length) return;
  await sql.begin(async (tx) => {
    await tx.unsafe("SELECT pg_advisory_xact_lock(727272)");
    const again = new Set((await tx.unsafe("SELECT name FROM _migrations")).map((r) => String((r as Row).name)));
    for (const f of files) {
      const name = f.split("/").pop()!;
      if (again.has(name)) continue;
      for (const stmt of sqliteToPg(MIGRATIONS[f])) await tx.unsafe(stmt);
      await tx.unsafe("INSERT INTO _migrations (name) VALUES ($1)", [name]);
    }
  });
}

function ready(sql: Sql) {
  if (!readyPromise) readyPromise = migrate(sql).catch((e) => { readyPromise = null; throw e; });
  return readyPromise;
}

/** int8 (COUNT, SUM) als Zahl statt String liefern. */
function normalize(rows: postgres.RowList<Row[]>): Row[] {
  const big = (rows.columns ?? []).filter((c) => c.type === 20 || c.type === 1700).map((c) => c.name);
  if (!big.length) return [...rows];
  return rows.map((r) => {
    const o: Row = { ...r };
    for (const k of big) if (o[k] !== null && o[k] !== undefined) o[k] = Number(o[k]);
    return o;
  });
}

export class Statement {
  constructor(private sql: Sql, private query: string, private args: unknown[] = []) {}
  bind(...args: unknown[]) {
    return new Statement(this.sql, this.query, args);
  }
  async exec(tx?: Sql) {
    await ready(this.sql);
    const q = toPgQuery(this.query);
    const params = this.args.map((a) => (a === undefined ? null : typeof a === "boolean" ? (a ? 1 : 0) : a)) as postgres.ParameterOrJSON<never>[];
    return normalize(await (tx ?? this.sql).unsafe(q, params));
  }
  async all<T = Row>(): Promise<{ results: T[] }> {
    return { results: (await this.exec()) as T[] };
  }
  async first<T = Row>(): Promise<T | null> {
    const r = await this.exec();
    return (r[0] as T) ?? null;
  }
  async run(): Promise<{ meta: { last_row_id: number | null; changes: number } }> {
    const r = await this.exec();
    const id = (r[0] as Row | undefined)?.id;
    return { meta: { last_row_id: id === undefined || id === null ? null : Number(id), changes: r.length } };
  }
}

export class Database {
  constructor(private sql: Sql) {}
  prepare(query: string) {
    return new Statement(this.sql, query);
  }
  async batch(stmts: Statement[]) {
    await ready(this.sql);
    const out: { meta: { changes: number } }[] = [];
    await this.sql.begin(async (tx) => {
      for (const s of stmts) out.push({ meta: { changes: (await s.exec(tx as unknown as Sql)).length } });
    });
    return out;
  }
}

let database: Database | null = null;
export function pgDb(): Database | null {
  if (database) return database;
  const s = sqlClient();
  if (!s) return null;
  database = new Database(s);
  return database;
}
