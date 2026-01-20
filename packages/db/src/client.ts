import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'

const { Pool } = pg

let pool: pg.Pool | null = null
let db: NodePgDatabase<typeof schema> | null = null

/**
 * Initialize the database connection
 * Must be called after environment variables are loaded
 */
export function initializeDb() {
  if (db) return { pool: pool!, db }
  
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  pool = new Pool({ connectionString })
  
  pool.on('connect', () => {
    console.log('Connected to database')
  })
  
  pool.on('error', (err) => {
    console.error('Database pool error', err)
  })
  
  db = drizzle(pool, { schema })
  
  return { pool, db }
}

/**
 * Get the database instance (must call initializeDb first)
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDb() first.')
  }
  return db
}

/**
 * Get the pool instance (must call initializeDb first)
 */
export function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDb() first.')
  }
  return pool
}

// Re-export for convenience (these will throw if not initialized)
export { pool, db }
