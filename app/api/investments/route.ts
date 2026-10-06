import { getCurrentUser, upsertProfile } from "@/app/auth";
import { queryRows, runStatement } from "@/db/platform";
import { parseMoneyToCents } from "@/lib/money";

export const dynamic = "force-dynamic";

async function currentUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  await upsertProfile(user);
  return user;
}

type InvestmentRow = {
  id: number;
  type: string;
  amount_cents: number;
  transaction_date: string;
};

function serializeInvestment(row: InvestmentRow) {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount_cents / 100,
    date: row.transaction_date,
  };
}

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const rows = await queryRows<InvestmentRow>(
    "SELECT id, type, amount_cents, transaction_date FROM investment_transactions WHERE user_id = ? ORDER BY transaction_date DESC, id DESC",
    [user.userId],
  );
  return Response.json({ investments: rows.map(serializeInvestment) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const type = body.type === "income" ? "income" : body.type === "expense" ? "expense" : null;
  const amountCents = parseMoneyToCents(body.amount);
  const date = String(body.date ?? new Date().toISOString().slice(0, 10));
  if (!type || amountCents === null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Informe se é entrada ou saída e um valor válido." }, { status: 400 });
  }
  const rows = await queryRows<InvestmentRow>(
    `INSERT INTO investment_transactions (user_id, type, amount_cents, transaction_date)
     VALUES (?, ?, ?, ?)
     RETURNING id, type, amount_cents, transaction_date`,
    [user.userId, type, amountCents, date],
  );
  return Response.json({ investment: serializeInvestment(rows[0]) }, { status: 201 });
}

export async function DELETE() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  await runStatement("DELETE FROM investment_transactions WHERE user_id = ?", [user.userId]);
  return Response.json({ ok: true });
}
