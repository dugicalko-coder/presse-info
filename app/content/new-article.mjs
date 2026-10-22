// Schreibt EINEN neuen Beitrag (JSON-Datei, Format wie content/REDAKTION.md) als eigene Migration.
// Aufruf: node content/new-article.mjs /pfad/beitrag.json
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const src = process.argv[2];
const a = JSON.parse(readFileSync(src, "utf8"));
const tmp = "/tmp/pi-one"; mkdirSync(tmp, { recursive: true });
writeFileSync(`${tmp}/one.json`, JSON.stringify(Array.isArray(a) ? a : [a]));
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
const out = `migrations/${stamp}_artikel.sql`;
execFileSync("node", ["content/build-articles.mjs", tmp, out], { stdio: "inherit" });
