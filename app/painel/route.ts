import { getCurrentUser, upsertProfile } from "../auth";
import dashboard from "./dashboard.generated";

export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.redirect(new URL("/entrar", request.url), 302);
  await upsertProfile(user);

  const firstName = user.displayName.split(/\s+/)[0] || "você";
  const initials = user.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const html = dashboard
    .replaceAll("Alex Martins", escapeHtml(user.displayName))
    .replaceAll("Boa noite, Alex.", `Olá, ${escapeHtml(firstName)}.`)
    .replace('<div class="avatar">AM</div>', `<div class="avatar">${escapeHtml(initials)}</div>`)
    .replace("Plano Essencial", escapeHtml(user.email))
    .replace("</div></div></div></aside>", `</div><a class="account-signout" href="/api/auth/logout" target="_top">Sair da conta</a></div></div></aside>`);

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store" } });
}
