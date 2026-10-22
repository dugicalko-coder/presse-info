// Uebersetzt SQLite-SQL (Migrationen, ?-Platzhalter) nach Postgres.
/* ───────────── SQLite -> Postgres ───────────── */

type Seg = { code: boolean; text: string };

/** Zerlegt SQL in Code- und String-Segmente ('...' mit '' als Escape). */
function segments(sql: string): Seg[] {
  const out: Seg[] = [];
  let i = 0;
  let buf = "";
  while (i < sql.length) {
    const c = sql[i];
    if (c === "'") {
      if (buf) out.push({ code: true, text: buf });
      buf = "";
      let j = i + 1;
      let s = "'";
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") { s += "''"; j += 2; continue; }
        if (sql[j] === "'") { s += "'"; j++; break; }
        s += sql[j]; j++;
      }
      out.push({ code: false, text: s });
      i = j;
      continue;
    }
    if (c === "-" && sql[i + 1] === "-") {
      // Kommentar bis Zeilenende entfernen
      while (i < sql.length && sql[i] !== "\n") i++;
      continue;
    }
    buf += c;
    i++;
  }
  if (buf) out.push({ code: true, text: buf });
  return out;
}

const NOW_TEXT = "(to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS'))";

/** Teilt ein Migrationsskript in Statements und uebersetzt den Dialekt. */
export function sqliteToPg(script: string): string[] {
  const pre = script.replace(/datetime\(\s*'now'\s*\)/gi, "__NOW__");
  const stmts: string[] = [];
  let cur: Seg[] = [];
  const flush = () => {
    if (!cur.some((s) => s.text.trim())) { cur = []; return; }
    let ignore = false;
    const parts = cur.map((s) => {
      if (!s.code) return s.text;
      let t = s.text;
      if (/INSERT\s+OR\s+IGNORE\s+INTO/i.test(t)) { ignore = true; t = t.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, "INSERT INTO"); }
      t = t.replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, "SERIAL PRIMARY KEY");
      t = t.replace(/\s+COLLATE\s+NOCASE/gi, "");
      t = t.replace(/ADD\s+COLUMN\s+(?!IF\s+NOT\s+EXISTS)/gi, "ADD COLUMN IF NOT EXISTS ");
      t = t.replace(/__NOW__/g, NOW_TEXT);
      return t;
    });
    let stmt = parts.join("").trim();
    if (ignore && !/ON\s+CONFLICT/i.test(stmt)) stmt += " ON CONFLICT DO NOTHING";
    stmts.push(stmt);
    cur = [];
  };
  for (const seg of segments(pre)) {
    if (!seg.code) { cur.push(seg); continue; }
    const pieces = seg.text.split(";");
    pieces.forEach((p, idx) => {
      cur.push({ code: true, text: p });
      if (idx < pieces.length - 1) flush();
    });
  }
  flush();
  return stmts;
}

/** ?-Platzhalter (ausserhalb von Strings) in $1, $2 … umwandeln, plus Laufzeit-Dialekt. */
export function toPgQuery(sql: string): string {
  let n = 0;
  return segments(sql.replace(/datetime\(\s*'now'\s*\)/gi, "__NOW__"))
    .map((s) => (s.code ? s.text.replace(/\?/g, () => `$${++n}`).replace(/__NOW__/g, NOW_TEXT) : s.text))
    .join("");
}

