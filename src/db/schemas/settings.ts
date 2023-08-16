import type { NodeOption } from 'shoukaku';

import { jsonb, pgSchema, varchar } from 'drizzle-orm/pg-core';

export const settings = pgSchema(process.env.PGSCHEMA ?? 'app')
  .table(
    'core_settings',
    {
      name: varchar('name')
        .primaryKey(),
      value: jsonb('value')
        .$type<NodeOption[]>(),
    },
  );
