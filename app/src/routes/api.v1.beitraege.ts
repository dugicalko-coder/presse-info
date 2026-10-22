import { createFileRoute } from "@tanstack/react-router";

import { ArticleInput } from "@/lib/article-input";
import { saveForReview } from "@/lib/articles.server";
import { userFromToken } from "@/lib/auth.server";
import { db } from "@/lib/db.server";
import { CATEGORIES, REGIONS } from "@/lib/site";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

/**
 * API fuer Bots (z. B. Grok) und Redaktions-Tools.
 * POST  /api/v1/beitraege  (Authorization: Bearer <Schluessel>)  -> Beitrag zur Freigabe einreichen
 * GET   /api/v1/beitraege  (Authorization: Bearer <Schluessel>)  -> eigene Einreichungen + Status
 * Nichts wird ohne Freigabe durch den Admin veroeffentlicht.
 */
export const Route = createFileRoute("/api/v1/beitraege")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = await userFromToken(request.headers.get("authorization"));
        if (!u) return json({ error: "Kein gültiger API-Schlüssel." }, 401);
        const res = await db()!
          .prepare("SELECT id, slug, title, category, status, review_note, updated_at FROM articles WHERE submitted_by = ? ORDER BY updated_at DESC LIMIT 100")
          .bind(u.id)
          .all();
        return json({
          bot: u.name,
          rubriken: CATEGORIES.map((c) => ({ slug: c.slug, themen: c.topics })),
          bundeslaender: REGIONS.map((r) => r.slug),
          einreichungen: res.results ?? [],
        });
      },
      POST: async ({ request }) => {
        const u = await userFromToken(request.headers.get("authorization"));
        if (!u) return json({ error: "Kein gültiger API-Schlüssel." }, 401);
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Ungültiges JSON." }, 400);
        }
        const parsed = ArticleInput.safeParse(body);
        if (!parsed.success) return json({ error: "Validierung fehlgeschlagen", details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, 422);
        const recent = await db()!.prepare("SELECT COUNT(*) AS n FROM articles WHERE submitted_by = ? AND updated_at > ?").bind(u.id, new Date(Date.now() - 24 * 3600 * 1000).toISOString()).first<{ n: number }>();
        if ((recent?.n ?? 0) >= 20) return json({ error: "Tageslimit von 20 Einreichungen erreicht." }, 429);
        const r = await saveForReview(u.id, u.name, parsed.data);
        return json({ ok: true, id: r.id, slug: r.slug, status: "review", hinweis: "Wartet auf Freigabe durch den Admin." }, 201);
      },
    },
  },
});
