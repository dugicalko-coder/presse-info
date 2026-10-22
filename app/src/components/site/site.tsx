import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { submitLead } from "@/lib/api/content.functions";
import { getMarkets, type Markets } from "@/lib/api/markets.functions";

import { subscribe } from "@/lib/api/content.functions";
import {
  CATEGORIES, COMPANIES, KIND_LABEL, REGIONS, SEO_KEYWORDS, SITE,
  TIMING_OPTIONS, categoryBySlug, fmtDate, fmtShort, fmtTime, fmtToday, imageFor, regionBySlug, smallImage, topicSlug, type Partner,
} from "@/lib/site";
import type { ArticleCard } from "@/lib/types";

export type TickerItem = { slug: string; title: string; published_at: string };

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-0.5 leading-none">
      <span className={`font-pi-serif font-bold tracking-tight text-pi-ink ${small ? "text-2xl" : "text-3xl md:text-[2.6rem]"}`}>presse</span>
      <span className={`font-pi-serif font-bold italic tracking-tight text-pi-red ${small ? "text-2xl" : "text-3xl md:text-[2.6rem]"}`}>info</span>
      <span className="ml-0.5 inline-block h-2 w-2 translate-y-[-2px] rounded-full bg-pi-red" aria-hidden />
    </span>
  );
}


const eur = (v: number, d = 0) => new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR", minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const pct = (v: number | null) => (v === null ? "" : `${v >= 0 ? "+" : ""}${v.toFixed(2).replace(".", ",")} %`);

