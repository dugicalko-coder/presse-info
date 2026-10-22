import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { JsonLd } from "@/components/site/site";
import { submitPressRelease } from "@/lib/api/content.functions";
import { CATEGORIES, PACKAGE_OPTIONS, REGIONS, SITE, TIMING_OPTIONS, abs, pageHead } from "@/lib/site";

export const Route = createFileRoute("/einreichen")({
  head: () => pageHead({ title: "Presseaussendung einreichen und veröffentlichen", description: "Presseaussendung in Österreich veröffentlichen: Meldung online einreichen, Rubrik und Bundesland wählen, mit Link zu Ihrer Website. Die Redaktion prüft jede Einreichung.", path: "/einreichen", image: "/assets/img/presse.webp" }),
  component: SubmitPage,
});

const FAQ = [
  ["Wer kann eine Presseaussendung einreichen?", "Unternehmen, Vereine, Gemeinden, Institutionen und Agenturen aus Österreich oder mit Bezug zu Österreich. Wir veröffentlichen sachliche Meldungen mit Nachrichtenwert, keine reinen Werbetexte."],
  ["Wie schnell wird veröffentlicht?", "Die Redaktion prüft jede Einreichung. Sie wählen im Formular, wann die Meldung erscheinen soll. Sperrfristen geben Sie einfach im Text an."],
  ["Wird meine Website verlinkt?", "Ja. Jede Presseaussendung enthält einen Rückfragehinweis mit Ihrem Firmennamen und einem Link zu Ihrer Website."],
  ["Was kostet die Veröffentlichung?", "Das hängt vom gewählten Paket ab. Nach der Prüfung erhalten Sie ein Angebot per E-Mail, veröffentlicht wird erst nach Ihrer Freigabe."],
  ["Welche Bilder darf ich mitschicken?", "Nur Bilder, an denen Sie die Nutzungsrechte haben. Schicken Sie Bildmaterial nach unserer Rückmeldung per E-Mail, mit Fotonachweis und Bildtext."],
] as const;

type Form = { company: string; contact: string; email: string; phone: string; website: string; title: string; body: string; category: string; region: string; timing: string; package: string; consent: boolean; hp: string };
const EMPTY: Form = { company: "", contact: "", email: "", phone: "", website: "", title: "", body: "", category: "", region: "", timing: TIMING_OPTIONS[0], package: PACKAGE_OPTIONS[0], consent: false, hp: "" };

