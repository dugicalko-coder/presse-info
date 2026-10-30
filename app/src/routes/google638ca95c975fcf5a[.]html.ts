import { createFileRoute } from "@tanstack/react-router";

// Google Search Console: Bestaetigungsdatei (direkt mit 200, ohne Umleitung)
export const Route = createFileRoute("/google638ca95c975fcf5a.html")({
  server: {
    handlers: {
      GET: async () =>
        new Response("google-site-verification: google638ca95c975fcf5a.html", {
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        }),
    },
  },
});