function useMarkets() {
  const [m, setM] = useState<Markets | null>(null);
  useEffect(() => {
    let alive = true;
    const direct = async (): Promise<Markets | null> => {
      try {
        const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether-gold&vs_currencies=eur&include_24hr_change=true&include_last_updated_at=true");
        if (!r.ok) return null;
        const j = (await r.json()) as Record<string, { eur?: number; eur_24h_change?: number; last_updated_at?: number }>;
        const g = j["tether-gold"]; const b = j["bitcoin"];
        if (!g?.eur && !b?.eur) return null;
        return {
          goldOz: g?.eur ?? null, goldGram: g?.eur ? g.eur / 31.1034768 : null, goldChange: g?.eur_24h_change ?? null,
          btc: b?.eur ?? null, btcChange: b?.eur_24h_change ?? null,
          updated: b?.last_updated_at ? new Date(b.last_updated_at * 1000).toISOString() : new Date().toISOString(),
        };
      } catch {
        return null;
      }
    };
    const get = async () => {
      const r = (await direct()) ?? (await getMarkets().catch(() => null));
      if (alive && r) setM(r);
    };
    void get();
    const t = setInterval(get, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return m;
}

/** Tageskurse Gold und Bitcoin (Richtwerte, Quelle CoinGecko). */
export function MarketsWidget() {
  const m = useMarkets();
  const row = (label: string, sub: string, value: string, change: number | null) => (
    <div className="flex items-baseline justify-between gap-3 py-3">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="font-pi-mono text-[10px] uppercase tracking-wider text-pi-faint">{sub}</p>
      </div>
      <div className="text-right">
        <p className="font-pi-serif text-xl font-semibold tabular-nums">{value}</p>
        <p className={`font-pi-mono text-[11px] tabular-nums ${change === null ? "text-pi-faint" : change >= 0 ? "text-green-700" : "text-pi-red"}`}>{change === null ? "24 h" : `${pct(change)} (24 h)`}</p>
      </div>
    </div>
  );
  return (
    <div className="border border-pi-line bg-pi-card p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-pi-serif text-xl font-semibold">Gold & Bitcoin heute</h2>
        <span className="pi-pulse h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden />
      </div>
      <div className="mt-2 divide-y divide-pi-line border-y border-pi-line">
        {row("Goldpreis", "1 Feinunze in Euro", m?.goldOz ? eur(m.goldOz) : "…", m?.goldChange ?? null)}
        {row("Gold pro Gramm", "Feingold in Euro", m?.goldGram ? eur(m.goldGram, 2) : "…", m?.goldChange ?? null)}
        {row("Bitcoin", "BTC in Euro", m?.btc ? eur(m.btc) : "…", m?.btcChange ?? null)}
      </div>
      <p className="mt-3 text-[11px] leading-snug text-pi-faint">Richtwerte ohne Gewähr, Gold über Tether Gold (XAUT). Quelle: CoinGecko{m?.updated ? `, Stand ${new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Vienna" }).format(new Date(m.updated))} Uhr` : ""}.</p>
    </div>
  );
}

/** Kompakte Kurszeile fuer die Kopfleiste (Desktop). */
function MarketsStrip() {
  const m = useMarkets();
  if (!m?.goldOz && !m?.btc) return null;
  return (
    <span className="hidden shrink-0 items-center gap-4 border-l border-white/15 pl-4 font-pi-mono text-[11px] text-white/80 lg:flex">
      {m.goldOz ? <span>Gold <span className="text-white">{eur(m.goldOz)}</span> <span className={m.goldChange !== null && m.goldChange < 0 ? "text-pi-red-soft" : "text-green-400"}>{pct(m.goldChange)}</span></span> : null}
      {m.btc ? <span>BTC <span className="text-white">{eur(m.btc)}</span> <span className={m.btcChange !== null && m.btcChange < 0 ? "text-pi-red-soft" : "text-green-400"}>{pct(m.btcChange)}</span></span> : null}
    </span>
  );
}

export function SiteHeader({ ticker }: { ticker: TickerItem[] }) {
  const [open, setOpen] = useState(false);
  const items = ticker.length ? ticker : [];
  return (
    <header>
      {items.length ? (
        <div className="bg-pi-ink text-[13px] text-white/85">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 md:px-6">
            <span className="flex shrink-0 items-center gap-2 py-2 font-pi-mono text-[11px] uppercase tracking-widest text-white">
              <span className="pi-pulse h-1.5 w-1.5 rounded-full bg-pi-red" aria-hidden /> Aktuell
            </span>
            <div className="pi-marquee-mask relative min-w-0 flex-1 overflow-hidden">
              <div className="pi-marquee flex w-max gap-10 py-2">
                {[...items, ...items].map((t, i) => (
                  <Link key={i} to="/artikel/$slug" params={{ slug: t.slug }} className="whitespace-nowrap hover:text-white" tabIndex={i >= items.length ? -1 : 0}>
                    <span className="mr-2 font-pi-mono text-white/50">{fmtTime(t.published_at)}</span>{t.title}
                  </Link>
                ))}
              </div>
            </div>
            <MarketsStrip />
          </div>
        </div>
      ) : null}
      <div className="border-b border-pi-line bg-pi-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-5">
          <Link to="/" aria-label="Presseinfo Startseite" className="flex flex-col">
            <Logo />
            <span className="mt-1 hidden text-[11px] uppercase tracking-[0.18em] text-pi-muted sm:block">Nachrichten · Presseaussendungen · Österreich</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden text-sm capitalize text-pi-muted lg:block" suppressHydrationWarning>{fmtToday()}</span>
            <Link to="/suche" search={{ q: "" }} className="rounded-full p-2 text-pi-ink hover:bg-pi-ink/5" aria-label="Suche">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </Link>
            <Link to="/login" className="hidden text-sm font-medium text-pi-muted hover:text-pi-ink md:inline">Login</Link>
            <Link to="/einreichen" className="pi-btn hidden sm:inline-flex">Presseaussendung einreichen</Link>
            <button className="rounded-full p-2 lg:hidden" aria-label="Menü" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">{open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
            </button>
          </div>
        </div>
      </div>
      <nav className="sticky top-0 z-40 border-b border-pi-line bg-pi-paper/95 backdrop-blur" aria-label="Rubriken">
        <ul className="mx-auto hidden max-w-7xl items-stretch px-4 lg:flex md:px-6">
          <li><Link to="/nachrichten" className="pi-nav" activeProps={{ className: "pi-nav pi-nav-active" }}>Nachrichten</Link></li>
          {CATEGORIES.map((c) => (
            <li key={c.slug} className="group relative">
              <Link to="/rubrik/$slug" params={{ slug: c.slug }} search={{}} className="pi-nav" activeProps={{ className: "pi-nav pi-nav-active" }}>{c.label}</Link>
              <div className="invisible absolute left-0 top-full z-50 w-60 translate-y-1 border border-pi-line bg-pi-card p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {c.topics.map((t) => (
                  <Link key={t} to="/rubrik/$slug" params={{ slug: c.slug }} search={{ thema: topicSlug(t) }} className="block rounded px-3 py-2 text-sm text-pi-ink hover:bg-pi-paper hover:text-pi-red">{t}</Link>
                ))}
              </div>
            </li>
          ))}
          <li className="ml-auto"><Link to="/presseaussendungen" className="pi-nav font-semibold !text-pi-red">Presseaussendungen</Link></li>
        </ul>
        <div className="pi-chips flex items-stretch overflow-x-auto px-2 lg:hidden">
          <Link to="/nachrichten" className="pi-nav !px-3 !py-3 text-[0.88rem]" activeProps={{ className: "pi-nav pi-nav-active !px-3 !py-3 text-[0.88rem]" }}>Nachrichten</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/rubrik/$slug" params={{ slug: c.slug }} search={{}} className="pi-nav !px-3 !py-3 text-[0.88rem]" activeProps={{ className: "pi-nav pi-nav-active !px-3 !py-3 text-[0.88rem]" }}>{c.label}</Link>
          ))}
          <Link to="/presseaussendungen" className="pi-nav !px-3 !py-3 text-[0.88rem] !text-pi-red">Presseaussendungen</Link>
        </div>
        {open ? (
          <div className="max-h-[75vh] overflow-y-auto border-t border-pi-line bg-pi-paper px-4 pb-6 lg:hidden">
            <Link to="/einreichen" onClick={() => setOpen(false)} className="pi-btn mt-4 w-full justify-center">Presseaussendung einreichen</Link>
            <Link to="/login" onClick={() => setOpen(false)} className="mt-2 block py-2 text-center text-sm font-medium text-pi-muted">Redaktions-Login</Link>
            <ul className="mt-4 divide-y divide-pi-line">
              <li><Link to="/nachrichten" onClick={() => setOpen(false)} className="block py-3 font-medium">Nachrichten</Link></li>
              <li><Link to="/presseaussendungen" onClick={() => setOpen(false)} className="block py-3 font-medium text-pi-red">Presseaussendungen</Link></li>
              {CATEGORIES.map((c) => (
                <li key={c.slug} className="py-3">
                  <Link to="/rubrik/$slug" params={{ slug: c.slug }} search={{}} onClick={() => setOpen(false)} className="font-medium">{c.label}</Link>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.topics.map((t) => (
                      <Link key={t} to="/rubrik/$slug" params={{ slug: c.slug }} search={{ thema: topicSlug(t) }} onClick={() => setOpen(false)} className="rounded-full border border-pi-line px-3 py-1 text-xs text-pi-muted">{t}</Link>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-pi-ink text-white/75">
      <div className="mx-auto max-w-7xl px-4 pt-14 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <div key={c.slug}>
              <h2 className="font-pi-serif text-lg font-semibold text-white"><Link to="/rubrik/$slug" params={{ slug: c.slug }} search={{}} className="hover:text-pi-red-soft">{c.label}</Link></h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {c.topics.map((t) => (
                  <li key={t}><Link to="/rubrik/$slug" params={{ slug: c.slug }} search={{ thema: topicSlug(t) }} className="hover:text-white">{t}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="font-pi-mono text-[11px] uppercase tracking-widest text-white/50">Bundesländer</h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {REGIONS.map((r) => <li key={r.slug}><Link to="/bundesland/$slug" params={{ slug: r.slug }} className="hover:text-white">{r.label}</Link></li>)}
          </ul>
        </div>
      </div>
      <div className="mt-10 overflow-hidden border-y border-white/10 py-4" aria-label="Unsere Firmen">
        <div className="pi-marquee flex w-max gap-12 text-sm">
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <a key={i} href={c.url} rel="noopener" className="whitespace-nowrap font-medium text-white/70 hover:text-white" tabIndex={i >= COMPANIES.length ? -1 : 0}>
              <span className="mr-3 text-pi-red-soft">◆</span>{c.name}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <span className="font-pi-serif text-2xl font-bold text-white">presse<span className="italic text-pi-red-soft">info</span></span>
            <p className="mt-3 text-sm leading-relaxed">{SITE.description}</p>
          </div>
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3">
            <li><Link to="/nachrichten" className="hover:text-white">Nachrichten</Link></li>
            <li><Link to="/presseaussendungen" className="hover:text-white">Presseaussendungen</Link></li>
            <li><Link to="/einreichen" className="hover:text-white">Aussendung einreichen</Link></li>
            <li><Link to="/redaktion" className="hover:text-white">Redaktion</Link></li>
            <li><Link to="/kennzeichnung" className="hover:text-white">Kennzeichnung</Link></li>
            <li><a href="/rss.xml" className="hover:text-white">RSS</a></li>
            <li><Link to="/impressum" className="hover:text-white">Impressum</Link></li>
            <li><Link to="/datenschutz" className="hover:text-white">Datenschutz</Link></li>
            <li><a href={`mailto:${SITE.email}`} className="hover:text-white">Kontakt</a></li>
            <li><Link to="/login" className="hover:text-white">Redaktions-Login</Link></li>
          </ul>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-white/45">{SEO_KEYWORDS.join(" · ")}</p>
        <p className="mt-6 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/55">
          <strong className="text-white/80">Transparenz:</strong> KI-erzeugte Bilder kennzeichnen wir als „Symbolbild, KI-generiert“. KI-unterstützte Texte werden redaktionell geprüft. Presseaussendungen sind als solche gekennzeichnet; für ihren Inhalt ist der jeweilige Aussender verantwortlich.
        </p>
        <p className="mt-4 text-xs text-white/45">© 2026 Presseinfo, ein Medium der {SITE.publisher}, {SITE.address}.</p>
      </div>
    </footer>
  );
}

export function KindMark({ a }: { a: Pick<ArticleCard, "kind" | "category" | "sender"> }) {
  const cat = categoryBySlug(a.category);
  if (a.kind === "presse")
    return <span className="pi-mark text-pi-navy"><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-pi-navy align-middle" />Presseaussendung</span>;
  return (
    <span className="pi-mark text-pi-red">
      {cat?.label ?? "Nachrichten"}
      {a.kind === "ratgeber" ? <span className="ml-2 text-pi-muted">· Ratgeber</span> : null}
    </span>
  );
}

export function Meta({ a, time = true }: { a: ArticleCard; time?: boolean }) {
  const r = regionBySlug(a.region);
  return (
    <span className="font-pi-mono text-[11px] uppercase tracking-wider text-pi-faint">
      {a.kind === "presse" && a.sender ? `${a.sender} · ` : ""}
      {fmtDate(a.published_at)}{time ? `, ${fmtTime(a.published_at)}` : ""}{r ? ` · ${r.label}` : ""}
    </span>
  );
}


const TONES = ["#16294a", "#1f3a33", "#3a1f2b", "#2b2a3f", "#3d2f1c", "#1c3240", "#33261f", "#24303a"];
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

/** Eigenes KI-Foto des Beitrags (gekennzeichnet) oder eine Titelkarte, damit kein Foto doppelt erscheint. */
export function Visual({ a, ratio, small = false, eager = false }: { a: Pick<ArticleCard, "slug" | "image" | "image_alt" | "title" | "category" | "topic" | "kind">; ratio: string; small?: boolean; eager?: boolean }) {
  const src = imageFor(a);
  if (src)
    return (
      <div className="relative overflow-hidden">
        <img src={small ? smallImage(src) : src} alt={a.image_alt ?? a.title} loading={eager ? "eager" : "lazy"} className={`${ratio} w-full object-cover transition duration-700 group-hover:scale-[1.03]`} />
        <span className="absolute bottom-1.5 right-1.5 bg-black/60 px-1.5 py-0.5 font-pi-mono text-[9px] uppercase tracking-wider text-white/90">KI-generiert</span>
      </div>
    );
  const h = hash(a.slug);
  const cat = categoryBySlug(a.category);
  return (
    <div
      className={`${ratio} relative flex w-full flex-col justify-end overflow-hidden p-4 text-white md:p-5`}
      style={{ background: `linear-gradient(${(h % 360)}deg, ${TONES[h % TONES.length]}, #15171c 78%)` }}
      role="img"
      aria-label={a.title}
    >
      <span aria-hidden className="pointer-events-none absolute -right-4 -top-10 select-none font-pi-serif text-[11rem] font-bold leading-none text-white/[0.06]">{(a.topic ?? cat?.label ?? "P").charAt(0)}</span>
      <span className="font-pi-mono text-[10px] uppercase tracking-widest text-pi-red-soft">{a.kind === "presse" ? "Presseaussendung" : a.topic ?? cat?.label}</span>
      {small ? null : <span className="mt-2 line-clamp-3 font-pi-serif text-lg font-semibold leading-snug text-white/90">{a.title}</span>}
    </div>
  );
}

export function ArticleCardBig({ a }: { a: ArticleCard }) {
  return (
    <Link to="/artikel/$slug" params={{ slug: a.slug }} className="group block">
      <Visual a={a} ratio="aspect-[16/9]" eager />
      <div className="mt-5"><KindMark a={a} /></div>
      <h2 className="mt-2 font-pi-serif text-3xl font-semibold leading-[1.1] tracking-tight text-pi-ink group-hover:text-pi-red md:text-[2.6rem]">{a.title}</h2>
      <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-pi-muted">{a.teaser}</p>
      <p className="mt-4">Von {a.author} <span className="mx-1 text-pi-line">|</span> <Meta a={a} /></p>
    </Link>
  );
}

export function ArticleCardSmall({ a, image = true }: { a: ArticleCard; image?: boolean }) {
  return (
    <Link to="/artikel/$slug" params={{ slug: a.slug }} className="group block">
      {image ? <Visual a={a} ratio="aspect-[3/2]" small /> : null}
      <div className={image ? "mt-3" : ""}><KindMark a={a} /></div>
      <h3 className="mt-1.5 font-pi-serif text-xl font-semibold leading-snug text-pi-ink group-hover:text-pi-red">{a.title}</h3>
      <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-pi-muted">{a.teaser}</p>
      <p className="mt-2"><Meta a={a} time={false} /></p>
    </Link>
  );
}

export function ArticleRow({ a }: { a: ArticleCard }) {
  return (
    <Link to="/artikel/$slug" params={{ slug: a.slug }} className="group grid grid-cols-[1fr_96px] gap-4 py-5 sm:grid-cols-[1fr_168px] sm:gap-6">
      <div>
        <KindMark a={a} />
        <h3 className="mt-1 font-pi-serif text-xl font-semibold leading-snug group-hover:text-pi-red">{a.title}</h3>
        <p className="mt-2 hidden text-[15px] leading-relaxed text-pi-muted sm:block">{a.teaser}</p>
        <p className="mt-2"><Meta a={a} /></p>
      </div>
      <Visual a={a} ratio="aspect-[4/3]" small />
    </Link>
  );
}

export function TimeList({ items }: { items: ArticleCard[] }) {
  return (
    <ol className="divide-y divide-pi-line">
      {items.map((a) => (
        <li key={a.slug}>
          <Link to="/artikel/$slug" params={{ slug: a.slug }} className="group grid grid-cols-[52px_1fr] gap-3 py-3.5">
            <span className="pt-0.5 font-pi-mono text-xs text-pi-faint">
              <span className="block text-pi-ink">{fmtTime(a.published_at)}</span>{fmtShort(a.published_at)}
            </span>
            <span>
              <span className="font-pi-mono text-[10px] uppercase tracking-wider text-pi-red">{a.kind === "presse" ? "Presse" : categoryBySlug(a.category)?.label}</span>
              <span className="mt-0.5 block font-medium leading-snug group-hover:text-pi-red">{a.title}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function SectionHead({ kicker, title, children }: { kicker?: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-t-2 border-pi-ink pt-4">
      <div>
        {kicker ? <p className="font-pi-mono text-[11px] uppercase tracking-widest text-pi-red">{kicker}</p> : null}
        <h2 className="mt-1 font-pi-serif text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function PageIntro({ kicker, title, intro, image, featured, facts, children }: {
  kicker: string; title: string; intro: string; image?: string;
  featured?: ArticleCard | null; facts?: { label: string; value: string }[]; children?: ReactNode;
}) {
  return (
    <section className="border-b border-pi-line bg-pi-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-7 md:px-6 md:py-10 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
        <div className="flex min-w-0 flex-col">
          <p className="font-pi-mono text-[11px] uppercase tracking-widest text-pi-red">{kicker}</p>
          <h1 className="mt-2 font-pi-serif text-[2.4rem] font-semibold leading-[1.05] tracking-tight md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-pi-muted md:text-lg">{intro}</p>
          {facts?.length ? (
            <dl className="mt-6 grid grid-cols-3 border-y border-pi-line">
              {facts.map((f, i) => (
                <div key={f.label} className={`py-3 ${i ? "border-l border-pi-line pl-4" : ""}`}>
                  <dt className="font-pi-mono text-[10px] uppercase tracking-wider text-pi-faint">{f.label}</dt>
                  <dd className="mt-1 font-pi-serif text-xl font-semibold leading-tight md:text-2xl">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
        {featured ? (
          <Link to="/artikel/$slug" params={{ slug: featured.slug }} className="group flex min-w-0 flex-col border border-pi-line bg-pi-paper">
            <Visual a={featured} ratio="aspect-[16/9]" eager />
            <div className="flex flex-1 flex-col p-5 md:p-6">
              <span className="font-pi-mono text-[10px] uppercase tracking-widest text-pi-red">Neu in {title}</span>
              <h2 className="mt-2 font-pi-serif text-2xl font-semibold leading-snug group-hover:text-pi-red md:text-[1.7rem]">{featured.title}</h2>
              <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-pi-muted">{featured.teaser}</p>
              <p className="mt-auto pt-3"><Meta a={featured} /></p>
            </div>
          </Link>
        ) : image ? (
          <img src={image} alt="" className="hidden aspect-[16/10] w-full object-cover lg:block" />
        ) : null}
      </div>
    </section>
  );
}

/** Themen-/Filter-Chips: am Handy waagrecht scrollbar statt umbrechend. */
export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="pi-chips -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">{children}</div>;
}

export const chipClass = (active: boolean) =>
  `shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${active ? "border-pi-ink bg-pi-ink text-white" : "border-pi-line bg-white hover:border-pi-ink"}`;

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-pi-line p-10 text-center">
      <p className="text-pi-muted">{text}</p>
      <Link to="/nachrichten" className="pi-link mt-4 inline-block">Alle Nachrichten lesen</Link>
    </div>
  );
}

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={i++}>{m[1]}</strong>);
    else parts.push(<a key={i++} href={m[3]} className="pi-link" rel={m[3].startsWith("http") ? "noopener" : undefined}>{m[2]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function ArticleBody({ body }: { body: string }) {
  const blocks = body.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="pi-prose">
      {blocks.map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        if (t.startsWith("## ")) return <h2 key={i}>{t.slice(3)}</h2>;
        const lines = t.split("\n");
        if (lines.every((l) => l.startsWith("- "))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        if (lines.every((l) => /^\d+\. /.test(l))) return <ol key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\. /, ""))}</li>)}</ol>;
        return <p key={i}>{inline(t.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}


/** "Wir empfehlen"-Box mit Anfrageformular, mitten im Beitrag bei Dienstleister-Themen. */
export function PartnerLeadBox({ partner, articleSlug }: { partner: Partner; articleSlug: string }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", location: "", message: "", timing: TIMING_OPTIONS[0], hp: "" });
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  return (
    <aside className="not-prose my-12 border-2 border-pi-ink bg-pi-card font-pi-sans" aria-label={`Empfehlung: ${partner.name}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 bg-pi-ink px-5 py-2.5 text-white">
        <span className="font-pi-mono text-[11px] uppercase tracking-widest">Wir empfehlen diesen Dienstleister</span>
        <span className="font-pi-mono text-[10px] uppercase tracking-wider text-white/55">Anzeige · Partner-Empfehlung</span>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-[1fr_1.2fr] md:p-7">
        <div>
          <p className="font-pi-mono text-[11px] uppercase tracking-wider text-pi-red">{partner.service}</p>
          <p className="mt-1 font-pi-serif text-2xl font-semibold">{partner.name}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-pi-muted">{partner.pitch}</p>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li>✓ Kostenlose und unverbindliche Anfrage</li>
            <li>✓ Rückmeldung in der Regel binnen 24 Stunden</li>
            <li>✓ Ihre Daten gehen nur an diesen Betrieb</li>
          </ul>
          <a href={partner.url} rel="noopener sponsored" className="pi-link mt-4 inline-block text-sm">{partner.url.replace(/^https?:\/\/(www\.)?/, "")}</a>
        </div>
        {state?.ok ? (
          <div className="self-center border-l-4 border-pi-red bg-white p-5" role="status">
            <p className="font-pi-serif text-xl font-semibold">Danke, Ihre Anfrage ist angekommen.</p>
            <p className="mt-2 text-sm text-pi-muted">{state.text}</p>
          </div>
        ) : (
          <form
            className="grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const r = await submitLead({ data: { ...f, partner: partner.name, articleSlug } });
                setState({ ok: r.ok, text: r.message });
              } catch {
                setState({ ok: false, text: "Bitte Name und Telefonnummer angeben." });
              } finally {
                setBusy(false);
              }
            }}
          >
            <p className="font-semibold">Kostenloses Angebot anfordern</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Name *<input className="pi-field !mt-1" required value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></label>
              <label className="text-sm">Telefon *<input className="pi-field !mt-1" type="tel" required value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></label>
              <label className="text-sm">E-Mail<input className="pi-field !mt-1" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></label>
              <label className="text-sm">PLZ / Ort<input className="pi-field !mt-1" value={f.location} onChange={(e) => set("location", e.target.value)} autoComplete="postal-code" /></label>
            </div>
            <label className="text-sm">Umsetzung
              <select className="pi-field !mt-1" value={f.timing} onChange={(e) => set("timing", e.target.value)}>
                {TIMING_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="text-sm">Ihr Anliegen<textarea className="pi-field !mt-1" rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} /></label>
            <input type="text" tabIndex={-1} autoComplete="off" value={f.hp} onChange={(e) => set("hp", e.target.value)} className="hidden" aria-hidden />
            {state && !state.ok ? <p className="text-sm text-pi-red" role="alert">{state.text}</p> : null}
            <button type="submit" className="pi-btn justify-center" disabled={busy}>{busy ? "Wird gesendet …" : "Anfrage senden"}</button>
            <p className="text-[11px] leading-snug text-pi-faint">Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben an {partner.name} weitergeben. <a href="/datenschutz" className="underline">Datenschutz</a></p>
          </form>
        )}
      </div>
    </aside>
  );
}

export function ArticleBodyWithBox({ body, box }: { body: string; box?: ReactNode }) {
  if (!box) return <ArticleBody body={body} />;
  const blocks = body.replace(/\r/g, "").split(/\n{2,}/);
  // nach etwa der Haelfte, vor der naechsten Zwischenueberschrift einfuegen
  let cut = Math.floor(blocks.length / 2);
  for (let i = cut; i < blocks.length; i++) if (blocks[i].trim().startsWith("## ")) { cut = i; break; }
  return (
    <>
      <ArticleBody body={blocks.slice(0, cut).join("\n\n")} />
      {box}
      <div className="pi-plain"><ArticleBody body={blocks.slice(cut).join("\n\n")} /></div>
    </>
  );
}

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const r = await subscribe({ data: { email } });
          setMsg({ ok: r.ok, text: r.message });
          if (r.ok) setEmail("");
        } catch {
          setMsg({ ok: false, text: "Bitte eine gültige E-Mail-Adresse eingeben." });
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor="nl-email" className="sr-only">E-Mail-Adresse</label>
      <input
        id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ihre E-Mail-Adresse" autoComplete="email"
        className={`min-w-0 flex-1 border px-4 py-3 outline-none focus:border-pi-red ${dark ? "border-white/20 bg-white/5 text-white placeholder:text-white/40" : "border-pi-line bg-white text-pi-ink"}`}
      />
      <button type="submit" disabled={busy} className="pi-btn justify-center">{busy ? "Moment …" : "Kostenlos abonnieren"}</button>
      {msg ? <p role="status" className={`text-sm sm:basis-full ${msg.ok ? (dark ? "text-white" : "text-pi-ink") : "text-pi-red"}`}>{msg.text}</p> : null}
    </form>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export { KIND_LABEL };
