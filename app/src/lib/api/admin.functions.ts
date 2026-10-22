import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { currentUser, requireUser } from "../auth.server";
import { db } from "../db.server";
import type { Article, Lead, Submission } from "../types";

async function requireAdmin() {
  await requireUser(["admin"]);
}

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const u = await currentUser();
  return { loggedIn: !!u, isAdmin: u?.role === "admin", name: u?.name ?? null };
});

export const adminOverview = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const d = db();
  if (!d) return { articles: [] as Article[], submissions: [] as Submission[], leads: [] as Lead[], subscribers: 0 };
  const [articles, submissions, subs, leads] = await Promise.all([
    d.prepare("SELECT * FROM articles ORDER BY published_at DESC LIMIT 500").all<Article>(),
    d.prepare("SELECT * FROM submissions ORDER BY created_at DESC LIMIT 300").all<Submission>(),
    d.prepare("SELECT COUNT(*) AS n FROM subscribers").first<{ n: number }>(),
    d.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 500").all<Lead>(),
  ]);
  return { articles: articles.results ?? [], submissions: submissions.results ?? [], leads: leads.results ?? [], subscribers: subs?.n ?? 0 };
});

const nul = z.string().trim().nullable().optional().transform((v) => (v ? v : null));

export const adminSave = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number().int().optional(),
      slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/),
      title: z.string().trim().min(5).max(220),
      teaser: z.string().trim().min(10).max(600),
      body: z.string().trim().min(20).max(60000),
      category: z.string().min(2).max(40),
      topic: nul,
      region: nul,
      kind: z.enum(["news", "ratgeber", "presse"]),
      sender: nul,
      sender_url: nul,
      author: z.string().trim().min(2).max(120),
      image: nul,
      source_name: nul,
      source_url: nul,
      status: z.enum(["published", "draft", "review", "rejected"]),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const d = db();
    if (!d) return { ok: false, message: "Keine Datenbank" };
    const now = new Date().toISOString();
    const v = [data.slug, data.title, data.teaser, data.body, data.category, data.topic, data.region, data.kind, data.sender, data.sender_url, data.author, data.image, data.source_name, data.source_url, data.status];
    if (data.id) {
      await d.prepare("UPDATE articles SET slug=?, title=?, teaser=?, body=?, category=?, topic=?, region=?, kind=?, sender=?, sender_url=?, author=?, image=?, source_name=?, source_url=?, status=?, updated_at=? WHERE id=?").bind(...v, now, data.id).run();
      return { ok: true, message: "Artikel aktualisiert." };
    }
    await d.prepare("INSERT INTO articles (slug, title, teaser, body, category, topic, region, kind, sender, sender_url, author, image, source_name, source_url, status, published_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(...v, now, now).run();
    return { ok: true, message: "Artikel angelegt." };
  });

export const adminDelete = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await db()?.prepare("DELETE FROM articles WHERE id = ?").bind(data.id).run();
    return { ok: true };
  });

export const adminSubmissionStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number().int(), status: z.enum(["neu", "in Arbeit", "veröffentlicht", "abgelehnt"]) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await db()?.prepare("UPDATE submissions SET status = ? WHERE id = ?").bind(data.status, data.id).run();
    return { ok: true };
  });

export const adminLeadStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number().int(), status: z.enum(["neu", "weitergeleitet", "erledigt", "Spam"]) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await db()?.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(data.status, data.id).run();
    return { ok: true };
  });
