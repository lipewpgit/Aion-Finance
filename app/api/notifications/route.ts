import { getCurrentUser, upsertProfile } from "@/app/auth";
import { pushPublicKey, sendPushToUser } from "@/app/push";
import { runStatement } from "@/db/platform";

export const dynamic = "force-dynamic";

async function currentUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  await upsertProfile(user);
  return user;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const publicKey = pushPublicKey();
  if (!publicKey) return Response.json({ error: "As notificações ainda não foram configuradas." }, { status: 503 });
  return Response.json({ publicKey, schedule: "23:00", timezone: "America/Sao_Paulo" });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const action = String(body.action ?? "subscribe");

  if (action === "test") {
    const delivered = await sendPushToUser(user.userId, {
      title: "Aion Finance",
      body: "Tudo certo! Seu resumo financeiro diário chegará por volta das 23h.",
      tag: "aion-test",
    });
    if (!delivered) return Response.json({ error: "Nenhum celular está ativado nesta conta." }, { status: 409 });
    return Response.json({ ok: true, delivered });
  }

  const subscription = body.subscription as Record<string, unknown> | undefined;
  const keys = subscription?.keys as Record<string, unknown> | undefined;
  const endpoint = String(subscription?.endpoint ?? "").trim();
  const p256dh = String(keys?.p256dh ?? "").trim();
  const auth = String(keys?.auth ?? "").trim();
  if (!endpoint.startsWith("https://") || !p256dh || !auth) {
    return Response.json({ error: "Inscrição de notificação inválida." }, { status: 400 });
  }
  await runStatement(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`,
    [user.userId, endpoint, p256dh, auth],
  );
  await sendPushToUser(user.userId, {
    title: "Notificações ativadas",
    body: "Seu resumo diário do Aion Finance chegará por volta das 23h.",
    tag: "aion-enabled",
  });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const endpoint = String(body.endpoint ?? "").trim();
  if (endpoint) await runStatement("DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?", [user.userId, endpoint]);
  else await runStatement("DELETE FROM push_subscriptions WHERE user_id = ?", [user.userId]);
  return Response.json({ ok: true });
}
