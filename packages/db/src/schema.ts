import { pgTable, serial, text, json, timestamp } from 'drizzle-orm/pg-core'

export const collections = pgTable('collections', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  data: json('data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

