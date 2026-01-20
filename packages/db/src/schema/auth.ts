/**
 * Auth.js Database Schema
 * 
 * Required tables for Auth.js with Drizzle adapter:
 * - users: Store user profiles
 * - accounts: Store OAuth provider connections (Google, GitHub, etc.)
 * - sessions: Store active user sessions
 * - verificationTokens: For email verification (optional)
 */

import { pgTable, text, timestamp, primaryKey, integer } from 'drizzle-orm/pg-core'

/**
 * Users Table
 * Stores basic user information from OAuth providers
 */
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
})

/**
 * Accounts Table  
 * Stores OAuth provider information (Google, GitHub, etc.)
 * Links users to their OAuth accounts
 */
export const accounts = pgTable(
  'accounts',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'oauth', 'email', 'credentials'
    provider: text('provider').notNull(), // 'google', 'github', etc.
    providerAccountId: text('providerAccountId').notNull(), // User ID from provider
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    // Composite primary key: one provider per user
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

/**
 * Sessions Table
 * Stores active user sessions for database-backed sessions
 */
export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

/**
 * Verification Tokens Table
 * Used for passwordless sign-in (email magic links)
 */
export const verificationTokens = pgTable(
  'verificationTokens',
  {
    identifier: text('identifier').notNull(), // Email address
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// Type exports for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Account = typeof accounts.$inferSelect
export type Session = typeof sessions.$inferSelect

