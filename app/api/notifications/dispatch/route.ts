import { sendPushToUser } from "@/app/push";
import { queryRows, runStatement } from "@/db/platform";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type DailySummary = {
  user_id: string;
  income_cents: number | string;
  expense_cents: number | string;
};

function saoPauloDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function money(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }
  const reportDate = saoPauloDate();
  const summaries = await queryRows<DailySummary>(
    `SELECT subscribed.user_id,
       COALESCE(SUM(CASE WHEN transactions.type = 'income' THEN transactions.amount_cents ELSE 0 END), 0) AS income_cents,
       COALESCE(SUM(CASE WHEN transactions.type = 'expense' THEN transactions.amount_cents ELSE 0 END), 0) AS expense_cents
     FROM (SELECT DISTINCT user_id FROM push_subscriptions) subscribed
     LEFT JOIN transactions ON transactions.user_id = subscribed.user_id AND transactions.transaction_date = ?
     LEFT JOIN daily_notification_log sent ON sent.user_id = subscribed.user_id AND sent.report_date = ?
     WHERE sent.user_id IS NULL
     GROUP BY subscribed.user_id`,
    [reportDate, reportDate],
  );

  let delivered = 0;
  for (const summary of summaries) {
    const incomeCents = Number(summary.income_cents) || 0;
    const expenseCents = Number(summary.expense_cents) || 0;
    const balanceCents = incomeCents - expenseCents;
    const direction = balanceCents > 0 ? "positivo" : balanceCents < 0 ? "negativo" : "equilibrado";
    const sign = balanceCents > 0 ? "+" : "";
    const sent = await sendPushToUser(summary.user_id, {
      title: `Resumo do dia: saldo ${direction}`,
      body: `Entradas ${money(incomeCents)} • Saídas ${money(expenseCents)} • Saldo ${sign}${money(balanceCents)}`,
      tag: `aion-daily-${reportDate}`,
    });
    if (sent > 0) {
      delivered += sent;
      await runStatement(
        "INSERT INTO daily_notification_log (user_id, report_date) VALUES (?, ?) ON CONFLICT(user_id, report_date) DO NOTHING",
        [summary.user_id, reportDate],
      );
    }
  }
  return Response.json({ ok: true, date: reportDate, users: summaries.length, delivered });
}
