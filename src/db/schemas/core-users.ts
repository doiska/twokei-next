import { timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";
import { InferSelectModel } from "drizzle-orm";

export const coreUsers = createTable("core_users", {
  id: varchar("user_id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  locale: varchar("locale").default("pt_br"),
  role: varchar("role").$type<"developer" | "premium">(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CoreUser = InferSelectModel<typeof coreUsers>;
