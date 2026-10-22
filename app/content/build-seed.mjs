import { writeFileSync } from "node:fs";
import { articles } from "./seed.mjs";
const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const cols = "slug,title,teaser,body,category,topic,region,kind,sender,sender_url,author,image,source_name,source_url,status,published_at,updated_at";
const rows = articles.map((a) => {
  const iso = new Date(a.published_at).toISOString();
  return `INSERT OR IGNORE INTO articles (${cols}) VALUES (${[a.slug, a.title, a.teaser, a.body, a.category, a.topic, a.region, a.kind, a.sender ?? null, a.sender_url ?? null, a.author, a.image, a.source_name, a.source_url, "published", iso, iso].map(q).join(",")});`;
});
writeFileSync(new URL("../migrations/0003_content.sql", import.meta.url), `-- Start-Bestand Presseinfo (generiert aus content/seed.mjs)\n${rows.join("\n")}\n`);
console.log(rows.length, "Artikel");
