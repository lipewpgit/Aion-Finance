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

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const rows = await queryRows<{ id: number; type: string; amount_cents: number; description: string; category: string; transaction_date: string }>(
    "SELECT id, type, amount_cents, description, category, transaction_date FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC, id DESC",
    [user.userId],
  );
  return Response.json({ transactions: rows.map((row) => ({ id: row.id, type: row.type, amount: row.amount_cents / 100, description: row.description, category: row.category, date: row.transaction_date })) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const type = body.type === "income" ? "income" : body.type === "expense" ? "expense" : null;
  const amountCents = parseMoneyToCents(body.amount);
  const description = String(body.description ?? "").trim().slice(0, 80);
  const category = String(body.category ?? "Outros").trim().slice(0, 40) || "Outros";
  const date = String(body.date ?? "");
  if (!type || amountCents === null || !description || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "Preencha os dados da movimentação corretamente." }, { status: 400 });
  const rows = await queryRows<{ id: number; type: string; amount_cents: number; description: string; category: string; transaction_date: string }>(
    `INSERT INTO transactions (user_id, type, amount_cents, description, category, transaction_date)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING id, type, amount_cents, description, category, transaction_date`,
    [user.userId, type, amountCents, description, category, date],
  );
  const row = rows[0];
  return Response.json({ transaction: { id: row.id, type: row.type, amount: row.amount_cents / 100, description: row.description, category: row.category, date: row.transaction_date } }, { status: 201 });
}

export async function DELETE() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  await runStatement("DELETE FROM transactions WHERE user_id = ?", [user.userId]);
  return Response.json({ ok: true });
}
