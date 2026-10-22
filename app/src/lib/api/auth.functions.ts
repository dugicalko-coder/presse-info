import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { currentUser, endSession, hashPassword, randomHex, requireUser, sha256, startSession, verifyLogin } from "../auth.server";
import { db } from "../db.server";
import type { Article } from "../types";
import { ArticleInput } from "../article-input";
import { saveForReview } from "../articles.server";

export const me = createServerFn({ method: "GET" }).handler(async () => currentUser());

export const login = createServerFn({ method: "POST" })
  .inputValidator(z.object({ login: z.string().trim().min(2).max(200), password: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const r = await verifyLogin(data.login, data.password);
    if (!r.user) return { ok: false as const, message: r.error ?? "Anmeldung fehlgeschlagen." };
    await startSession(r.user.id);
    return { ok: true as const, role: r.user.role };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  await endSession();
  return { ok: true };
});

export const register = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().trim().min(2).max(120),
      username: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9._-]+$/, "Nur Buchstaben, Zahlen, Punkt, Bindestrich, Unterstrich"),
      email: z.string().trim().toLowerCase().email().max(200),
      password: z.string().min(10).max(200),
      note: z.string().trim().max(1000).optional(),
      hp: z.string().max(0).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const d = db();
    if (!d) return { ok: false as const, message: "Registrierung gerade nicht möglich." };
    const exists = await d.prepare("SELECT 1 FROM users WHERE lower(username) = lower(?) OR lower(email) = lower(?)").bind(data.username, data.email).first();
    if (exists) return { ok: false as const, message: "Benutzername oder E-Mail ist bereits vergeben." };
    const salt = randomHex(16);
    await d
      .prepare("INSERT INTO users (username, email, name, role, status, pw_hash, pw_salt, note) VALUES (?,?,?,?,?,?,?,?)")
      .bind(data.username, data.email, data.name, "redakteur", "pending", await hashPassword(data.password, salt), salt, data.note ?? null)
      .run();
    return { ok: true as const, message: "Danke! Ihr Konto ist angelegt und wartet auf die Freigabe durch die Redaktionsleitung. Sie können sich danach anmelden." };
  });

/* ───────────── Redakteure: eigene Beiträge ───────────── */

export const myArticles = createServerFn({ method: "GET" }).handler(async () => {
  const u = await requireUser(["admin", "redakteur"]);
  const res = await db()!.prepare("SELECT * FROM articles WHERE submitted_by = ? ORDER BY updated_at DESC LIMIT 200").bind(u.id).all<Article>();
  return { user: u, articles: res.results ?? [] };
});

export const submitArticle = createServerFn({ method: "POST" })
  .inputValidator(ArticleInput)
  .handler(async ({ data }) => {
    const u = await requireUser(["admin", "redakteur"]);
    const r = await saveForReview(u.id, u.name, data, data.id);
    return { ok: true, id: r.id, message: "Eingereicht. Der Beitrag erscheint, sobald die Redaktionsleitung ihn freigibt." };
  });

/* ───────────── Admin: Freigaben und Benutzer ───────────── */

export const adminReviewQueue = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser(["admin"]);
  const d = db()!;
  const res = await d
    .prepare("SELECT a.*, u.name AS submitter, u.role AS submitter_role FROM articles a LEFT JOIN users u ON u.id = a.submitted_by WHERE a.status = 'review' ORDER BY a.updated_at ASC LIMIT 200")
    .all<Article & { submitter: string | null; submitter_role: string | null }>();
  return res.results ?? [];
});

export const adminReview = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number().int(), action: z.enum(["approve", "reject"]), note: z.string().trim().max(1000).optional() }))
  .handler(async ({ data }) => {
    await requireUser(["admin"]);
    const d = db()!;
    const now = new Date().toISOString();
    if (data.action === "approve")
      await d.prepare("UPDATE articles SET status='published', published_at=?, updated_at=?, review_note=NULL WHERE id=? AND status='review'").bind(now, now, data.id).run();
    else await d.prepare("UPDATE articles SET status='rejected', review_note=?, updated_at=? WHERE id=?").bind(data.note ?? "Abgelehnt", now, data.id).run();
    return { ok: true };
  });

export const adminUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser(["admin"]);
  const res = await db()!
    .prepare("SELECT u.id, u.username, u.email, u.name, u.role, u.status, u.note, u.created_at, u.last_login, (u.api_token_hash IS NOT NULL) AS has_token, (SELECT COUNT(*) FROM articles a WHERE a.submitted_by = u.id) AS beitraege FROM users u ORDER BY u.status = 'pending' DESC, u.created_at DESC")
    .all<{ id: number; username: string; email: string | null; name: string; role: string; status: string; note: string | null; created_at: string; last_login: string | null; has_token: number; beitraege: number }>();
  return res.results ?? [];
});

export const adminUpdateUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number().int(), status: z.enum(["pending", "active", "blocked"]).optional(), role: z.enum(["admin", "redakteur", "bot"]).optional() }))
  .handler(async ({ data }) => {
    const me = await requireUser(["admin"]);
    if (data.id === me.id) return { ok: false, message: "Das eigene Admin-Konto kann hier nicht geändert werden." };
    const d = db()!;
    if (data.status) await d.prepare("UPDATE users SET status = ? WHERE id = ?").bind(data.status, data.id).run();
    if (data.role) await d.prepare("UPDATE users SET role = ? WHERE id = ?").bind(data.role, data.id).run();
    if (data.status === "blocked") await d.prepare("DELETE FROM sessions WHERE user_id = ?").bind(data.id).run();
    return { ok: true, message: "Gespeichert." };
  });

/** Legt einen Bot an (z. B. Grok) oder erneuert seinen Zugangsschlüssel. Der Schlüssel wird nur EINMAL angezeigt. */
export const adminBotToken = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number().int().optional(), name: z.string().trim().min(2).max(60).optional() }))
  .handler(async ({ data }) => {
    await requireUser(["admin"]);
    const d = db()!;
    const token = randomHex(32);
    const th = await sha256(token);
    if (data.id) {
      await d.prepare("UPDATE users SET api_token_hash = ? WHERE id = ?").bind(th, data.id).run();
      return { ok: true, token };
    }
    const name = data.name ?? "Bot";
    const username = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-bot`;
    await d.prepare("INSERT INTO users (username, name, role, status, api_token_hash) VALUES (?,?,?,?,?) ON CONFLICT(username) DO UPDATE SET api_token_hash = excluded.api_token_hash, status = 'active'")
      .bind(username, name, "bot", "active", th).run();
    return { ok: true, token };
  });

export const changePassword = createServerFn({ method: "POST" })
  .inputValidator(z.object({ current: z.string().min(1).max(200), next: z.string().min(10).max(200) }))
  .handler(async ({ data }) => {
    const u = await requireUser(["admin", "redakteur"]);
    const ok = await verifyLogin(u.username, data.current);
    if (!ok.user) return { ok: false, message: "Aktuelles Passwort ist falsch." };
    const salt = randomHex(16);
    await db()!.prepare("UPDATE users SET pw_hash = ?, pw_salt = ? WHERE id = ?").bind(await hashPassword(data.next, salt), salt, u.id).run();
    return { ok: true, message: "Passwort geändert." };
  });
