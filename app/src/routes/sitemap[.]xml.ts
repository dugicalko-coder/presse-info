import { createFileRoute } from "@tanstack/react-router";

import { listArticles } from "@/lib/db.server";
import { CATEGORIES, REGIONS, SITE_URL, topicSlug } from "@/lib/site";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const articles = await listArticles({ limit: 5000 });
        const esc = (s: string) => s.replace(/&/g, "&amp;");
        const u = (path: string, lastmod?: string) => `<url><loc>${esc(SITE_URL + path)}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}</url>`;
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          u("/"), u("/nachrichten"), u("/presseaussendungen"), u("/einreichen"), u("/redaktion"), u("/kennzeichnung"), u("/impressum"),
          ...CATEGORIES.flatMap((c) => [u(`/rubrik/${c.slug}`), ...c.topics.map((t) => u(`/rubrik/${c.slug}?thema=${topicSlug(t)}`))]),
          ...REGIONS.map((r) => u(`/bundesland/${r.slug}`)),
          ...articles.map((a) => u(`/artikel/${a.slug}`, a.updated_at)),
          "</urlset>",
        ].join("\n");
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
