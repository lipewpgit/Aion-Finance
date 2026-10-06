import { getCurrentUser, isSameOrigin, upsertProfile } from "@/app/auth";
import { isDatabaseUnavailable, runStatement } from "@/db/platform";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para abrir o perfil." }, { status: 401 });
  return Response.json({ profile: user });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });

    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const displayName = String(body.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
    if (displayName.length < 2) return Response.json({ error: "Digite um nome com pelo menos 2 caracteres." }, { status: 400 });

    const updatedAt = new Date().toISOString();
    await runStatement("UPDATE auth_users SET name = ?, updated_at = ? WHERE id = ?", [displayName, updatedAt, user.userId]);
    const profile = { ...user, displayName };
    await upsertProfile(profile);
    return Response.json({ profile });
  } catch (error) {
    console.error("Aion profile update failed", error);
    const message = isDatabaseUnavailable(error)
      ? "O banco de dados está temporariamente indisponível. Tente novamente em instantes."
      : "Não foi possível salvar seu perfil agora.";
    return Response.json({ error: message }, { status: 500 });
  }
}
