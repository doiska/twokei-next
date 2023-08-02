import type { InferModel } from 'drizzle-orm';
import { pgSchema, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgSchema(process.env.PGSCHEMA ?? 'app')
  .table('users', {
    userId: varchar('user_id')
      .primaryKey()
      .notNull(),
    name: varchar('name'),
    locale: varchar('locale')
      .notNull()
      .default('en_us'),
    created_at: timestamp('created_at')
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at')
      .notNull()
      .defaultNow(),
  });

export type RegisteredUser = InferModel<typeof users>;
