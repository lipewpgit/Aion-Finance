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

    let avatarDataUrl: string | null | undefined;
    if (Object.hasOwn(body, "avatarDataUrl")) {
      avatarDataUrl = body.avatarDataUrl === null || body.avatarDataUrl === "" ? null : String(body.avatarDataUrl);
      if (avatarDataUrl && !/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(avatarDataUrl)) {
        return Response.json({ error: "Escolha uma imagem JPG, PNG ou WebP válida." }, { status: 400 });
      }
      if (avatarDataUrl && avatarDataUrl.length > 300_000) {
        return Response.json({ error: "A foto ficou muito grande. Escolha outra imagem." }, { status: 413 });
      }
    }

    const updatedAt = new Date().toISOString();
    await runStatement("UPDATE auth_users SET name = ?, updated_at = ? WHERE id = ?", [displayName, updatedAt, user.userId]);
    const profile = { ...user, displayName };
    await upsertProfile(profile);
    if (avatarDataUrl !== undefined) {
      await runStatement("UPDATE profiles SET avatar_data_url = ?, updated_at = ? WHERE user_id = ?", [avatarDataUrl, updatedAt, user.userId]);
    }
    return Response.json({ profile: { ...profile, avatarDataUrl: avatarDataUrl === undefined ? user.avatarDataUrl : avatarDataUrl } });
  } catch (error) {
    console.error("Aion profile update failed", error);
    const message = isDatabaseUnavailable(error)
      ? "O banco de dados está temporariamente indisponível. Tente novamente em instantes."
      : "Não foi possível salvar seu perfil agora.";
    return Response.json({ error: message }, { status: 500 });
  }
}
