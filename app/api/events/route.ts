import { asc, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { calendarEvents, profiles } from "@/db/schema";

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
  const rows = await getDb().select().from(calendarEvents).where(eq(calendarEvents.userId, user.userId)).orderBy(asc(calendarEvents.eventDate), asc(calendarEvents.eventTime));
  return Response.json({ events: rows.map((row) => ({ id: row.id, title: row.title, date: row.eventDate, time: row.eventTime, category: row.category, duration: row.duration, note: row.note })) });
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
  const [row] = await getDb().insert(calendarEvents).values({ userId: user.userId, title, eventDate: date, eventTime: time, category, duration, note }).returning();
  return Response.json({ event: { id: row.id, title: row.title, date: row.eventDate, time: row.eventTime, category: row.category, duration: row.duration, note: row.note } }, { status: 201 });
}
