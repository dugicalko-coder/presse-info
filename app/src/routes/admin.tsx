import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Link } from "@tanstack/react-router";

import { adminDelete, adminOverview, adminSave, adminStatus, adminSubmissionStatus, adminLeadStatus } from "@/lib/api/admin.functions";
import { adminBotToken, adminReview, adminReviewQueue, adminUpdateUser, adminUsers, logout } from "@/lib/api/auth.functions";
import { ArticleBody } from "@/components/site/site";
import { CATEGORIES, REGIONS, categoryBySlug, fmtDate, fmtTime } from "@/lib/site";
import type { Article, Lead, Submission } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  loader: () => adminStatus(),
  head: () => ({ meta: [{ title: "Redaktion | Presseinfo" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPage,
});

type Draft = {
  id?: number; slug: string; title: string; teaser: string; body: string; category: string; topic: string | null; region: string | null;
  kind: "news" | "ratgeber" | "presse"; sender: string | null; sender_url: string | null; author: string; image: string | null;
  source_name: string | null; source_url: string | null; status: "published" | "draft";
};
const EMPTY: Draft = { slug: "", title: "", teaser: "", body: "", category: "wirtschaft", topic: null, region: null, kind: "news", sender: null, sender_url: null, author: "Presseinfo Redaktion", image: null, source_name: null, source_url: null, status: "published" };
const slugify = (s: string) => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
const toDraft = (a: Article): Draft => ({ id: a.id, slug: a.slug, title: a.title, teaser: a.teaser, body: a.body, category: a.category, topic: a.topic, region: a.region, kind: (["news", "ratgeber", "presse"].includes(a.kind) ? a.kind : "news") as Draft["kind"], sender: a.sender, sender_url: a.sender_url, author: a.author, image: a.image, source_name: a.source_name, source_url: a.source_url, status: a.status === "draft" ? "draft" : "published" });

function AdminPage() {
  const status = Route.useLoaderData();
  const router = useRouter();
  if (!status.loggedIn || !status.isAdmin)
    return (
      <section className="mx-auto max-w-xl px-4 py-24">
        <h1 className="font-pi-serif text-3xl font-semibold">Redaktionsleitung</h1>
        <p className="mt-4 text-pi-muted">{status.loggedIn ? "Dieser Bereich ist nur für den Admin." : "Bitte melden Sie sich mit dem Admin-Konto an."}</p>
        <Link to="/login" className="pi-btn mt-6">Zum Login</Link>
      </section>
    );
  return <Editor onLogout={async () => { await logout(); await router.navigate({ to: "/login" }); }} />;
}

function Editor({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"freigaben" | "leads" | "einreichungen" | "artikel" | "benutzer">("freigaben");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [list, setList] = useState<Article[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [subscribers, setSubscribers] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [msg, setMsg] = useState("");
  const load = async () => {
    const r = await adminOverview();
    setList(r.articles); setSubs(r.submissions); setLeads(r.leads); setSubscribers(r.subscribers);
  };
  useEffect(() => { void load(); }, []);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const cat = categoryBySlug(draft.category);
  const openCount = subs.filter((s) => s.status === "neu").length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-pi-serif text-3xl font-semibold">Redaktion</h1>
        <div className="flex items-center gap-6 text-sm text-pi-muted">
          <span>{list.length} Artikel · {subs.length} Einreichungen ({openCount} neu) · {subscribers} Newsletter-Abos</span>
          <button onClick={onLogout} className="underline underline-offset-4 hover:text-pi-ink">Abmelden</button>
        </div>
      </div>
      <div className="pi-chips mt-8 flex gap-2 overflow-x-auto border-b border-pi-line">
        {(["freigaben", "leads", "einreichungen", "artikel", "benutzer"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`-mb-px shrink-0 border-b-2 px-4 py-2 text-sm font-medium capitalize ${tab === t ? "border-pi-red text-pi-red" : "border-transparent text-pi-muted"}`}>{t}{t === "einreichungen" && openCount ? ` (${openCount})` : ""}{t === "leads" && leads.some((l) => l.status === "neu") ? ` (${leads.filter((l) => l.status === "neu").length})` : ""}</button>
        ))}
      </div>

      {tab === "freigaben" ? <ReviewTab onChange={load} /> : tab === "benutzer" ? <UsersTab /> : tab === "leads" ? (
        <div className="mt-6 overflow-x-auto">
          {leads.length === 0 ? <p className="text-pi-muted">Noch keine Dienstleister-Anfragen.</p> : (
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-pi-ink font-pi-mono text-[11px] uppercase tracking-wider text-pi-faint">
                <tr><th className="py-2">Datum</th><th>Partner</th><th>Name</th><th>Kontakt</th><th>Ort</th><th>Umsetzung</th><th>Anliegen</th><th>Beitrag</th><th>Status</th></tr>
              </thead>
              <tbody className="divide-y divide-pi-line">
                {leads.map((l) => (
                  <tr key={l.id} className="align-top">
                    <td className="py-3 pr-3 font-pi-mono text-xs">{fmtDate(l.created_at.replace(" ", "T") + "Z")}<br />{fmtTime(l.created_at.replace(" ", "T") + "Z")}</td>
                    <td className="pr-3 font-medium">{l.partner}</td>
                    <td className="pr-3">{l.name}</td>
                    <td className="pr-3"><a className="pi-link" href={`tel:${l.phone}`}>{l.phone}</a>{l.email ? <><br /><a className="pi-link" href={`mailto:${l.email}`}>{l.email}</a></> : null}</td>
                    <td className="pr-3">{l.location ?? "–"}</td>
                    <td className="pr-3">{l.timing ?? "–"}</td>
                    <td className="max-w-xs pr-3 text-pi-muted">{l.message ?? "–"}</td>
                    <td className="pr-3">{l.article_slug ? <a className="pi-link" href={`/artikel/${l.article_slug}`} target="_blank" rel="noopener">öffnen</a> : "–"}</td>
                    <td>
                      <select className="border border-pi-line bg-white px-2 py-1 text-xs" value={l.status} onChange={async (e) => { await adminLeadStatus({ data: { id: l.id, status: e.target.value as "neu" | "weitergeleitet" | "erledigt" | "Spam" } }); await load(); }}>
                        {["neu", "weitergeleitet", "erledigt", "Spam"].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : tab === "einreichungen" ? (
        <div className="mt-6 grid gap-4">
          {subs.length === 0 ? <p className="text-pi-muted">Noch keine Einreichungen.</p> : null}
          {subs.map((s) => (
            <details key={s.id} className="border border-pi-line bg-pi-card p-5">
              <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-3">
                <span className="font-pi-serif text-lg font-semibold">{s.title}</span>
                <span className="font-pi-mono text-xs text-pi-faint">{s.company} · {fmtDate(s.created_at.replace(" ", "T") + "Z")} {fmtTime(s.created_at.replace(" ", "T") + "Z")} · <span className={s.status === "neu" ? "text-pi-red" : ""}>{s.status}</span></span>
              </summary>
              <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <div><dt className="inline text-pi-faint">Kontakt: </dt><dd className="inline">{s.contact}, <a className="pi-link" href={`mailto:${s.email}`}>{s.email}</a>{s.phone ? `, ${s.phone}` : ""}</dd></div>
                <div><dt className="inline text-pi-faint">Website: </dt><dd className="inline">{s.website ?? "–"}</dd></div>
                <div><dt className="inline text-pi-faint">Rubrik / Bundesland: </dt><dd className="inline">{categoryBySlug(s.category ?? "")?.label ?? "–"} / {REGIONS.find((r) => r.slug === s.region)?.label ?? "Österreich"}</dd></div>
                <div><dt className="inline text-pi-faint">Umsetzung / Paket: </dt><dd className="inline">{s.timing ?? "–"} / {s.package ?? "–"}</dd></div>
              </dl>
              <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap bg-pi-paper p-4 font-pi-serif text-[15px] leading-relaxed">{s.body}</pre>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  className="pi-btn"
                  onClick={() => {
                    setDraft({ ...EMPTY, kind: "presse", title: s.title, slug: slugify(s.title), teaser: s.body.split(/\n+/)[0].slice(0, 280), body: s.body, category: s.category ?? "wirtschaft", region: s.region, sender: s.company, sender_url: s.website, author: s.company, status: "draft" });
                    setTab("artikel"); setMsg("Als Entwurf übernommen. Bitte prüfen und speichern.");
                    void adminSubmissionStatus({ data: { id: s.id, status: "in Arbeit" } }).then(load);
                  }}
                >Als Presseaussendung übernehmen</button>
                {(["neu", "in Arbeit", "veröffentlicht", "abgelehnt"] as const).map((st) => (
                  <button key={st} className={`rounded-full border px-3 py-1 text-xs ${s.status === st ? "border-pi-ink bg-pi-ink text-white" : "border-pi-line"}`} onClick={async () => { await adminSubmissionStatus({ data: { id: s.id, status: st } }); await load(); }}>{st}</button>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <button onClick={() => { setDraft(EMPTY); setMsg(""); }} className="pi-btn-ghost">Neuer Artikel</button>
            <ul className="mt-6 max-h-[80vh] divide-y divide-pi-line overflow-y-auto border-y border-pi-line">
              {list.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 py-3">
                  <button className="text-left" onClick={() => { setDraft(toDraft(a)); setMsg(""); }}>
                    <span className="block font-medium leading-snug hover:text-pi-red">{a.title}</span>
                    <span className="font-pi-mono text-xs text-pi-faint">{fmtDate(a.published_at)} · {a.kind} · {a.category}{a.status === "draft" ? " · Entwurf" : ""}</span>
                  </button>
                  <button className="shrink-0 text-xs text-pi-faint hover:text-pi-red" onClick={async () => { if (!confirm(`„${a.title}“ wirklich löschen?`)) return; await adminDelete({ data: { id: a.id } }); await load(); }}>Löschen</button>
                </li>
              ))}
            </ul>
          </div>
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const r = await adminSave({ data: { ...draft, slug: draft.slug || slugify(draft.title) } });
                setMsg(r.message ?? "Gespeichert"); await load();
              } catch {
                setMsg("Bitte Pflichtfelder prüfen (Titel min. 5, Teaser min. 10, Text min. 20 Zeichen).");
              }
            }}
          >
            <h2 className="font-pi-serif text-xl font-semibold">{draft.id ? "Artikel bearbeiten" : "Neuer Artikel"}</h2>
            <label className="text-sm">Titel<input className="pi-field" value={draft.title} onChange={(e) => set("title", e.target.value)} required /></label>
            <label className="text-sm">Adresse (Slug)<input className="pi-field" value={draft.slug} placeholder={slugify(draft.title)} onChange={(e) => set("slug", slugify(e.target.value))} /></label>
            <label className="text-sm">Teaser<textarea className="pi-field" rows={2} value={draft.teaser} onChange={(e) => set("teaser", e.target.value)} required /></label>
            <label className="text-sm">Text (Absätze mit Leerzeile, „## “ Zwischentitel, „- “ Listen, [Text](https://…) Links)<textarea className="pi-field font-pi-mono text-sm" rows={14} value={draft.body} onChange={(e) => set("body", e.target.value)} required /></label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm">Art
                <select className="pi-field" value={draft.kind} onChange={(e) => set("kind", e.target.value as Draft["kind"])}>
                  <option value="news">Nachricht</option><option value="ratgeber">Ratgeber</option><option value="presse">Presseaussendung</option>
                </select>
              </label>
              <label className="text-sm">Rubrik
                <select className="pi-field" value={draft.category} onChange={(e) => { set("category", e.target.value); set("topic", null); }}>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
              </label>
              <label className="text-sm">Thema
                <select className="pi-field" value={draft.topic ?? ""} onChange={(e) => set("topic", e.target.value || null)}>
                  <option value="">–</option>
                  {cat?.topics.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="text-sm">Bundesland
                <select className="pi-field" value={draft.region ?? ""} onChange={(e) => set("region", e.target.value || null)}>
                  <option value="">Ganz Österreich</option>
                  {REGIONS.map((r) => <option key={r.slug} value={r.slug}>{r.label}</option>)}
                </select>
              </label>
              <label className="text-sm">Status
                <select className="pi-field" value={draft.status} onChange={(e) => set("status", e.target.value === "draft" ? "draft" : "published")}>
                  <option value="published">Veröffentlicht</option><option value="draft">Entwurf</option>
                </select>
              </label>
              <label className="text-sm">Autor<input className="pi-field" value={draft.author} onChange={(e) => set("author", e.target.value)} /></label>
            </div>
            {draft.kind === "presse" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm">Aussender<input className="pi-field" value={draft.sender ?? ""} onChange={(e) => set("sender", e.target.value || null)} /></label>
                <label className="text-sm">Website des Aussenders<input className="pi-field" value={draft.sender_url ?? ""} onChange={(e) => set("sender_url", e.target.value || null)} /></label>
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm">Bild (Pfad/URL)<input className="pi-field" value={draft.image ?? ""} placeholder={cat?.image} onChange={(e) => set("image", e.target.value || null)} /></label>
              <label className="text-sm">Quelle<input className="pi-field" value={draft.source_name ?? ""} onChange={(e) => set("source_name", e.target.value || null)} /></label>
              <label className="text-sm">Quellen-Link<input className="pi-field" value={draft.source_url ?? ""} onChange={(e) => set("source_url", e.target.value || null)} /></label>
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" className="pi-btn">Speichern</button>
              <span className="text-sm text-pi-muted" role="status">{msg}</span>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

type ReviewItem = Awaited<ReturnType<typeof adminReviewQueue>>[number];

function ReviewTab({ onChange }: { onChange: () => void }) {
  const [items, setItems] = useState<ReviewItem[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const load = async () => setItems(await adminReviewQueue());
  useEffect(() => { void load(); }, []);
  if (!items) return <p className="mt-6 text-pi-muted">Lade …</p>;
  if (!items.length) return <p className="mt-6 text-pi-muted">Keine Beiträge warten auf Freigabe.</p>;
  return (
    <div className="mt-6 grid gap-4">
      {items.map((a) => (
        <div key={a.id} className="border border-pi-line bg-pi-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-pi-mono text-[11px] uppercase tracking-wider text-pi-faint">{a.submitter ?? a.author} · {a.submitter_role === "bot" ? "Bot" : "Redakteur"} · {a.category}{a.topic ? ` / ${a.topic}` : ""} · {fmtDate(a.updated_at)} {fmtTime(a.updated_at)}</p>
              <p className="mt-1 font-pi-serif text-xl font-semibold leading-snug">{a.title}</p>
              <p className="mt-1 text-sm text-pi-muted">{a.teaser}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button className="pi-btn-ghost text-sm" onClick={() => setOpen(open === a.id ? null : a.id)}>{open === a.id ? "Schließen" : "Lesen"}</button>
              <button className="pi-btn text-sm" onClick={async () => { await adminReview({ data: { id: a.id, action: "approve" } }); await load(); onChange(); }}>Freigeben</button>
              <button
                className="border border-pi-red px-3 py-2 text-sm font-semibold text-pi-red"
                onClick={async () => {
                  const note = prompt("Grund der Ablehnung (sieht der Autor):", "Bitte überarbeiten") ?? undefined;
                  if (note === undefined) return;
                  await adminReview({ data: { id: a.id, action: "reject", note } }); await load(); onChange();
                }}
              >Ablehnen</button>
            </div>
          </div>
          {open === a.id ? (
            <div className="mt-5 border-t border-pi-line pt-5">
              {a.image ? <img src={a.image} alt="" className="mb-5 aspect-[16/9] w-full max-w-xl object-cover" /> : null}
              <div className="max-w-3xl"><ArticleBody body={a.body} /></div>
              {a.source_url ? <p className="mt-4 text-sm">Quelle: <a className="pi-link" href={a.source_url} target="_blank" rel="noopener">{a.source_name ?? a.source_url}</a></p> : null}
              <p className="mt-4 text-sm text-pi-muted">Änderungen vor der Freigabe: im Tab „Artikel“ öffnen, bearbeiten und mit Status „Veröffentlicht“ speichern.</p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

type UserRow = Awaited<ReturnType<typeof adminUsers>>[number];

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [token, setToken] = useState<{ name: string; token: string } | null>(null);
  const [botName, setBotName] = useState("Grok");
  const load = async () => setUsers(await adminUsers());
  useEffect(() => { void load(); }, []);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const badge = (st: string) => (st === "active" ? "bg-green-100 text-green-800" : st === "pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800");
  const label = (st: string) => (st === "active" ? "aktiv" : st === "pending" ? "wartet auf Freigabe" : "gesperrt");
  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="font-pi-serif text-xl font-semibold">Benutzer</h2>
        <p className="mt-1 text-sm text-pi-muted">Neue Redakteure registrieren sich unter /login und erscheinen hier. Erst nach Ihrer Freigabe können sie sich anmelden, und auch dann geht jeder Beitrag zuerst in „Freigaben“.</p>
        <ul className="mt-4 divide-y divide-pi-line border-y border-pi-line">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium">{u.name} <span className="font-pi-mono text-xs text-pi-faint">@{u.username} · {u.role}</span></p>
                <p className="text-xs text-pi-muted">{u.email ?? "–"} · {u.beitraege} Beiträge · seit {fmtDate(u.created_at.replace(" ", "T") + "Z")}{u.note ? ` · „${u.note}“` : ""}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs ${badge(u.status)}`}>{label(u.status)}</span>
                {u.role !== "admin" ? (
                  <>
                    {u.status !== "active" ? <button className="pi-btn !px-3 !py-1.5 text-xs" onClick={async () => { await adminUpdateUser({ data: { id: u.id, status: "active" } }); await load(); }}>Freigeben</button> : null}
                    {u.status !== "blocked" ? <button className="border border-pi-line px-3 py-1.5 text-xs" onClick={async () => { await adminUpdateUser({ data: { id: u.id, status: "blocked" } }); await load(); }}>Sperren</button> : null}
                    {u.role === "bot" ? <button className="border border-pi-line px-3 py-1.5 text-xs" onClick={async () => { if (!confirm("Neuen Schlüssel erzeugen? Der alte wird ungültig.")) return; const r = await adminBotToken({ data: { id: u.id } }); setToken({ name: u.name, token: r.token }); await load(); }}>Neuer Schlüssel</button> : null}
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-pi-serif text-xl font-semibold">Bot-Zugang (z. B. Grok)</h2>
        <p className="mt-1 text-sm text-pi-muted">Ein Bot reicht Beiträge per Schnittstelle ein. Sie landen immer zuerst in „Freigaben“, nichts erscheint ohne Ihre Zustimmung. Limit: 20 Einreichungen pro Tag.</p>
        <div className="mt-4 flex gap-2">
          <input className="pi-field !mt-0" value={botName} onChange={(e) => setBotName(e.target.value)} aria-label="Name des Bots" />
          <button className="pi-btn shrink-0" onClick={async () => { const r = await adminBotToken({ data: { name: botName } }); setToken({ name: botName, token: r.token }); await load(); }}>Bot anlegen</button>
        </div>
        {token ? (
          <div className="mt-5 border-2 border-pi-ink bg-white p-4 text-sm">
            <p className="font-semibold">Schlüssel für {token.name} – jetzt kopieren, er wird nur einmal angezeigt:</p>
            <code className="mt-2 block break-all bg-pi-paper p-2 font-pi-mono text-xs">{token.token}</code>
            <p className="mt-4 font-semibold">So postet der Bot:</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap bg-pi-paper p-2 font-pi-mono text-[11px] leading-relaxed">{`POST ${origin}/api/v1/beitraege
Authorization: Bearer ${token.token}
Content-Type: application/json

{
  "title": "PV-Anlage in Wien: …",
  "teaser": "Kurz zusammengefasst …",
  "body": "Text in Markdown (## Zwischentitel, - Listen), mind. 200 Zeichen",
  "category": "energie",
  "topic": "Photovoltaik",
  "region": "wien",
  "kind": "news",
  "source_name": "Quelle",
  "source_url": "https://…",
  "image": "https://…/bild.jpg",
  "meta_description": "…",
  "keywords": ["pv anlage wien", "…"]
}`}</pre>
            <p className="mt-2 text-xs text-pi-muted">Rubriken: politik, wirtschaft, chronik, bauen-wohnen, energie, gesundheit, kultur, lifestyle. GET auf dieselbe Adresse zeigt Themen und den Status der eigenen Einreichungen.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
