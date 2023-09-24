import type { NodeOption } from "@twokei/shoukaku";

import { jsonb, pgSchema, varchar } from "drizzle-orm/pg-core";
import { env } from "@/app/env";

export const settings = pgSchema(env.PG_SCHEMA ?? "app").table(
  "core_settings",
  {
    name: varchar("name").primaryKey(),
    value: jsonb("value").$type<NodeOption[]>(),
  },
);
