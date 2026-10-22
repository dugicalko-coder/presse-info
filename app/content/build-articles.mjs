// Liest die Redaktions-JSON-Dateien (Ordner als 1. Argument) und schreibt eine Upsert-Migration (Pfad als 2. Argument).
// Aufruf: node content/build-articles.mjs /home/user/presseinfo-content migrations/0005_articles.sql
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [dir, out] = process.argv.slice(2);
const CATS = {
  politik: ["Innenpolitik", "Parlament", "Europa", "Gemeinden"],
  wirtschaft: ["Konjunktur", "Unternehmen", "Finanzen", "Arbeit & Karriere", "Gründen", "Medien & PR"],
  chronik: ["Österreich", "Wien", "Verkehr", "Wetter"],
  "bauen-wohnen": ["Bauen", "Sanieren", "Immobilien", "Garten"],
  energie: ["Photovoltaik", "Heizen", "Förderungen", "Klima"],
  gesundheit: ["Medizin", "Pflege", "Ernährung", "Psyche"],
  kultur: ["Bühne", "Musik", "Ausstellungen", "Ausflüge"],
  lifestyle: ["Essen & Trinken", "Mobilität", "Reisen", "Schönheit"],
};
const REGIONS = ["wien", "niederoesterreich", "burgenland", "oberoesterreich", "steiermark", "kaernten", "salzburg", "tirol", "vorarlberg"];
const q = (v) => (v === null || v === undefined || v === "" ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const slugify = (s) => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);

const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
const seen = new Set();
const rows = [];
const problems = [];
for (const f of files) {
  let arr;
  try { arr = JSON.parse(readFileSync(join(dir, f), "utf8")); } catch (e) { problems.push(`${f}: ungültiges JSON (${e.message})`); continue; }
  for (const a of arr) {
    const slug = slugify(a.slug || a.title || "");
    if (!slug || seen.has(slug)) { problems.push(`${f}: doppelter/leerer slug ${slug}`); continue; }
    if (!CATS[a.category]) { problems.push(`${f}: Rubrik ${a.category}`); continue; }
    const topic = CATS[a.category].includes(a.topic) ? a.topic : null;
    if (!topic) problems.push(`${f}: Thema "${a.topic}" (${slug}) -> leer`);
    const region = REGIONS.includes(a.region) ? a.region : null;
    const kind = ["news", "ratgeber", "presse"].includes(a.kind) ? a.kind : "ratgeber";
    if (!a.title || !a.body || a.body.length < 400) { problems.push(`${f}: ${slug} zu kurz`); continue; }
    const iso = new Date(a.published_at || "2026-10-15T09:00:00+02:00").toISOString();
    const imgPath = `public/assets/img/artikel/${slug}.webp`;
    const image = existsSync(new URL(`../${imgPath}`, import.meta.url)) ? `/assets/img/artikel/${slug}.webp` : null;
    seen.add(slug);
    const cols = {
      slug, title: a.title, teaser: a.teaser ?? "", body: a.body, category: a.category, topic, region, kind,
      author: a.author || "Presseinfo Redaktion", image, source_name: a.source_name, source_url: a.source_url,
      status: "published", published_at: iso, updated_at: new Date().toISOString(),
      meta_title: a.meta_title, meta_description: a.meta_description, focus_keyword: a.focus_keyword,
      keywords: Array.isArray(a.keywords) ? JSON.stringify(a.keywords) : a.keywords, image_alt: a.image_alt, image_prompt: a.image_prompt,
      faq: Array.isArray(a.faq) && a.faq.length ? JSON.stringify(a.faq) : null, service: a.service ? 1 : 0,
    };
    const names = Object.keys(cols);
    const vals = names.map((n) => (n === "service" ? String(cols[n]) : q(cols[n])));
    const upd = names.filter((n) => n !== "slug" && n !== "image").map((n) => `${n}=excluded.${n}`).join(", ");
    rows.push(`INSERT INTO articles (${names.join(",")}) VALUES (${vals.join(",")}) ON CONFLICT(slug) DO UPDATE SET ${upd}, image=COALESCE(excluded.image, articles.image);`);
  }
}
writeFileSync(out, `-- Redaktionsbeiträge (generiert aus content-JSON)\n${rows.join("\n")}\n`);
console.log(`${rows.length} Beiträge -> ${out}`);
if (problems.length) console.log("Hinweise:\n" + problems.join("\n"));
