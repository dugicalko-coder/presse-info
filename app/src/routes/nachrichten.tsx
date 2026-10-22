import { Link, createFileRoute } from "@tanstack/react-router";

import { ArticleRow, ChipRow, PageIntro, chipClass } from "@/components/site/site";
import { getNews } from "@/lib/api/content.functions";
import { CATEGORIES, fmtShort, pageHead } from "@/lib/site";

export const Route = createFileRoute("/nachrichten")({
  loader: () => getNews(),
  head: () => pageHead({ title: "Nachrichten aus Österreich", description: "Alle Nachrichten und Ratgeber von Presseinfo: Politik, Wirtschaft, Chronik, Bauen & Wohnen, Energie, Gesundheit und Kultur aus ganz Österreich.", path: "/nachrichten", image: "/assets/img/politik.webp" }),
  component: () => {
    const { articles } = Route.useLoaderData();
    const [featured, ...rest] = articles;
    return (
      <>
        <PageIntro
          kicker="Laufend aktualisiert"
          title="Nachrichten"
          intro="Alle Meldungen und Ratgeber der Presseinfo-Redaktion aus ganz Österreich, neueste zuerst."
          featured={featured ?? null}
          facts={[
            { label: "Beiträge", value: String(articles.length) },
            { label: "Rubriken", value: String(CATEGORIES.length) },
            { label: "Aktualisiert", value: featured ? fmtShort(featured.published_at) : "–" },
          ]}
        >
          <ChipRow>
            {CATEGORIES.map((c) => <Link key={c.slug} to="/rubrik/$slug" params={{ slug: c.slug }} search={{}} className={chipClass(false)}>{c.label}</Link>)}
          </ChipRow>
        </PageIntro>
        <div className="mx-auto mt-8 max-w-4xl divide-y divide-pi-line border-t border-pi-line px-4 md:px-6">
          {rest.map((a) => <ArticleRow key={a.slug} a={a} />)}
        </div>
      </>
    );
  },
});
