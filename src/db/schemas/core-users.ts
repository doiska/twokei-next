import { timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

export const coreUsers = createTable("core_users", {
  id: varchar("user_id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  locale: varchar("locale").default("pt_br"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
