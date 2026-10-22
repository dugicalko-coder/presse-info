import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { ArticleRow, ChipRow, EmptyState, PageIntro, chipClass } from "@/components/site/site";
import { getRegion } from "@/lib/api/content.functions";
import { REGIONS, fmtShort, pageHead, regionBySlug } from "@/lib/site";

export const Route = createFileRoute("/bundesland/$slug")({
  loader: async ({ params }) => {
    const data = await getRegion({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ params }) => {
    const r = regionBySlug(params.slug);
    if (!r) return {};
    return pageHead({ title: `${r.label}: Nachrichten und Presseaussendungen`, description: `Aktuelle Nachrichten, Ratgeber und Presseaussendungen aus ${r.label}. Meldungen von Unternehmen, Vereinen und Gemeinden aus der Region.`, path: `/bundesland/${r.slug}`, image: "/assets/img/regional.webp" });
  },
  component: RegionPage,
});

function RegionPage() {
  const { slug, articles } = Route.useLoaderData();
  const r = regionBySlug(slug)!;
  const [featured, ...rest] = articles;
  return (
    <>
      <PageIntro
        kicker="Bundesland"
        title={r.label}
        intro={`Nachrichten, Ratgeber und Presseaussendungen aus ${r.label}, von der Landeshauptstadt ${r.capital} bis in die Gemeinden.`}
        featured={featured ?? null}
        image="/assets/img/regional.webp"
        facts={[
          { label: "Beiträge", value: String(articles.length) },
          { label: "Hauptstadt", value: r.capital },
          { label: "Aktualisiert", value: featured ? fmtShort(featured.published_at) : "–" },
        ]}
      >
        <ChipRow>
          {REGIONS.map((x) => (
            <Link key={x.slug} to="/bundesland/$slug" params={{ slug: x.slug }} className={chipClass(x.slug === slug)}>{x.label}</Link>
          ))}
        </ChipRow>
      </PageIntro>
      <div className="mx-auto mt-8 max-w-7xl px-4 md:px-6">
        <div className="divide-y divide-pi-line border-t border-pi-line">
          {rest.length ? rest.map((a) => <ArticleRow key={a.slug} a={a} />) : featured ? null : <div className="py-8"><EmptyState text={`Aus ${r.label} gibt es gerade noch keine Beiträge. Haben Sie eine Meldung aus der Region? Reichen Sie sie ein.`} /></div>}
        </div>
      </div>
    </>
  );
}
