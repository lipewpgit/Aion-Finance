import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const transactions = sqliteTable(
  "transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().references(() => profiles.userId, { onDelete: "cascade" }),
    type: text("type", { enum: ["income", "expense"] }).notNull(),
    amountCents: integer("amount_cents").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull().default("Outros"),
    transactionDate: text("transaction_date").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("transactions_user_date_idx").on(table.userId, table.transactionDate)],
);

export const calendarEvents = sqliteTable(
  "calendar_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().references(() => profiles.userId, { onDelete: "cascade" }),
    title: text("title").notNull(),
    eventDate: text("event_date").notNull(),
    eventTime: text("event_time").notNull(),
    category: text("category").notNull().default("Pessoal"),
    duration: text("duration").notNull().default("1 hora"),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("calendar_events_user_date_idx").on(table.userId, table.eventDate)],
);