function SubmitPage() {
  const [f, setF] = useState<Form>(EMPTY);
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })), url: abs("/einreichen") }} />
      <section className="bg-pi-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="font-pi-mono text-[11px] uppercase tracking-widest text-pi-red-soft">Für Unternehmen, Vereine und Gemeinden</p>
            <h1 className="mt-3 font-pi-serif text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">Presseaussendung einreichen</h1>
            <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-white/75">Ihre Meldung erscheint als gekennzeichnete Presseaussendung in der passenden Rubrik und Ihrem Bundesland, mit Link zu Ihrer Website. Auffindbar über Google, Google News und KI-Suchmaschinen wie ChatGPT.</p>
          </div>
          <ol className="grid gap-4 text-sm sm:grid-cols-3 lg:grid-cols-1">
            {["Formular ausfüllen und Meldung senden", "Redaktion prüft und meldet sich per E-Mail", "Veröffentlichung zum gewünschten Termin"].map((s, i) => (
              <li key={s} className="flex items-start gap-3 border-t border-white/15 pt-3"><span className="font-pi-serif text-2xl font-bold text-pi-red-soft">{i + 1}</span><span className="pt-1.5 text-white/85">{s}</span></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-4 py-14 md:px-6 lg:grid-cols-[1.4fr_1fr]">
        {state?.ok ? (
          <div className="h-fit border-l-4 border-pi-red bg-pi-card p-8" role="status">
            <h2 className="font-pi-serif text-3xl font-semibold">Eingelangt.</h2>
            <p className="mt-3 text-lg leading-relaxed text-pi-muted">{state.text}</p>
            <button className="pi-btn-ghost mt-6" onClick={() => { setF(EMPTY); setState(null); }}>Weitere Aussendung einreichen</button>
          </div>
        ) : (
          <form
            className="grid gap-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!f.consent) { setState({ ok: false, text: "Bitte bestätigen Sie die Hinweise zur Veröffentlichung." }); return; }
              setBusy(true);
              try {
                const r = await submitPressRelease({ data: { ...f, consent: true, category: f.category || undefined, region: f.region || undefined, phone: f.phone || undefined, website: f.website || undefined } });
                setState({ ok: r.ok, text: r.message });
              } catch {
                setState({ ok: false, text: "Bitte prüfen Sie die Pflichtfelder: Titel mindestens 8 Zeichen, Text mindestens 80 Zeichen, gültige E-Mail-Adresse." });
              } finally {
                setBusy(false);
              }
            }}
          >
            <h2 className="font-pi-serif text-3xl font-semibold">Ihre Meldung</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium">Firma / Organisation *<input className="pi-field" required value={f.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" /></label>
              <label className="text-sm font-medium">Ansprechperson *<input className="pi-field" required value={f.contact} onChange={(e) => set("contact", e.target.value)} autoComplete="name" /></label>
              <label className="text-sm font-medium">E-Mail *<input className="pi-field" type="email" required value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></label>
              <label className="text-sm font-medium">Telefon<input className="pi-field" type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></label>
            </div>
            <label className="text-sm font-medium">Website (wird im Rückfragehinweis verlinkt)<input className="pi-field" type="url" placeholder="https://" value={f.website} onChange={(e) => set("website", e.target.value)} /></label>
            <label className="text-sm font-medium">Titel der Presseaussendung *<input className="pi-field" required minLength={8} maxLength={200} value={f.title} onChange={(e) => set("title", e.target.value)} /></label>
            <label className="text-sm font-medium">Text *<span className="font-normal text-pi-faint"> (Zwischentitel mit „## “, Aufzählungen mit „- “)</span>
              <textarea className="pi-field font-pi-serif text-base leading-relaxed" rows={12} required minLength={80} value={f.body} onChange={(e) => set("body", e.target.value)} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium">Rubrik
                <select className="pi-field" value={f.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">Bitte wählen</option>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Bundesland
                <select className="pi-field" value={f.region} onChange={(e) => set("region", e.target.value)}>
                  <option value="">Ganz Österreich</option>
                  {REGIONS.map((r) => <option key={r.slug} value={r.slug}>{r.label}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Umsetzung (Veröffentlichung)
                <select className="pi-field" value={f.timing} onChange={(e) => set("timing", e.target.value)}>
                  {TIMING_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Paket
                <select className="pi-field" value={f.package} onChange={(e) => set("package", e.target.value)}>
                  {PACKAGE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
            </div>
            <input type="text" tabIndex={-1} autoComplete="off" value={f.hp} onChange={(e) => set("hp", e.target.value)} className="hidden" aria-hidden />
            <label className="flex items-start gap-3 text-sm text-pi-muted">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[#c8102e]" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} />
              <span>Ich bin berechtigt, diese Meldung zu veröffentlichen, und habe die <a href="/datenschutz" className="pi-link">Datenschutzerklärung</a> gelesen. Die Redaktion darf die Meldung redigieren und als Presseaussendung kennzeichnen.</span>
            </label>
            {state && !state.ok ? <p className="text-sm text-pi-red" role="alert">{state.text}</p> : null}
            <div><button type="submit" className="pi-btn text-base" disabled={busy}>{busy ? "Wird gesendet …" : "Presseaussendung senden"}</button></div>
          </form>
        )}
        <aside>
          <h2 className="border-t-2 border-pi-ink pt-3 font-pi-serif text-2xl font-semibold">Häufige Fragen</h2>
          <div className="mt-2 divide-y divide-pi-line">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium">{q}<span className="text-pi-red transition group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-[15px] leading-relaxed text-pi-muted">{a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 border border-pi-line bg-pi-card p-6 text-sm leading-relaxed text-pi-muted">
            Lieber per E-Mail? Schicken Sie Ihre Aussendung an <a href={`mailto:${SITE.email}`} className="pi-link">{SITE.email}</a>.
          </div>
        </aside>
      </section>
    </>
  );
}
