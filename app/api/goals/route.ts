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

type GoalRow = {
  id: number;
  title: string;
  target_cents: number;
  saved_cents: number;
};

type InvestmentRow = {
  id: number;
  type: string;
  amount_cents: number;
  transaction_date: string;
};

function serializeGoal(row: GoalRow) {
  return {
    id: row.id,
    title: row.title,
    target: row.target_cents / 100,
    saved: row.saved_cents / 100,
  };
}

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const rows = await queryRows<GoalRow>(
    "SELECT id, title, target_cents, saved_cents FROM investment_goals WHERE user_id = ? ORDER BY id DESC LIMIT 100",
    [user.userId],
  );
  return Response.json({ goals: rows.map(serializeGoal) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const title = String(body.title ?? "").trim().slice(0, 70);
  const targetCents = parseMoneyToCents(body.target);
  if (!title || targetCents === null) {
    return Response.json({ error: "Escreva a meta e informe um valor desejado." }, { status: 400 });
  }
  const rows = await queryRows<GoalRow>(
    `INSERT INTO investment_goals (user_id, title, target_cents, saved_cents)
     VALUES (?, ?, ?, 0)
     RETURNING id, title, target_cents, saved_cents`,
    [user.userId, title, targetCents],
  );
  return Response.json({ goal: serializeGoal(rows[0]) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const id = Number(body.id);
  const amountCents = parseMoneyToCents(body.amount);
  if (!Number.isInteger(id) || id <= 0 || amountCents === null) {
    return Response.json({ error: "Informe uma meta e um valor válido." }, { status: 400 });
  }
  const existing = await queryRows<{ id: number }>(
    "SELECT id FROM investment_goals WHERE id = ? AND user_id = ? LIMIT 1",
    [id, user.userId],
  );
  if (!existing.length) return Response.json({ error: "Meta não encontrada." }, { status: 404 });
  const date = new Date().toISOString().slice(0, 10);
  const investments = await queryRows<InvestmentRow>(
    `INSERT INTO investment_transactions (user_id, type, amount_cents, transaction_date)
     VALUES (?, 'income', ?, ?)
     RETURNING id, type, amount_cents, transaction_date`,
    [user.userId, amountCents, date],
  );
  const goals = await queryRows<GoalRow>(
    `UPDATE investment_goals SET saved_cents = saved_cents + ?
     WHERE id = ? AND user_id = ?
     RETURNING id, title, target_cents, saved_cents`,
    [amountCents, id, user.userId],
  );
  const investment = investments[0];
  return Response.json({
    goal: serializeGoal(goals[0]),
    investment: {
      id: investment.id,
      type: investment.type,
      amount: investment.amount_cents / 100,
      date: investment.transaction_date,
    },
  });
}

export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (Number.isInteger(id) && id > 0) {
    await runStatement("DELETE FROM investment_goals WHERE id = ? AND user_id = ?", [id, user.userId]);
  } else {
    await runStatement("DELETE FROM investment_goals WHERE user_id = ?", [user.userId]);
  }
  return Response.json({ ok: true });
}
