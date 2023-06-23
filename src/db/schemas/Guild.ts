import { pgSchema, timestamp, varchar } from 'drizzle-orm/pg-core';


export const guilds = pgSchema(process.env.PGSCHEMA ?? 'app').table('guilds', {
  guildId: varchar('guild_id').primaryKey().notNull(),
  name: varchar('name'),
  locale: varchar('locale').notNull().default('en_us'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});