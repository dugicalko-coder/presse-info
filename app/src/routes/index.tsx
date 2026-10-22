import { Link, createFileRoute } from "@tanstack/react-router";

import { ArticleCardBig, ArticleCardSmall, JsonLd, MarketsWidget, Meta, NewsletterForm, SectionHead, TimeList } from "@/components/site/site";
import { getHome } from "@/lib/api/content.functions";
import { CATEGORIES, REGIONS, SITE, SITE_URL, categoryBySlug, pageHead } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: () => getHome(),
  head: () => pageHead({ title: SITE.name, description: SITE.description, path: "/" }),
  component: Home,
});

function Home() {
  const { latest, ratgeber, presse, regionCounts } = Route.useLoaderData();
  const news = latest.filter((a) => a.kind === "news");
  const lead = news[0] ?? latest[0];
  const second = latest.filter((a) => a.slug !== lead?.slug).slice(0, 3);
  const timeline = latest.filter((a) => a.slug !== lead?.slug).slice(0, 7);
  const byCat = CATEGORIES.map((c) => ({ c, items: latest.filter((a) => a.category === c.slug).slice(0, 3) })).filter((x) => x.items.length);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE_URL, inLanguage: "de-AT", potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/suche?q={q}`, "query-input": "required name=q" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: SITE.name, url: SITE_URL, logo: `${SITE_URL}/icon-512.png`, email: SITE.email, address: { "@type": "PostalAddress", streetAddress: "Wattgasse 33", postalCode: "1160", addressLocality: "Wien", addressCountry: "AT" } }} />
      <h1 className="sr-only">Presseinfo: Nachrichten und Presseaussendungen aus Österreich</h1>

      {lead ? (
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-10 md:px-6 lg:grid-cols-[1.7fr_1fr] lg:gap-12">
          <ArticleCardBig a={lead} />
          <aside>
            <div className="flex items-center justify-between border-t-2 border-pi-ink pt-3">
              <h2 className="font-pi-serif text-2xl font-semibold">Neueste Meldungen</h2>
              <Link to="/nachrichten" className="pi-link text-sm">Alle</Link>
            </div>
            <TimeList items={timeline} />
          </aside>
        </section>
      ) : null}

      {second.length ? (
        <section className="mx-auto mt-14 grid max-w-7xl gap-8 px-4 md:grid-cols-3 md:px-6">
          {second.map((a) => <ArticleCardSmall key={a.slug} a={a} />)}
        </section>
      ) : null}

      <section className="mx-auto mt-20 grid max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <SectionHead kicker="Wissen kompakt" title="Ratgeber" />
          <ol className="mt-2 divide-y divide-pi-line">
            {ratgeber.map((a, i) => (
              <li key={a.slug}>
                <Link to="/artikel/$slug" params={{ slug: a.slug }} className="group grid grid-cols-[56px_1fr] items-baseline gap-3 py-4">
                  <span className="font-pi-serif text-3xl font-bold text-pi-red/80">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block font-pi-serif text-xl font-semibold leading-snug group-hover:text-pi-red">{a.title}</span>
                    <span className="mt-1 block font-pi-mono text-[11px] uppercase tracking-wider text-pi-faint">{categoryBySlug(a.category)?.label}{a.topic ? ` · ${a.topic}` : ""}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <aside className="flex flex-col gap-6">
          <div className="bg-pi-navy p-7 text-white md:p-9">
            <p className="font-pi-mono text-[11px] uppercase tracking-widest text-pi-red-soft">Für Unternehmen, Vereine und Gemeinden</p>
            <h2 className="mt-3 font-pi-serif text-3xl font-semibold leading-tight">Ihre Presseaussendung auf Presseinfo</h2>
            <p className="mt-4 leading-relaxed text-white/75">Neuigkeiten, Eröffnungen, Projekte oder Personalien: Wir veröffentlichen Ihre Meldung gekennzeichnet als Presseaussendung, mit Link zu Ihrer Website, auffindbar in Google, Google News und ChatGPT.</p>
            <ul className="mt-5 space-y-2 text-sm text-white/85">
              <li>✓ Veröffentlichung in passender Rubrik und Ihrem Bundesland</li>
              <li>✓ Verlinkung zu Ihrer Website</li>
              <li>✓ Auf Wunsch Startseite und Presseinfo-Brief</li>
            </ul>
            <Link to="/einreichen" className="pi-btn mt-7">Jetzt einreichen</Link>
          </div>
          <MarketsWidget />
          <div className="border border-pi-line bg-pi-card p-6">
            <h2 className="font-pi-serif text-xl font-semibold">Service</h2>
            <ul className="mt-3 divide-y divide-pi-line text-[15px]">
              <li><Link to="/rubrik/$slug" params={{ slug: "wirtschaft" }} search={{ thema: "medien-und-pr" }} className="flex justify-between py-2.5 hover:text-pi-red">Wissen für Pressearbeit <span aria-hidden>→</span></Link></li>
              <li><Link to="/rubrik/$slug" params={{ slug: "energie" }} search={{ thema: "foerderungen" }} className="flex justify-between py-2.5 hover:text-pi-red">Förderungen im Überblick <span aria-hidden>→</span></Link></li>
              <li><Link to="/presseaussendungen" className="flex justify-between py-2.5 hover:text-pi-red">Alle Presseaussendungen <span aria-hidden>→</span></Link></li>
              <li><a href="/rss.xml" className="flex justify-between py-2.5 hover:text-pi-red">RSS-Feed abonnieren <span aria-hidden>→</span></a></li>
            </ul>
          </div>
        </aside>
      </section>

      {presse.length ? (
        <section className="mt-20 bg-pi-card py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHead kicker="Originaltext der Aussender" title="Presseaussendungen">
              <Link to="/presseaussendungen" className="pi-btn-ghost">Alle Aussendungen</Link>
            </SectionHead>
            <div className="mt-8 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {presse.map((a) => (
                <Link key={a.slug} to="/artikel/$slug" params={{ slug: a.slug }} className="group flex flex-col border-l-2 border-pi-navy pl-5">
                  <span className="font-pi-mono text-[11px] uppercase tracking-wider text-pi-navy">{a.sender}</span>
                  <h3 className="mt-2 font-pi-serif text-xl font-semibold leading-snug group-hover:text-pi-red">{a.title}</h3>
                  <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-pi-muted">{a.teaser}</p>
                  <p className="mt-3"><Meta a={a} time={false} /></p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-6">
        <SectionHead kicker="Direkt aus der Region" title="Aus den Bundesländern" />
        <div className="mt-8 grid grid-cols-2 gap-px border border-pi-line bg-pi-line sm:grid-cols-3 lg:grid-cols-9">
          {REGIONS.map((r) => (
            <Link key={r.slug} to="/bundesland/$slug" params={{ slug: r.slug }} className="group flex min-h-28 flex-col justify-between bg-pi-paper p-4 transition hover:bg-pi-ink hover:text-white">
              <span className="font-pi-mono text-[10px] uppercase tracking-wider text-pi-faint group-hover:text-white/60">{regionCounts[r.slug] ? `${regionCounts[r.slug]} Beiträge` : r.capital}</span>
              <span className="font-pi-serif text-lg font-semibold leading-tight">{r.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {byCat.length ? (
        <section className="mx-auto mt-20 grid max-w-7xl gap-x-12 gap-y-16 px-4 md:px-6 lg:grid-cols-2">
          {byCat.map(({ c, items }) => (
            <div key={c.slug}>
              <SectionHead title={c.label}>
                <Link to="/rubrik/$slug" params={{ slug: c.slug }} search={{}} className="pi-link text-sm">Mehr {c.label}</Link>
              </SectionHead>
              <div className="mt-6 grid gap-6 sm:grid-cols-[1.2fr_1fr]">
                <ArticleCardSmall a={items[0]} />
                <div className="divide-y divide-pi-line">
                  {items.slice(1).map((a) => (
                    <Link key={a.slug} to="/artikel/$slug" params={{ slug: a.slug }} className="group block py-3 first:pt-0">
                      <span className="font-pi-serif text-lg font-semibold leading-snug group-hover:text-pi-red">{a.title}</span>
                      <span className="mt-1 block"><Meta a={a} time={false} /></span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-6">
        <div className="grid gap-8 bg-pi-ink p-8 text-white md:p-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="font-pi-mono text-[11px] uppercase tracking-widest text-pi-red-soft">Gut informiert durch den Tag</p>
            <h2 className="mt-3 font-pi-serif text-4xl font-semibold leading-tight">Der Presseinfo-Brief</h2>
            <p className="mt-3 text-white/70">Die wichtigsten Nachrichten und Presseaussendungen aus Österreich, jeden Morgen kompakt im Postfach. Kostenlos und jederzeit abbestellbar.</p>
          </div>
          <NewsletterForm dark />
        </div>
      </section>
    </>
  );
}
