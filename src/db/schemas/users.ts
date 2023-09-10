import type { InferSelectModel } from "drizzle-orm";
import { timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

export const users = createTable("users", {
  id: varchar("user_id").primaryKey().notNull(),
  name: varchar("name"),
  locale: varchar("locale").default("pt_br"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type RegisteredUser = InferSelectModel<typeof users>;
