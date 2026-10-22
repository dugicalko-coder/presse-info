import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
import appMetaJson from "../app-meta.json";
import { getTicker } from "../lib/api/content.functions";
import { SiteFooter, SiteHeader } from "../components/site/site";
import { OG_IMAGE, SITE, SITE_URL, abs } from "../lib/site";

declare const __HF_DESIGN_INSPECTOR__: boolean;

type AppMeta = { og_description?: string | null };
const appMeta = appMetaJson as AppMeta;

function buildHead() {
  const title = `${SITE.name}: ${SITE.claim}`;
  const description = appMeta.og_description || SITE.description;
  const ogImage = abs(OG_IMAGE);
  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "theme-color", content: SITE.themeColor },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "de_AT" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: ogImage },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "alternate", type: "application/rss+xml", title: "Presseinfo", href: "/rss.xml" },
    ],
  };
}

function NotFoundComponent() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 md:px-6">
      <p className="font-pi-mono text-sm text-pi-red">404</p>
      <h1 className="mt-3 font-pi-serif text-4xl font-semibold tracking-tight md:text-6xl">Diese Seite gibt es nicht.</h1>
      <p className="mt-4 max-w-[55ch] text-pi-muted">Vielleicht wurde der Beitrag verschoben. Auf der Startseite finden Sie die aktuellen Nachrichten und Presseaussendungen.</p>
      <Link to="/" className="pi-btn mt-8">Zur Startseite</Link>
    </section>
  );
}

function ErrorComponent({ error: rawError, reset }: { error: unknown; reset: () => void }) {
  const error = rawError instanceof Error ? rawError : new Error(String(rawError));
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 md:px-6">
      <h1 className="font-pi-serif text-4xl font-semibold tracking-tight">Diese Seite konnte nicht geladen werden.</h1>
      <p className="mt-4 text-pi-muted">Bitte versuchen Sie es in einem Moment noch einmal.</p>
      <button className="pi-btn mt-8" onClick={() => { router.invalidate(); reset(); }}>Neu laden</button>
    </section>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(),
  loader: () => getTicker(),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="de-AT" style={{ colorScheme: "light" }}>
      <head>
        <HeadContent />
      </head>
      <body className="pi-body">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const ticker = Route.useLoaderData();
  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) return;
    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => installHiggsfieldDesignInspector())
      .catch((error) => {
        reportHiggsfieldError(error instanceof Error ? error : new Error("Failed to load design inspector"), { boundary: "higgsfield_design_inspector_import" });
      });
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <a href="#inhalt" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-pi-red focus:px-3 focus:py-2 focus:text-white">Zum Inhalt</a>
      <SiteHeader ticker={ticker ?? []} />
      <main id="inhalt">
        <Outlet />
      </main>
      <SiteFooter />
    </QueryClientProvider>
  );
}
