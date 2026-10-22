import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { changePassword, logout, me, myArticles, submitArticle } from "@/lib/api/auth.functions";
import { CATEGORIES, REGIONS, categoryBySlug, fmtDate } from "@/lib/site";
import type { Article } from "@/lib/types";

export const Route = createFileRoute("/portal")({
  loader: () => me(),
  head: () => ({ meta: [{ title: "Redaktionsportal | Presseinfo" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PortalPage,
});

type Form = { id?: number; title: string; teaser: string; body: string; category: string; topic: string; region: string; kind: "news" | "ratgeber"; image: string; image_alt: string; source_name: string; source_url: string; meta_description: string; focus_keyword: string; keywords: string };
const EMPTY: Form = { title: "", teaser: "", body: "", category: "chronik", topic: "", region: "", kind: "news", image: "", image_alt: "", source_name: "", source_url: "", meta_description: "", focus_keyword: "", keywords: "" };

const STATUS: Record<string, [string, string]> = {
  review: ["Wartet auf Freigabe", "bg-amber-100 text-amber-800"],
  published: ["Veröffentlicht", "bg-green-100 text-green-800"],
  rejected: ["Zur Überarbeitung", "bg-red-100 text-red-800"],
  draft: ["Entwurf", "bg-gray-100 text-gray-700"],
};

function PortalPage() {
  const user = Route.useLoaderData();
  const router = useRouter();
  if (!user)
    return (
      <section className="mx-auto max-w-xl px-4 py-24">
        <h1 className="font-pi-serif text-3xl font-semibold">Redaktionsportal</h1>
        <p className="mt-4 text-pi-muted">Bitte melden Sie sich an.</p>
        <Link to="/login" className="pi-btn mt-6">Zum Login</Link>
      </section>
    );
  return <Portal name={user.name} isAdmin={user.role === "admin"} onLogout={async () => { await logout(); await router.navigate({ to: "/login" }); }} />;
}

function Portal({ name, isAdmin, onLogout }: { name: string; isAdmin: boolean; onLogout: () => void }) {
  const [list, setList] = useState<Article[]>([]);
  const [f, setF] = useState<Form>(EMPTY);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwMsg, setPwMsg] = useState("");
  const load = async () => setList((await myArticles()).articles);
  useEffect(() => { void load(); }, []);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const cat = categoryBySlug(f.category);
  const words = f.body.trim() ? f.body.trim().split(/\s+/).length : 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-pi-mono text-[11px] uppercase tracking-widest text-pi-red">Redaktionsportal</p>
          <h1 className="mt-1 font-pi-serif text-3xl font-semibold">Hallo {name}</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {isAdmin ? <Link to="/admin" className="pi-link">Zur Redaktionsleitung</Link> : null}
          <button onClick={onLogout} className="underline underline-offset-4">Abmelden</button>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-pi-serif text-xl font-semibold">Meine Beiträge</h2>
            <button className="pi-btn-ghost text-sm" onClick={() => { setF(EMPTY); setMsg(null); }}>Neuer Beitrag</button>
          </div>
          <ul className="mt-4 divide-y divide-pi-line border-y border-pi-line">
            {list.length === 0 ? <li className="py-4 text-sm text-pi-muted">Noch keine Beiträge.</li> : null}
            {list.map((a) => {
              const [label, cls] = STATUS[a.status] ?? [a.status, "bg-gray-100"];
              return (
                <li key={a.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium leading-snug">{a.title}</p>
                    <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${cls}`}>{label}</span>
                  </div>
                  <p className="mt-1 font-pi-mono text-[11px] text-pi-faint">{fmtDate(a.updated_at)} · {categoryBySlug(a.category)?.label}</p>
                  {a.review_note ? <p className="mt-1 text-sm text-pi-red">Hinweis der Redaktion: {a.review_note}</p> : null}
                  <div className="mt-1 flex gap-4 text-sm">
                    {a.status === "published" ? <a className="pi-link" href={`/artikel/${a.slug}`}>Ansehen</a> : (
                      <button className="pi-link" onClick={() => {
                        let kw = ""; try { kw = a.keywords ? (JSON.parse(a.keywords) as string[]).join(", ") : ""; } catch { kw = ""; }
                        setF({ id: a.id, title: a.title, teaser: a.teaser, body: a.body, category: a.category, topic: a.topic ?? "", region: a.region ?? "", kind: a.kind === "ratgeber" ? "ratgeber" : "news", image: a.image ?? "", image_alt: a.image_alt ?? "", source_name: a.source_name ?? "", source_url: a.source_url ?? "", meta_description: a.meta_description ?? "", focus_keyword: a.focus_keyword ?? "", keywords: kw });
                        setMsg(null); window.scrollTo({ top: 0, behavior: "smooth" });
                      }}>Bearbeiten</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <details className="mt-8 border border-pi-line bg-pi-card p-5">
            <summary className="cursor-pointer font-semibold">Passwort ändern</summary>
            <form className="mt-4 grid gap-3" onSubmit={async (e) => { e.preventDefault(); try { const r = await changePassword({ data: pw }); setPwMsg(r.message); if (r.ok) setPw({ current: "", next: "" }); } catch { setPwMsg("Neues Passwort: mindestens 10 Zeichen."); } }}>
              <label className="text-sm">Aktuelles Passwort<input className="pi-field" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></label>
              <label className="text-sm">Neues Passwort<input className="pi-field" type="password" minLength={10} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /></label>
              <button className="pi-btn-ghost justify-center text-sm">Ändern</button>
              {pwMsg ? <p className="text-sm text-pi-muted">{pwMsg}</p> : null}
            </form>
          </details>
        </div>

        <form
          className="grid h-fit gap-4 border border-pi-line bg-pi-card p-5 md:p-7"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true); setMsg(null);
            try {
              const r = await submitArticle({
                data: {
                  id: f.id, title: f.title, teaser: f.teaser, body: f.body, category: f.category, topic: f.topic || null, region: f.region || null, kind: f.kind,
                  image: f.image || null, image_alt: f.image_alt || null, source_name: f.source_name || null, source_url: f.source_url || null,
                  meta_description: f.meta_description || null, focus_keyword: f.focus_keyword || null,
                  keywords: f.keywords.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 15),
                },
              });
              setMsg({ ok: true, text: r.message }); setF(EMPTY); await load();
            } catch (err) {
              setMsg({ ok: false, text: err instanceof Error && err.message.length < 200 ? err.message : "Bitte Pflichtfelder prüfen: Titel mind. 8 Zeichen, Teaser mind. 20, Text mind. 200 Zeichen, Bild-Link mit https://." });
            } finally { setBusy(false); }
          }}
        >
          <h2 className="font-pi-serif text-xl font-semibold">{f.id ? "Beitrag überarbeiten" : "Neuer Beitrag"}</h2>
          <p className="-mt-2 text-sm text-pi-muted">Tipp für Google: das wichtigste Suchwort an den Anfang des Titels, z. B. „PV-Anlage in Wien: …“.</p>
          <label className="text-sm font-medium">Titel *<input className="pi-field" required minLength={8} maxLength={220} value={f.title} onChange={(e) => set("title", e.target.value)} /></label>
          <label className="text-sm font-medium">Teaser *<textarea className="pi-field" rows={2} required minLength={20} value={f.teaser} onChange={(e) => set("teaser", e.target.value)} /></label>
          <label className="text-sm font-medium">Text * <span className="font-normal text-pi-faint">({words} Wörter · „## “ Zwischentitel, „- “ Liste)</span>
            <textarea className="pi-field font-pi-serif text-base leading-relaxed" rows={14} required minLength={200} value={f.body} onChange={(e) => set("body", e.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Rubrik
              <select className="pi-field" value={f.category} onChange={(e) => { set("category", e.target.value); set("topic", ""); }}>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Thema
              <select className="pi-field" value={f.topic} onChange={(e) => set("topic", e.target.value)}>
                <option value="">–</option>
                {cat?.topics.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Bundesland
              <select className="pi-field" value={f.region} onChange={(e) => set("region", e.target.value)}>
                <option value="">Ganz Österreich</option>
                {REGIONS.map((r) => <option key={r.slug} value={r.slug}>{r.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Art
              <select className="pi-field" value={f.kind} onChange={(e) => set("kind", e.target.value === "ratgeber" ? "ratgeber" : "news")}>
                <option value="news">Nachricht</option><option value="ratgeber">Ratgeber</option>
              </select>
            </label>
            <label className="text-sm font-medium">Quelle<input className="pi-field" value={f.source_name} onChange={(e) => set("source_name", e.target.value)} /></label>
            <label className="text-sm font-medium">Quellen-Link<input className="pi-field" type="url" placeholder="https://" value={f.source_url} onChange={(e) => set("source_url", e.target.value)} /></label>
            <label className="text-sm font-medium">Bild-Link (https://…)<input className="pi-field" type="url" value={f.image} onChange={(e) => set("image", e.target.value)} /></label>
            <label className="text-sm font-medium">Bildbeschreibung<input className="pi-field" value={f.image_alt} onChange={(e) => set("image_alt", e.target.value)} /></label>
          </div>
          <details className="border-t border-pi-line pt-3">
            <summary className="cursor-pointer text-sm font-semibold">SEO (optional)</summary>
            <div className="mt-3 grid gap-4">
              <label className="text-sm">Fokus-Keyword<input className="pi-field" value={f.focus_keyword} onChange={(e) => set("focus_keyword", e.target.value)} /></label>
              <label className="text-sm">Meta-Beschreibung <span className="text-pi-faint">({f.meta_description.length}/155)</span><textarea className="pi-field" rows={2} maxLength={170} value={f.meta_description} onChange={(e) => set("meta_description", e.target.value)} /></label>
              <label className="text-sm">Keywords (mit Komma getrennt)<input className="pi-field" value={f.keywords} onChange={(e) => set("keywords", e.target.value)} /></label>
            </div>
          </details>
          {msg ? <p className={`text-sm ${msg.ok ? "text-green-800" : "text-pi-red"}`} role="status">{msg.text}</p> : null}
          <button type="submit" className="pi-btn justify-center" disabled={busy}>{busy ? "Wird gesendet …" : f.id ? "Erneut zur Freigabe einreichen" : "Zur Freigabe einreichen"}</button>
          <p className="text-xs text-pi-faint">Beiträge erscheinen erst nach Freigabe durch die Redaktionsleitung. Nur eigene Texte und Bilder mit Nutzungsrechten verwenden.</p>
        </form>
      </div>
    </section>
  );
}
