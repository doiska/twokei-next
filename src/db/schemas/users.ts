import type { InferModel } from 'drizzle-orm';
import { pgEnum, pgSchema, timestamp, varchar } from 'drizzle-orm/pg-core';

const roleEnum = pgEnum('role_enum', [
  'dev',
  'premium',
]);

export const users = pgSchema(process.env.PGSCHEMA ?? 'app')
  .table('users', {
    id: varchar('user_id')
      .primaryKey()
      .notNull(),
    name: varchar('name'),
    locale: varchar('locale')
      .default('pt_br'),
    role: roleEnum('role'),
    created_at: timestamp('created_at')
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at')
      .notNull()
      .defaultNow(),
  });

export type RegisteredUser = InferModel<typeof users>;
