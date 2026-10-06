import { createSession, isSameOrigin, sessionCookie, verifyPassword } from "@/app/auth";
import { isDatabaseUnavailable, queryRows } from "@/db/platform";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const isJson = request.headers.get("content-type")?.includes("application/json") ?? false;
  const fail = (message: string, status: number) => isJson
    ? Response.json({ error: message }, { status })
    : Response.redirect(new URL(`/entrar?error=${encodeURIComponent(message)}`, request.url), 303);
  if (!isSameOrigin(request)) return fail("Origem da solicitação inválida.", 403);

  const body = isJson
    ? await request.json() as Record<string, unknown>
    : Object.fromEntries(new URLSearchParams(await request.text()));
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
  const password = String(body.password ?? "");
  const remember = body.remember === true || body.remember === "on";
  try {
    const [user] = await queryRows<{ id: string; password_hash: string }>(
      "SELECT id, password_hash FROM auth_users WHERE email = ? LIMIT 1",
      [email],
    );
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return fail("E-mail ou senha incorretos.", 401);
    }

    const session = await createSession(user.id, remember);
    const response = isJson
      ? Response.json({ ok: true, redirectTo: "/painel" })
      : new Response(null, { status: 303, headers: { location: new URL("/painel", request.url).toString() } });
    response.headers.set("set-cookie", sessionCookie(session.token, session.maxAge));
    return response;
  } catch (error) {
    console.error("Aion login failed", error);
    if (isDatabaseUnavailable(error)) {
      return fail("O banco de dados da publicação ainda não está conectado. Tente novamente após a configuração na Vercel.", 503);
    }
    return fail("Não foi possível entrar agora. Tente novamente em alguns instantes.", 500);
  }
}
