import { createFileRoute } from "@tanstack/react-router";

import { listArticles } from "@/lib/db.server";
import { SITE_URL } from "@/lib/site";

const x = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const Route = createFileRoute("/news-sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const cutoff = Date.now() - 2 * 24 * 3600 * 1000;
        const items = (await listArticles({ limit: 200 })).filter((a) => new Date(a.published_at).getTime() >= cutoff);
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
          ...items.map((a) => `<url><loc>${SITE_URL}/artikel/${a.slug}</loc><news:news><news:publication><news:name>Presseinfo</news:name><news:language>de</news:language></news:publication><news:publication_date>${a.published_at}</news:publication_date><news:title>${x(a.title)}</news:title></news:news></url>`),
          "</urlset>",
        ].join("\n");
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
      },
    },
  },
});
