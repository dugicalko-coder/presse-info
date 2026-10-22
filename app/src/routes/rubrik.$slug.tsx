import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { ArticleRow, ChipRow, EmptyState, MarketsWidget, PageIntro, chipClass } from "@/components/site/site";
import { getCategory } from "@/lib/api/content.functions";
import { TOPIC_INTRO, categoryBySlug, fmtShort, pageHead, topicSlug } from "@/lib/site";

export const Route = createFileRoute("/rubrik/$slug")({
  validateSearch: z.object({ thema: z.string().optional() }),
  loaderDeps: ({ search }) => ({ thema: search.thema }),
  loader: async ({ params, deps }) => {
    const data = await getCategory({ data: { slug: params.slug, thema: deps.thema } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    const c = categoryBySlug(params.slug);
    if (!c) return {};
    const t = loaderData?.topic;
    return pageHead({
      title: t ? `${t}: ${c.label}` : `${c.label}: Nachrichten aus Österreich`,
      description: t ? `${t} in der Rubrik ${c.label}: aktuelle Nachrichten, Ratgeber und Presseaussendungen aus Österreich.` : c.intro,
      path: t ? `/rubrik/${c.slug}?thema=${topicSlug(t)}` : `/rubrik/${c.slug}`,
      image: c.image,
    });
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug, topic, articles } = Route.useLoaderData();
  const c = categoryBySlug(slug)!;
  const [featured, ...rest] = articles;
  const news = articles.filter((a) => a.kind === "news").length;
  return (
    <>
      <PageIntro
        kicker={topic ? c.label : "Rubrik"}
        title={topic ?? c.label}
        intro={(topic && TOPIC_INTRO[topic]) || c.intro}
        featured={featured ?? null}
        image={c.image}
        facts={[
          { label: "Beiträge", value: String(articles.length) },
          { label: "Nachrichten", value: String(news) },
          { label: "Aktualisiert", value: featured ? fmtShort(featured.published_at) : "–" },
        ]}
      >
        <ChipRow>
          <Link to="/rubrik/$slug" params={{ slug }} search={{}} className={chipClass(!topic)}>Alle</Link>
          {c.topics.map((t) => (
            <Link key={t} to="/rubrik/$slug" params={{ slug }} search={{ thema: topicSlug(t) }} className={chipClass(topic === t)}>{t}</Link>
          ))}
        </ChipRow>
      </PageIntro>
      <div className="mx-auto mt-8 max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <div className="divide-y divide-pi-line border-t border-pi-line">
            {rest.length ? rest.map((a) => <ArticleRow key={a.slug} a={a} />) : featured ? null : <div className="py-8"><EmptyState text={`In ${topic ?? c.label} gibt es gerade noch keine Beiträge. Die Redaktion ergänzt laufend.`} /></div>}
          </div>
          <aside className="flex h-fit flex-col gap-6 lg:sticky lg:top-20">
            {slug === "wirtschaft" ? <MarketsWidget /> : null}
            <div className="border border-pi-line bg-pi-card p-6">
            <h2 className="font-pi-serif text-xl font-semibold">Meldung zu {c.label}?</h2>
            <p className="mt-2 text-sm leading-relaxed text-pi-muted">Unternehmen, Vereine und Gemeinden veröffentlichen ihre Presseaussendung direkt in dieser Rubrik.</p>
            <Link to="/einreichen" className="pi-btn mt-5">Presseaussendung einreichen</Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
