import type { InferSelectModel } from "drizzle-orm";
import { pgEnum, timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

const roleEnum = pgEnum("role_enum", ["dev", "premium"]);

export const users = createTable("users", {
  id: varchar("user_id").primaryKey().notNull(),
  name: varchar("name"),
  locale: varchar("locale").default("pt_br"),
  role: roleEnum("role"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type RegisteredUser = InferSelectModel<typeof users>;
