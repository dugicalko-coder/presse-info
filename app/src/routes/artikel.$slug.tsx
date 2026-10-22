import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { ArticleBodyWithBox, ArticleCardSmall, JsonLd, KindMark, Meta, NewsletterForm, PartnerLeadBox, Visual } from "@/components/site/site";
import { getArticle } from "@/lib/api/content.functions";
import { SITE, SITE_URL, abs, categoryBySlug, fmtDate, imageFor, pageHead, partnerFor, regionBySlug, shareImageFor, topicSlug } from "@/lib/site";

type Faq = { q: string; a: string };
const parseFaq = (s: string | null): Faq[] => {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => x && typeof x.q === "string" && typeof x.a === "string") : [];
  } catch {
    return [];
  }
};

export const Route = createFileRoute("/artikel/$slug")({
  loader: async ({ params }) => {
    const data = await getArticle({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const a = loaderData.article;
    const description = a.meta_description || a.teaser;
    const base = pageHead({ title: a.meta_title || a.title, description, path: `/artikel/${params.slug}`, image: shareImageFor(a), type: "article" });
    const kw = (() => { try { return a.keywords ? (JSON.parse(a.keywords) as string[]).join(", ") : ""; } catch { return a.keywords ?? ""; } })();
    return {
      ...base,
      meta: [
        ...base.meta,
        ...(kw ? [{ name: "keywords", content: kw }] : []),
        { property: "article:published_time", content: a.published_at },
        { property: "article:modified_time", content: a.updated_at },
        { property: "article:section", content: categoryBySlug(a.category)?.label ?? "" },
        ...(a.image_alt ? [{ property: "og:image:alt", content: a.image_alt }] : []),
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article: a, related } = Route.useLoaderData();
  const cat = categoryBySlug(a.category);
  const region = regionBySlug(a.region);
  const isPress = a.kind === "presse";
  const faq = parseFaq(a.faq);
  const partner = isPress ? null : partnerFor(a);
  const img = imageFor(a);
  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": isPress ? "Article" : "NewsArticle",
          headline: a.title,
          description: a.meta_description || a.teaser,
          image: [abs(shareImageFor(a))],
          datePublished: a.published_at,
          dateModified: a.updated_at,
          keywords: a.focus_keyword ?? undefined,
          author: isPress && a.sender ? { "@type": "Organization", name: a.sender, url: a.sender_url ?? undefined } : { "@type": "Organization", name: a.author, url: `${SITE_URL}/redaktion` },
          publisher: { "@type": "NewsMediaOrganization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` } },
          mainEntityOfPage: abs(`/artikel/${a.slug}`),
          articleSection: cat?.label,
          inLanguage: "de-AT",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE.name, item: SITE_URL },
            { "@type": "ListItem", position: 2, name: cat?.label ?? "Nachrichten", item: abs(`/rubrik/${a.category}`) },
            { "@type": "ListItem", position: 3, name: a.title, item: abs(`/artikel/${a.slug}`) },
          ],
        }}
      />
      {faq.length ? <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} /> : null}

      <header className="mx-auto max-w-3xl px-4 pt-12 md:px-6">
        <nav className="font-pi-mono text-[11px] uppercase tracking-wider text-pi-faint" aria-label="Brotkrumen">
          <Link to="/" className="hover:text-pi-red">Presseinfo</Link> / <Link to="/rubrik/$slug" params={{ slug: a.category }} search={{}} className="hover:text-pi-red">{cat?.label}</Link>
          {a.topic && cat ? <> / <Link to="/rubrik/$slug" params={{ slug: a.category }} search={{ thema: topicSlug(a.topic) }} className="hover:text-pi-red">{a.topic}</Link></> : null}
        </nav>
        <div className="mt-6"><KindMark a={a} /></div>
        <h1 className="mt-3 font-pi-serif text-4xl font-semibold leading-[1.08] tracking-tight md:text-[3.3rem]">{a.title}</h1>
        <p className="mt-5 font-pi-serif text-xl leading-relaxed text-pi-muted">{a.teaser}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-pi-line py-3 text-sm">
          <span className="font-medium">{isPress && a.sender ? `Aussender: ${a.sender}` : `Von ${a.author}`}</span>
          <Meta a={a} />
          {new Date(a.updated_at).getTime() - new Date(a.published_at).getTime() > 60_000 ? <span className="font-pi-mono text-[11px] text-pi-faint">aktualisiert {fmtDate(a.updated_at)}</span> : null}
        </div>
        {isPress ? (
          <p className="mt-4 bg-pi-navy/5 px-4 py-3 text-sm text-pi-navy">
            <strong>Presseaussendung.</strong> Für den Inhalt ist der Aussender verantwortlich, nicht die Presseinfo-Redaktion.
          </p>
        ) : null}
      </header>

      <figure className="mx-auto mt-8 max-w-5xl px-4 md:px-6">
        <Visual a={a} ratio={img ? "aspect-[16/9]" : "aspect-[21/9]"} eager />
        {img ? <figcaption className="mt-2 font-pi-mono text-[11px] text-pi-faint">{a.image_alt ? `${a.image_alt}. ` : ""}Symbolbild, KI-generiert. Zeigt kein reales Ereignis.</figcaption> : null}
      </figure>

      <div className="mx-auto mt-10 max-w-3xl px-4 md:px-6">
        <ArticleBodyWithBox body={a.body} box={partner ? <PartnerLeadBox partner={partner} articleSlug={a.slug} /> : undefined} />

        {faq.length ? (
          <section className="mt-12">
            <h2 className="border-t-2 border-pi-ink pt-3 font-pi-serif text-2xl font-semibold">Häufige Fragen</h2>
            <div className="mt-2 divide-y divide-pi-line">
              {faq.map((f) => (
                <details key={f.q} className="group py-4" open>
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold">{f.q}<span className="text-pi-red transition group-open:rotate-45">+</span></summary>
                  <p className="mt-2 leading-relaxed text-pi-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {isPress && a.sender ? (
          <div className="mt-12 border border-pi-line bg-pi-card p-6">
            <p className="font-pi-mono text-[11px] uppercase tracking-wider text-pi-faint">Rückfragehinweis</p>
            <p className="mt-2 font-pi-serif text-xl font-semibold">{a.sender}</p>
            {a.sender_url ? <a href={a.sender_url} className="pi-link mt-1 inline-block" rel="noopener">{a.sender_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a> : null}
            {region ? <p className="mt-1 text-sm text-pi-muted">{region.label}</p> : null}
          </div>
        ) : null}
        {a.source_name ? (
          <p className="mt-10 border-l-2 border-pi-red pl-4 text-sm text-pi-muted">
            Quelle: {a.source_url ? <a href={a.source_url} className="pi-link" rel="noopener">{a.source_name}</a> : a.source_name}
          </p>
        ) : null}
        {!isPress ? (
          <p className="mt-6 text-xs text-pi-faint">
            Hinweis: Dieser Beitrag wurde KI-unterstützt erstellt und von der Redaktion geprüft. <Link to="/kennzeichnung" className="underline underline-offset-4">Mehr zur Kennzeichnung</Link>
          </p>
        ) : null}

        <div className="mt-14 bg-pi-ink p-6 text-white md:p-8">
          <h2 className="font-pi-serif text-2xl font-semibold">Der Presseinfo-Brief</h2>
          <p className="mb-5 mt-2 text-white/70">Die wichtigsten Nachrichten aus Österreich, jeden Morgen kostenlos im Postfach.</p>
          <NewsletterForm dark />
        </div>
      </div>

      {related.length ? (
        <section className="mx-auto mt-16 max-w-7xl px-4 md:px-6">
          <h2 className="border-t-2 border-pi-ink pt-3 font-pi-serif text-2xl font-semibold">Mehr aus {cat?.label ?? "Österreich"}</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <ArticleCardSmall key={r.slug} a={r} />)}</div>
        </section>
      ) : null}
    </article>
  );
}
