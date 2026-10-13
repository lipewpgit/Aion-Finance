import { queryRows, runStatement } from "@/db/platform";
import { configuredWebPush } from "@/lib/push";

export const dynamic = "force-dynamic";

function saoPauloDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function money(cents: number) {
  return Math.abs(cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  try {
    const date = saoPauloDate();
    const settings = await queryRows<{ user_id: string }>(
      "SELECT user_id FROM notification_settings WHERE enabled = 1 AND (last_sent_date IS NULL OR last_sent_date <> ?)",
      [date],
    );
    const webpush = configuredWebPush();
    let sent = 0;

    for (const setting of settings) {
      const [totals] = await queryRows<{ balance_cents: number | string }>(
        `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE -amount_cents END), 0) AS balance_cents
         FROM transactions WHERE user_id = ? AND transaction_date = ?`,
        [setting.user_id, date],
      );
      const subscriptions = await queryRows<{ endpoint: string; p256dh: string; auth: string }>(
        "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?",
        [setting.user_id],
      );
      const balanceCents = Number(totals?.balance_cents ?? 0);
      const title = balanceCents > 0 ? "Seu dia fechou positivo ✓" : balanceCents < 0 ? "Seu dia fechou negativo" : "Seu dia ficou equilibrado";
      const body = balanceCents > 0
        ? `Você terminou o dia com ${money(balanceCents)} de saldo positivo.`
        : balanceCents < 0
          ? `As saídas superaram as entradas em ${money(balanceCents)} hoje.`
          : "Entradas e saídas ficaram no mesmo valor hoje.";
      let delivered = false;

      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(
            { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
            JSON.stringify({ title, body, url: "/painel", tag: `aion-daily-${date}` }),
          );
          delivered = true;
          sent += 1;
        } catch (error) {
          const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 0;
          if (statusCode === 404 || statusCode === 410) {
            await runStatement("DELETE FROM push_subscriptions WHERE endpoint = ?", [subscription.endpoint]);
          } else {
            console.error("Aion daily notification failed", { userId: setting.user_id, statusCode });
          }
        }
      }

      if (delivered) {
        await runStatement("UPDATE notification_settings SET last_sent_date = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?", [date, setting.user_id]);
      }
    }

    return Response.json({ ok: true, date, users: settings.length, sent });
  } catch (error) {
    console.error("Aion daily summary cron failed", error);
    return Response.json({ error: "Não foi possível enviar os resumos diários." }, { status: 500 });
  }
}
