import { jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";
import { coreUsers } from "@/db/schemas/core-users";
import { z } from "zod";

export const BenefitsSchema = z
  .object({
    premium: z.boolean(),
    smart_shuffle: z.boolean(),
    playlist_sync: z.number(),
    gift_card: z.number(),
    recommendations: z.union([z.number(), z.literal("unlimited")]),
  })
  .partial();

export type Benefits = z.infer<typeof BenefitsSchema>;

export const usersBenefits = createTable("users_benefits", {
  id: varchar("user_id")
    .primaryKey()
    .notNull()
    .references(() => coreUsers.id),
  benefits: jsonb("benefits").default({}).$type<Benefits>(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  expires_at: timestamp("expires_at").notNull(),
});
