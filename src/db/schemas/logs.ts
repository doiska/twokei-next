import { pgSchema, serial, varchar } from 'drizzle-orm/pg-core';

export const logs = pgSchema(process.env.PGSCHEMA ?? 'app')
  .table('logs', {
    id: serial('id'),
    env: varchar('environment')
      .default('Development'),
    severity: varchar('severity')
      .notNull(),
    source: varchar('source')
      .default('Twokei'),
    message: varchar('message')
      .notNull(),
    trace: varchar('trace'),
  });
