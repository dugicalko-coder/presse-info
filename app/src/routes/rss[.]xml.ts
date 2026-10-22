import { createFileRoute } from "@tanstack/react-router";

import { listArticles } from "@/lib/db.server";
import { SITE, SITE_URL, categoryBySlug } from "@/lib/site";

const x = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const items = await listArticles({ limit: 50 });
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
          `<title>${SITE.name}</title><link>${SITE_URL}</link><description>${x(SITE.description)}</description><language>de-AT</language>`,
          `<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
          ...items.map((a) => `<item><title>${x(a.title)}</title><link>${SITE_URL}/artikel/${a.slug}</link><guid>${SITE_URL}/artikel/${a.slug}</guid><pubDate>${new Date(a.published_at).toUTCString()}</pubDate><category>${x(a.kind === "presse" ? "Presseaussendung" : categoryBySlug(a.category)?.label ?? "")}</category><description>${x(a.teaser)}</description></item>`),
          "</channel></rss>",
        ].join("\n");
        return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
      },
    },
  },
});
