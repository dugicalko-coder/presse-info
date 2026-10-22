import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { ArticleRow } from "@/components/site/site";
import { searchArticles } from "@/lib/api/content.functions";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/suche")({
  validateSearch: z.object({ q: z.string().max(80).optional().catch("") }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "" }),
  loader: ({ deps }) => searchArticles({ data: { q: deps.q } }),
  head: () => pageHead({ title: "Suche", description: "Nachrichten und Presseaussendungen auf Presseinfo durchsuchen.", path: "/suche", noindex: true }),
  component: SearchPage,
});

function SearchPage() {
  const { q, articles } = Route.useLoaderData();
  const navigate = useNavigate();
  const [value, setValue] = useState(q);
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <h1 className="font-pi-serif text-4xl font-semibold tracking-tight md:text-5xl">Suche</h1>
      <form className="mt-6 flex gap-2" onSubmit={(e) => { e.preventDefault(); void navigate({ to: "/suche", search: { q: value } }); }}>
        <label htmlFor="q" className="sr-only">Suchbegriff</label>
        <input id="q" value={value} onChange={(e) => setValue(e.target.value)} placeholder="z. B. Photovoltaik, Nationalrat, Wien" className="pi-field !mt-0 flex-1 text-lg" autoFocus />
        <button type="submit" className="pi-btn">Suchen</button>
      </form>
      {q.length >= 2 ? <p className="mt-6 text-sm text-pi-muted">{articles.length} Treffer für „{q}“</p> : null}
      <div className="mt-4 divide-y divide-pi-line border-t border-pi-line">{articles.map((a) => <ArticleRow key={a.slug} a={a} />)}</div>
    </section>
  );
}
