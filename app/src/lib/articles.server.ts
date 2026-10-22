import { randomHex } from "./auth.server";
import { db } from "./db.server";
import { CATEGORIES } from "./site";
import { slugify, type ArticleInputT } from "./article-input";

/** Speichert einen Beitrag zur Freigabe (Status "review"). Gemeinsam fuer Portal und API. */
export async function saveForReview(userId: number, authorName: string, data: ArticleInputT, existingId?: number) {
  const d = db();
  if (!d) throw new Error("Keine Datenbank");
  const now = new Date().toISOString();
  const cat = CATEGORIES.find((c) => c.slug === data.category)!;
  const topic = data.topic && cat.topics.includes(data.topic) ? data.topic : null;
  const vals = [
    data.title, data.teaser, data.body, data.category, topic, data.region ?? null, data.kind, data.sender, data.sender_url, data.image, data.image_alt,
    data.source_name, data.source_url, data.meta_title, data.meta_description, data.focus_keyword,
    data.keywords?.length ? JSON.stringify(data.keywords) : null, data.faq?.length ? JSON.stringify(data.faq) : null, data.service ? 1 : 0,
  ];
  if (existingId) {
    const row = await d.prepare("SELECT submitted_by, status FROM articles WHERE id = ?").bind(existingId).first<{ submitted_by: number | null; status: string }>();
    if (!row || row.submitted_by !== userId) throw new Error("Nicht erlaubt");
    if (row.status === "published") throw new Error("Bereits veröffentlicht – Änderungen nur durch die Redaktionsleitung.");
    await d.prepare("UPDATE articles SET title=?, teaser=?, body=?, category=?, topic=?, region=?, kind=?, sender=?, sender_url=?, image=?, image_alt=?, source_name=?, source_url=?, meta_title=?, meta_description=?, focus_keyword=?, keywords=?, faq=?, service=?, status='review', review_note=NULL, updated_at=? WHERE id=?")
      .bind(...vals, now, existingId).run();
    return { id: existingId };
  }
  let slug = slugify(data.title);
  if (await d.prepare("SELECT 1 FROM articles WHERE slug = ?").bind(slug).first()) slug = `${slug}-${randomHex(3)}`;
  const r = await d
    .prepare("INSERT INTO articles (title, teaser, body, category, topic, region, kind, sender, sender_url, image, image_alt, source_name, source_url, meta_title, meta_description, focus_keyword, keywords, faq, service, slug, author, status, submitted_by, published_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'review',?,?,?) RETURNING id")
    .bind(...vals, slug, authorName, userId, now, now)
    .run();
  return { id: Number(r.meta.last_row_id), slug };
}

