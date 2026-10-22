// Benutzer, Passwort-Hashing (PBKDF2) und Sitzungen. Nur serverseitig verwenden.
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

import { db } from "./db.server";

export type Role = "admin" | "redakteur" | "bot";
export type User = { id: number; username: string; email: string | null; name: string; role: Role; status: string };

const COOKIE = "pi_session";
const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (h: string) => new Uint8Array(h.match(/.{2}/g)!.map((x) => parseInt(x, 16)));

export async function sha256(s: string) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}
export function randomHex(bytes = 32) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return hex(a.buffer);
}
export async function hashPassword(password: string, saltHex: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: fromHex(saltHex), iterations: 100000 }, key, 256);
  return hex(bits);
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function verifyLogin(login: string, password: string): Promise<{ user?: User; error?: string }> {
  const d = db();
  if (!d) return { error: "Datenbank nicht verfügbar." };
  const row = await d
    .prepare("SELECT * FROM users WHERE (lower(username) = lower(?) OR lower(email) = lower(?)) AND role <> 'bot'")
    .bind(login, login)
    .first<User & { pw_hash: string | null; pw_salt: string | null }>();
  if (!row || !row.pw_hash || !row.pw_salt) return { error: "Benutzername oder Passwort falsch." };
  if (!safeEqual(await hashPassword(password, row.pw_salt), row.pw_hash)) return { error: "Benutzername oder Passwort falsch." };
  if (row.status === "pending") return { error: "Ihr Konto wartet noch auf die Freigabe durch die Redaktionsleitung." };
  if (row.status !== "active") return { error: "Dieses Konto ist gesperrt." };
  return { user: { id: row.id, username: row.username, email: row.email, name: row.name, role: row.role, status: row.status } };
}

export async function startSession(userId: number) {
  const d = db();
  if (!d) return;
  const token = randomHex(32);
  const expires = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
  await d.batch([
    d.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(new Date().toISOString()),
    d.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?,?,?)").bind(await sha256(token), userId, expires),
    d.prepare("UPDATE users SET last_login = ? WHERE id = ?").bind(new Date().toISOString().slice(0, 19).replace("T", " "), userId),
  ]);
  setCookie(COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 14 * 24 * 3600 });
}

export async function endSession() {
  const token = getCookie(COOKIE);
  if (token) await db()?.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  deleteCookie(COOKIE, { path: "/" });
}

export async function currentUser(): Promise<User | null> {
  const token = getCookie(COOKIE);
  const d = db();
  if (!token || !d) return null;
  const row = await d
    .prepare("SELECT u.id, u.username, u.email, u.name, u.role, u.status FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?")
    .bind(await sha256(token), new Date().toISOString())
    .first<User>();
  return row && row.status === "active" ? row : null;
}

export async function requireUser(roles?: Role[]): Promise<User> {
  const u = await currentUser();
  if (!u) throw new Error("Nicht angemeldet");
  if (roles && !roles.includes(u.role)) throw new Error("Keine Berechtigung");
  return u;
}

/** Bot-/API-Zugang per Bearer-Token. */
export async function userFromToken(authHeader: string | null): Promise<User | null> {
  const m = authHeader?.match(/^Bearer\s+([a-f0-9]{48,128})$/i);
  const d = db();
  if (!m || !d) return null;
  const row = await d
    .prepare("SELECT id, username, email, name, role, status FROM users WHERE api_token_hash = ?")
    .bind(await sha256(m[1].toLowerCase()))
    .first<User>();
  return row && row.status === "active" ? row : null;
}
