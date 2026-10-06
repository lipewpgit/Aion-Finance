import { getCurrentUser, upsertProfile } from "../auth";
import { isDatabaseUnavailable } from "../../db/platform";
import dashboard from "./dashboard.generated";

export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export async function GET(request: Request) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Aion dashboard authentication failed", error);
    const message = isDatabaseUnavailable(error)
      ? "O banco de dados da publicação ainda não está conectado. Tente novamente após a configuração na Vercel."
      : "Não foi possível abrir seu painel agora. Tente novamente em alguns instantes.";
    return Response.redirect(new URL(`/entrar?error=${encodeURIComponent(message)}`, request.url), 302);
  }
  if (!user) return Response.redirect(new URL("/entrar", request.url), 302);
  try {
    await upsertProfile(user);
  } catch (error) {
    console.error("Aion profile sync failed", error);
    const message = "Não foi possível carregar seus dados agora. Tente novamente em alguns instantes.";
    return Response.redirect(new URL(`/entrar?error=${encodeURIComponent(message)}`, request.url), 302);
  }

  const firstName = user.displayName.split(/\s+/)[0] || "você";
  const initials = user.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const html = dashboard
    .replaceAll("Alex Martins", escapeHtml(user.displayName))
    .replaceAll("Boa noite, Alex.", `Olá, ${escapeHtml(firstName)}.`)
    .replaceAll("data-profile-avatar>AM<", `data-profile-avatar>${escapeHtml(initials)}<`)
    .replaceAll(
      'data-profile-image src="" hidden',
      user.avatarDataUrl ? `data-profile-image src="${escapeHtml(user.avatarDataUrl)}"` : 'data-profile-image src="" hidden',
    )
    .replaceAll("Plano Essencial", escapeHtml(user.email));

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store" } });
}
