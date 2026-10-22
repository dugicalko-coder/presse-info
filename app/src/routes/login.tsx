import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { login, register } from "@/lib/api/auth.functions";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/login")({
  head: () => pageHead({ title: "Redaktions-Login", description: "Login und Registrierung für Redakteurinnen und Redakteure von Presseinfo.", path: "/login", noindex: true }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [l, setL] = useState({ login: "", password: "" });
  const [r, setR] = useState({ name: "", username: "", email: "", password: "", password2: "", note: "", hp: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1fr_1.1fr] md:px-6 md:py-20">
      <div>
        <p className="font-pi-mono text-[11px] uppercase tracking-widest text-pi-red">Für die Redaktion</p>
        <h1 className="mt-2 font-pi-serif text-4xl font-semibold leading-tight md:text-5xl">Redaktions-Login</h1>
        <p className="mt-4 leading-relaxed text-pi-muted">Als Redakteurin oder Redakteur schreiben Sie Beiträge direkt im Portal. Jeder Beitrag wird von der Redaktionsleitung geprüft und erst nach Freigabe veröffentlicht.</p>
        <ul className="mt-6 space-y-2 text-sm">
          <li>1. Konto registrieren</li>
          <li>2. Freigabe durch die Redaktionsleitung abwarten</li>
          <li>3. Beiträge schreiben und zur Freigabe einreichen</li>
        </ul>
        <p className="mt-8 text-sm text-pi-muted">Nur eine einzelne Presseaussendung? Dafür brauchen Sie kein Konto: <Link to="/einreichen" className="pi-link">Presseaussendung einreichen</Link>.</p>
      </div>
      <div className="border border-pi-line bg-pi-card p-6 md:p-8">
        <div className="flex border-b border-pi-line">
          {(["login", "register"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setMsg(null); }} className={`-mb-px flex-1 border-b-2 py-2 text-sm font-semibold ${tab === t ? "border-pi-red text-pi-red" : "border-transparent text-pi-muted"}`}>
              {t === "login" ? "Anmelden" : "Registrieren"}
            </button>
          ))}
        </div>
        {tab === "login" ? (
          <form
            className="mt-6 grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true); setMsg(null);
              try {
                const res = await login({ data: l });
                if (!res.ok) setMsg({ ok: false, text: res.message });
                else await router.navigate({ to: res.role === "admin" ? "/admin" : "/portal" });
              } catch {
                setMsg({ ok: false, text: "Anmeldung fehlgeschlagen." });
              } finally { setBusy(false); }
            }}
          >
            <label className="text-sm font-medium">Benutzername oder E-Mail<input className="pi-field" required value={l.login} onChange={(e) => setL({ ...l, login: e.target.value })} autoComplete="username" /></label>
            <label className="text-sm font-medium">Passwort<input className="pi-field" type="password" required value={l.password} onChange={(e) => setL({ ...l, password: e.target.value })} autoComplete="current-password" /></label>
            {msg ? <p className={`text-sm ${msg.ok ? "text-pi-ink" : "text-pi-red"}`} role="alert">{msg.text}</p> : null}
            <button type="submit" className="pi-btn justify-center" disabled={busy}>{busy ? "Moment …" : "Anmelden"}</button>
          </form>
        ) : msg?.ok ? (
          <div className="mt-6 border-l-4 border-pi-red bg-white p-5" role="status"><p className="font-semibold">Registrierung eingegangen.</p><p className="mt-2 text-sm text-pi-muted">{msg.text}</p></div>
        ) : (
          <form
            className="mt-6 grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (r.password !== r.password2) { setMsg({ ok: false, text: "Die Passwörter stimmen nicht überein." }); return; }
              setBusy(true); setMsg(null);
              try {
                const res = await register({ data: { name: r.name, username: r.username, email: r.email, password: r.password, note: r.note || undefined, hp: r.hp } });
                setMsg({ ok: res.ok, text: res.message });
              } catch {
                setMsg({ ok: false, text: "Bitte prüfen: Benutzername 3–40 Zeichen (Buchstaben, Zahlen, . _ -), gültige E-Mail, Passwort mindestens 10 Zeichen." });
              } finally { setBusy(false); }
            }}
          >
            <label className="text-sm font-medium">Vor- und Nachname *<input className="pi-field" required value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} autoComplete="name" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Benutzername *<input className="pi-field" required value={r.username} onChange={(e) => setR({ ...r, username: e.target.value })} autoComplete="username" /></label>
              <label className="text-sm font-medium">E-Mail *<input className="pi-field" type="email" required value={r.email} onChange={(e) => setR({ ...r, email: e.target.value })} autoComplete="email" /></label>
              <label className="text-sm font-medium">Passwort * <span className="font-normal text-pi-faint">(mind. 10 Zeichen)</span><input className="pi-field" type="password" required minLength={10} value={r.password} onChange={(e) => setR({ ...r, password: e.target.value })} autoComplete="new-password" /></label>
              <label className="text-sm font-medium">Passwort wiederholen *<input className="pi-field" type="password" required minLength={10} value={r.password2} onChange={(e) => setR({ ...r, password2: e.target.value })} autoComplete="new-password" /></label>
            </div>
            <label className="text-sm font-medium">Worüber möchten Sie schreiben?<textarea className="pi-field" rows={3} value={r.note} onChange={(e) => setR({ ...r, note: e.target.value })} /></label>
            <input type="text" tabIndex={-1} autoComplete="off" value={r.hp} onChange={(e) => setR({ ...r, hp: e.target.value })} className="hidden" aria-hidden />
            {msg ? <p className="text-sm text-pi-red" role="alert">{msg.text}</p> : null}
            <button type="submit" className="pi-btn justify-center" disabled={busy}>{busy ? "Moment …" : "Konto beantragen"}</button>
          </form>
        )}
      </div>
    </section>
  );
}
