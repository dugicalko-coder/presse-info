import { createFileRoute } from "@tanstack/react-router";

import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = [
          "User-agent: *", "Allow: /", "Disallow: /admin", "Disallow: /suche", "",
          "User-agent: Googlebot-News", "Allow: /", "",
          "User-agent: OAI-SearchBot", "Allow: /", "",
          "User-agent: ChatGPT-User", "Allow: /", "",
          "User-agent: GPTBot", "Allow: /", "",
          "User-agent: PerplexityBot", "Allow: /", "",
          `Sitemap: ${SITE_URL}/sitemap.xml`,
          `Sitemap: ${SITE_URL}/news-sitemap.xml`,
        ].join("\n");
        return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
      },
    },
  },
});
