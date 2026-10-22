import { pgDb, type Database } from "./pg.server";
import type { Article, ArticleCard } from "./types";

export function db(): Database | null {
  return pgDb();
}

const CARD_COLS =
  "id, slug, title, teaser, category, topic, region, kind, sender, sender_url, author, image, image_alt, service, source_name, source_url, status, published_at, updated_at";

export type ListOpts = { category?: string; topic?: string; region?: string; kind?: string; notKind?: string; q?: string; limit?: number; excludeSlug?: string };

export async function listArticles(opts: ListOpts = {}): Promise<ArticleCard[]> {
  const d = db();
  if (!d) return [];
  const where: string[] = ["status = 'published'"];
  const args: (string | number)[] = [];
  if (opts.category) { where.push("category = ?"); args.push(opts.category); }
  if (opts.topic) { where.push("topic = ?"); args.push(opts.topic); }
  if (opts.region) { where.push("region = ?"); args.push(opts.region); }
  if (opts.kind) { where.push("kind = ?"); args.push(opts.kind); }
  if (opts.notKind) { where.push("kind <> ?"); args.push(opts.notKind); }
  if (opts.excludeSlug) { where.push("slug <> ?"); args.push(opts.excludeSlug); }
  if (opts.q) {
    where.push("(title ILIKE ? OR teaser ILIKE ? OR body ILIKE ? OR sender ILIKE ?)");
    const like = `%${opts.q.replace(/[%_]/g, "")}%`;
    args.push(like, like, like, like);
  }
  args.push(opts.limit ?? 30);
  const res = await d
    .prepare(`SELECT ${CARD_COLS} FROM articles WHERE ${where.join(" AND ")} ORDER BY published_at DESC LIMIT ?`)
    .bind(...args)
    .all<ArticleCard>();
  return res.results ?? [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const d = db();
  if (!d) return null;
  return (await d.prepare("SELECT * FROM articles WHERE slug = ? AND status = 'published'").bind(slug).first<Article>()) ?? null;
}
