import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { queryRows, runStatement } from "@/db/platform";

export type AionUser = {
  userId: string;
  displayName: string;
  email: string;
};

const COOKIE_NAME = "aion_session";
const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64ToBytes(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sha256(value: string) {
  return bytesToBase64(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 210_000 }, key, 256);
  return `pbkdf2$210000$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(derived))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, iterationsValue, saltValue, expectedValue] = stored.split("$");
  const iterations = Number(iterationsValue);
  if (algorithm !== "pbkdf2" || !iterations || !saltValue || !expectedValue) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: base64ToBytes(saltValue), iterations }, key, 256));
  const expected = base64ToBytes(expectedValue);
  if (derived.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < derived.length; index += 1) difference |= derived[index] ^ expected[index];
  return difference === 0;
}

export async function createSession(userId: string, remember: boolean) {
  const token = bytesToBase64(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256(token);
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12;
  const expiresAt = new Date(Date.now() + maxAge * 1000).toISOString();
  await runStatement("DELETE FROM auth_sessions WHERE expires_at <= ?", [new Date().toISOString()]);
  await runStatement("INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)", [tokenHash, userId, expiresAt]);
  return { token, maxAge };
}

export function sessionCookie(token: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearedSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function getCurrentUser(): Promise<AionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const tokenHash = await sha256(token);
  const [row] = await queryRows<{ id: string; name: string; email: string; expires_at: string }>(
    `SELECT users.id, users.name, users.email, sessions.expires_at
     FROM auth_sessions sessions
     JOIN auth_users users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ?
     LIMIT 1`,
    [tokenHash],
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await runStatement("DELETE FROM auth_sessions WHERE token_hash = ?", [tokenHash]);
    return null;
  }
  return { userId: row.id, displayName: row.name, email: row.email };
}

export async function requireUser(returnTo = "/painel") {
  const user = await getCurrentUser();
  if (user) return user;
  redirect(`/entrar?return_to=${encodeURIComponent(returnTo)}`);
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await runStatement("DELETE FROM auth_sessions WHERE token_hash = ?", [await sha256(token)]);
}

export async function upsertProfile(user: AionUser) {
  await runStatement(
    `INSERT INTO profiles (user_id, email, display_name, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, updated_at = excluded.updated_at`,
    [user.userId, user.email, user.displayName, new Date().toISOString()],
  );
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
