import { getCurrentUser, upsertProfile } from "@/app/auth";
import { queryRows, runStatement } from "@/db/platform";

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
  const rows = await queryRows<{ id: number; title: string; event_date: string; event_time: string; category: string; duration: string; note: string }>(
    "SELECT id, title, event_date, event_time, category, duration, note FROM calendar_events WHERE user_id = ? ORDER BY event_date, event_time",
    [user.userId],
  );
  return Response.json({ events: rows.map((row) => ({ id: row.id, title: row.title, date: row.event_date, time: row.event_time, category: row.category, duration: row.duration, note: row.note })) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const title = String(body.title ?? "").trim().slice(0, 100);
  const date = String(body.date ?? "");
  const time = String(body.time ?? "09:00");
  const category = String(body.category ?? "Pessoal").trim().slice(0, 40) || "Pessoal";
  const duration = String(body.duration ?? "1 hora").trim().slice(0, 30) || "1 hora";
  const note = String(body.note ?? "").trim().slice(0, 300);
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return Response.json({ error: "Preencha o compromisso corretamente." }, { status: 400 });
  const rows = await queryRows<{ id: number; title: string; event_date: string; event_time: string; category: string; duration: string; note: string }>(
    `INSERT INTO calendar_events (user_id, title, event_date, event_time, category, duration, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     RETURNING id, title, event_date, event_time, category, duration, note`,
    [user.userId, title, date, time, category, duration, note],
  );
  const row = rows[0];
  return Response.json({ event: { id: row.id, title: row.title, date: row.event_date, time: row.event_time, category: row.category, duration: row.duration, note: row.note } }, { status: 201 });
}

export async function DELETE() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  await runStatement("DELETE FROM calendar_events WHERE user_id = ?", [user.userId]);
  return Response.json({ ok: true });
}
