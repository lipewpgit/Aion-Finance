import { getCurrentUser, upsertProfile } from "@/app/auth";
import { queryRows } from "@/db/platform";
import { pushPublicKey } from "@/lib/push";

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
  const rows = await queryRows<{ enabled: number }>("SELECT enabled FROM notification_settings WHERE user_id = ?", [user.userId]);
  const publicKey = pushPublicKey();
  return Response.json({ enabled: rows[0]?.enabled === 1, available: Boolean(publicKey), publicKey, deliveryTime: "22:00" });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const body = await request.json() as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  const endpoint = String(body.endpoint ?? "").trim();
  const p256dh = String(body.keys?.p256dh ?? "").trim();
  const auth = String(body.keys?.auth ?? "").trim();
  if (!endpoint.startsWith("https://") || !p256dh || !auth) {
    return Response.json({ error: "Inscrição de notificação inválida." }, { status: 400 });
  }
  await queryRows(
    `INSERT INTO push_subscriptions (endpoint, user_id, p256dh, auth)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, updated_at = CURRENT_TIMESTAMP
     RETURNING endpoint`,
    [endpoint, user.userId, p256dh, auth],
  );
  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const body = await request.json() as { enabled?: unknown };
  const enabled = body.enabled === true ? 1 : 0;
  await queryRows(
    `INSERT INTO notification_settings (user_id, enabled)
     VALUES (?, ?)
     ON CONFLICT(user_id) DO UPDATE SET enabled = excluded.enabled, updated_at = CURRENT_TIMESTAMP
     RETURNING user_id`,
    [user.userId, enabled],
  );
  return Response.json({ enabled: enabled === 1 });
}
