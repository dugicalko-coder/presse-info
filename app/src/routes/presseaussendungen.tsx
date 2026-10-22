import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState, Meta, PageIntro } from "@/components/site/site";
import { getPress } from "@/lib/api/content.functions";
import { categoryBySlug, fmtShort, pageHead } from "@/lib/site";

export const Route = createFileRoute("/presseaussendungen")({
  loader: () => getPress(),
  head: () => pageHead({ title: "Presseaussendungen aus Österreich", description: "Aktuelle Presseaussendungen und Pressemitteilungen von Unternehmen, Vereinen und Gemeinden aus Österreich. Jetzt lesen oder eigene Aussendung veröffentlichen.", path: "/presseaussendungen", image: "/assets/img/presse.webp" }),
  component: PressPage,
});

function PressPage() {
  const { articles: all } = Route.useLoaderData();
  const [featured, ...articles] = all;
  const senders = new Set(all.map((a) => a.sender)).size;
  return (
    <>
      <PageIntro
        kicker="Originaltext der Aussender"
        title="Presseaussendungen"
        intro="Meldungen von Unternehmen, Vereinen, Gemeinden und Institutionen aus ganz Österreich. Für den Inhalt ist der jeweilige Aussender verantwortlich."
        featured={featured ?? null}
        facts={[
          { label: "Aussendungen", value: String(all.length) },
          { label: "Aussender", value: String(senders) },
          { label: "Aktualisiert", value: featured ? fmtShort(featured.published_at) : "–" },
        ]}
      >
        <Link to="/einreichen" className="pi-btn">Eigene Aussendung einreichen</Link>
      </PageIntro>
      <div className="mx-auto mt-8 grid max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-pi-line border-t border-pi-line">
          {articles.length || featured ? articles.map((a) => (
            <Link key={a.slug} to="/artikel/$slug" params={{ slug: a.slug }} className="group block py-6">
              <span className="font-pi-mono text-[11px] uppercase tracking-wider text-pi-navy">{a.sender} · {categoryBySlug(a.category)?.label}</span>
              <h2 className="mt-1.5 font-pi-serif text-2xl font-semibold leading-snug group-hover:text-pi-red">{a.title}</h2>
              <p className="mt-2 max-w-[70ch] leading-relaxed text-pi-muted">{a.teaser}</p>
              <p className="mt-2"><Meta a={{ ...a, sender: null }} /></p>
            </Link>
          )) : <div className="py-8"><EmptyState text="Noch keine Presseaussendungen." /></div>}
        </div>
        <aside className="h-fit bg-pi-navy p-7 text-white lg:sticky lg:top-20">
          <h2 className="font-pi-serif text-2xl font-semibold">Eigene Aussendung veröffentlichen</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75">Reichen Sie Ihre Presseaussendung online ein. Die Redaktion prüft jede Meldung und veröffentlicht sie in der passenden Rubrik und Ihrem Bundesland.</p>
          <Link to="/einreichen" className="pi-btn mt-6">Jetzt einreichen</Link>
        </aside>
      </div>
    </>
  );
}
