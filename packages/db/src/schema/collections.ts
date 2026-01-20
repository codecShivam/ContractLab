/**
 * Collections Database Schema
 * 
 * Tables for storing user collections with:
 * - ABIs and contract configurations
 * - Granular function visibility for sharing
 * - Input presets/templates
 */

import { pgTable, text, timestamp, boolean, integer, jsonb, unique } from 'drizzle-orm/pg-core'
import { users } from './auth.js'

/**
 * Collections - Main container for a workspace
 */
export const collections = pgTable('collections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: boolean('isPublic').default(false).notNull(),
  shareId: text('shareId').unique(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
})

/**
 * Collection ABIs - ABIs within a collection
 */
export const collectionAbis = pgTable('collectionAbis', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  collectionId: text('collectionId')
    .notNull()
    .references(() => collections.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  content: text('content').notNull(), // JSON ABI string
  contractAddress: text('contractAddress'),
  chainId: integer('chainId'),
  isShared: boolean('isShared').default(true).notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
})

/**
 * Collection Functions - Granular function visibility for sharing
 */
export const collectionFunctions = pgTable(
  'collectionFunctions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    collectionAbiId: text('collectionAbiId')
      .notNull()
      .references(() => collectionAbis.id, { onDelete: 'cascade' }),
    functionName: text('functionName').notNull(),
    isShared: boolean('isShared').default(true).notNull(),
  },
  (table) => ({
    // Unique constraint: one entry per function per ABI
    uniqueFunctionPerAbi: unique().on(table.collectionAbiId, table.functionName),
  })
)

/**
 * Collection Input Presets - Saved input templates
 */
export const collectionInputPresets = pgTable('collectionInputPresets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  collectionAbiId: text('collectionAbiId')
    .notNull()
    .references(() => collectionAbis.id, { onDelete: 'cascade' }),
  functionName: text('functionName').notNull(),
  name: text('name').notNull(),
  inputs: jsonb('inputs').notNull().$type<Record<string, string>>(),
  isShared: boolean('isShared').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
})

// Type exports
export type Collection = typeof collections.$inferSelect
export type NewCollection = typeof collections.$inferInsert
export type CollectionAbi = typeof collectionAbis.$inferSelect
export type NewCollectionAbi = typeof collectionAbis.$inferInsert
export type CollectionFunction = typeof collectionFunctions.$inferSelect
export type CollectionInputPreset = typeof collectionInputPresets.$inferSelect

