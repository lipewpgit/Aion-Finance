import { desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { profiles, transactions } from "@/db/schema";

export const dynamic = "force-dynamic";

async function currentUser() {
  const user = await getChatGPTUser();
  if (!user) return null;
  await getDb().insert(profiles).values({ userId: user.userId, email: user.email, displayName: user.displayName }).onConflictDoUpdate({ target: profiles.userId, set: { email: user.email, displayName: user.displayName, updatedAt: new Date().toISOString() } });
  return user;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const rows = await getDb().select().from(transactions).where(eq(transactions.userId, user.userId)).orderBy(desc(transactions.transactionDate), desc(transactions.id)).limit(50);
  return Response.json({ transactions: rows.map((row) => ({ id: row.id, type: row.type, amount: row.amountCents / 100, description: row.description, category: row.category, date: row.transactionDate })) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const type = body.type === "income" ? "income" : body.type === "expense" ? "expense" : null;
  const amount = Number(body.amount);
  const description = String(body.description ?? "").trim().slice(0, 80);
  const category = String(body.category ?? "Outros").trim().slice(0, 40) || "Outros";
  const date = String(body.date ?? "");
  if (!type || !Number.isFinite(amount) || amount <= 0 || !description || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "Preencha os dados da movimentação corretamente." }, { status: 400 });
  const [row] = await getDb().insert(transactions).values({ userId: user.userId, type, amountCents: Math.round(amount * 100), description, category, transactionDate: date }).returning();
  return Response.json({ transaction: { id: row.id, type: row.type, amount: row.amountCents / 100, description: row.description, category: row.category, date: row.transactionDate } }, { status: 201 });
}
