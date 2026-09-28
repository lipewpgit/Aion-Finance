import { createSession, hashPassword, isSameOrigin, sessionCookie, upsertProfile } from "@/app/auth";
import { queryRows, runStatement } from "@/db/platform";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const isJson = request.headers.get("content-type")?.includes("application/json") ?? false;
  const fail = (message: string, status: number) => isJson
    ? Response.json({ error: message }, { status })
    : Response.redirect(new URL(`/entrar?mode=register&error=${encodeURIComponent(message)}`, request.url), 303);
  if (!isSameOrigin(request)) return fail("Origem da solicitação inválida.", 403);

  const body = isJson
    ? await request.json() as Record<string, unknown>
    : Object.fromEntries(new URLSearchParams(await request.text()));
  const name = String(body.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
  const password = String(body.password ?? "");
  const remember = body.remember === true || body.remember === "on";

  if (name.length < 2) return fail("Informe seu nome.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Informe um e-mail válido.", 400);
  if (password.length < 8 || password.length > 128) return fail("A senha deve ter entre 8 e 128 caracteres.", 400);
  if (password !== String(body.confirmPassword ?? password)) return fail("As senhas não coincidem.", 400);

  const existing = await queryRows<{ id: string }>("SELECT id FROM auth_users WHERE email = ? LIMIT 1", [email]);
  if (existing.length) return fail("Já existe uma conta com este e-mail.", 409);

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  try {
    await runStatement("INSERT INTO auth_users (id, name, email, password_hash) VALUES (?, ?, ?, ?)", [userId, name, email, passwordHash]);
    await upsertProfile({ userId, displayName: name, email });
  } catch (error) {
    await runStatement("DELETE FROM auth_users WHERE id = ?", [userId]).catch(() => undefined);
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("unique") || message.includes("constraint")) return fail("Já existe uma conta com este e-mail.", 409);
    throw error;
  }

  const session = await createSession(userId, remember);
  const response = isJson
    ? Response.json({ ok: true, redirectTo: "/painel" }, { status: 201 })
    : new Response(null, { status: 303, headers: { location: new URL("/painel", request.url).toString() } });
  response.headers.set("set-cookie", sessionCookie(session.token, session.maxAge));
  return response;
}
