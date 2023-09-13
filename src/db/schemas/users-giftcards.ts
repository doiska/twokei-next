import { createTable } from "@/db/Kil";
import { timestamp, varchar } from "drizzle-orm/pg-core";

export const usersGiftcards = createTable("giftcards", {
  code: varchar("code").primaryKey().notNull(),
  source: varchar("source").notNull(),
  consumed: varchar("consumed"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at").notNull(),
});
