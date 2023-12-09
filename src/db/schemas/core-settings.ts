import type { NodeOption } from "@twokei/shoukaku";

import { jsonb, varchar } from "drizzle-orm/pg-core";
import { createTable } from "@/db/Kil";

export const coreSettings = createTable("core_settings", {
  name: varchar("name").primaryKey(),
  value: jsonb("value").$type<NodeOption[]>(),
});
