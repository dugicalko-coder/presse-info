import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db, getArticleBySlug, listArticles } from "../db.server";
import { CATEGORIES, PACKAGE_OPTIONS, REGIONS, TIMING_OPTIONS, categoryBySlug, regionBySlug, topicSlug } from "../site";

export const getTicker = createServerFn({ method: "GET" }).handler(async () => {
  const items = await listArticles({ limit: 8 });
  return items.map((a) => ({ slug: a.slug, title: a.title, published_at: a.published_at }));
});

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const [latest, ratgeber, presse, regional] = await Promise.all([
    listArticles({ notKind: "presse", limit: 24 }),
    listArticles({ kind: "ratgeber", limit: 6 }),
    listArticles({ kind: "presse", limit: 6 }),
    listArticles({ limit: 60 }),
  ]);
  const regionCounts: Record<string, number> = {};
  for (const a of regional) if (a.region) regionCounts[a.region] = (regionCounts[a.region] ?? 0) + 1;
  return { latest, ratgeber, presse, regionCounts };
});

export const getCategory = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string(), thema: z.string().optional() }))
  .handler(async ({ data }) => {
    const cat = categoryBySlug(data.slug);
    if (!cat) return null;
    const topic = data.thema ? cat.topics.find((t) => topicSlug(t) === data.thema) : undefined;
    return { slug: cat.slug, topic: topic ?? null, articles: await listArticles({ category: cat.slug, topic, limit: 60 }) };
  });

export const getRegion = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const r = regionBySlug(data.slug);
    if (!r) return null;
    return { slug: r.slug, articles: await listArticles({ region: r.slug, limit: 60 }) };
  });

export const getPress = createServerFn({ method: "GET" }).handler(async () => ({ articles: await listArticles({ kind: "presse", limit: 100 }) }));

export const getNews = createServerFn({ method: "GET" }).handler(async () => ({ articles: await listArticles({ notKind: "presse", limit: 100 }) }));

export const searchArticles = createServerFn({ method: "GET" })
  .inputValidator(z.object({ q: z.string().max(80) }))
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (q.length < 2) return { q, articles: [] };
    return { q, articles: await listArticles({ q, limit: 40 }) };
  });

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const article = await getArticleBySlug(data.slug);
    if (!article) return null;
    const related = await listArticles({ category: article.category, limit: 4, excludeSlug: article.slug });
    const more = related.length < 4 ? await listArticles({ limit: 6, excludeSlug: article.slug }) : [];
    const seen = new Set(related.map((r) => r.slug));
    return { article, related: [...related, ...more.filter((m) => !seen.has(m.slug))].slice(0, 4) };
  });

export const subscribe = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().trim().toLowerCase().email().max(200) }))
  .handler(async ({ data }) => {
    const d = db();
    if (!d) return { ok: false as const, message: "Die Anmeldung ist gerade nicht möglich. Bitte später erneut versuchen." };
    await d.prepare("INSERT INTO subscribers (email) VALUES (?) ON CONFLICT DO NOTHING").bind(data.email).run();
    return { ok: true as const, message: "Danke! Der Presseinfo-Brief kommt ab jetzt in Ihr Postfach." };
  });

const opt = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : null));

export const submitPressRelease = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      company: z.string().trim().min(2).max(160),
      contact: z.string().trim().min(2).max(120),
      email: z.string().trim().toLowerCase().email().max(200),
      phone: opt(60),
      website: opt(300),
      title: z.string().trim().min(8).max(200),
      body: z.string().trim().min(80).max(20000),
      category: z.enum(CATEGORIES.map((c) => c.slug) as [string, ...string[]]).optional(),
      region: z.enum(REGIONS.map((r) => r.slug) as [string, ...string[]]).optional(),
      timing: z.enum(TIMING_OPTIONS as [string, ...string[]]),
      package: z.enum(PACKAGE_OPTIONS as [string, ...string[]]),
      consent: z.literal(true),
      hp: z.string().max(0).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const d = db();
    if (!d) return { ok: false as const, message: "Die Einreichung ist gerade nicht möglich. Bitte schreiben Sie an redaktion@presseinfo.at." };
    await d
      .prepare("INSERT INTO submissions (company, contact, email, phone, website, title, body, category, region, timing, package) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
      .bind(data.company, data.contact, data.email, data.phone, data.website, data.title, data.body, data.category ?? null, data.region ?? null, data.timing, data.package)
      .run();
    return { ok: true as const, message: "Danke! Ihre Presseaussendung ist bei uns eingelangt. Die Redaktion prüft sie und meldet sich per E-Mail." };
  });

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      partner: z.string().trim().min(2).max(80),
      articleSlug: z.string().trim().max(160),
      name: z.string().trim().min(2).max(120),
      phone: z.string().trim().min(5).max(60),
      email: z.string().trim().max(200).optional().transform((v) => (v ? v : null)),
      location: z.string().trim().max(120).optional().transform((v) => (v ? v : null)),
      message: z.string().trim().max(3000).optional().transform((v) => (v ? v : null)),
      timing: z.enum(TIMING_OPTIONS as [string, ...string[]]),
      hp: z.string().max(0).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const d = db();
    if (!d) return { ok: false as const, message: "Die Anfrage ist gerade nicht möglich. Bitte später erneut versuchen." };
    await d
      .prepare("INSERT INTO leads (partner, article_slug, name, phone, email, location, message, timing) VALUES (?,?,?,?,?,?,?,?)")
      .bind(data.partner, data.articleSlug, data.name, data.phone, data.email, data.location, data.message, data.timing)
      .run();
    return { ok: true as const, message: `${data.partner} meldet sich in Kürze telefonisch oder per E-Mail bei Ihnen.` };
  });
