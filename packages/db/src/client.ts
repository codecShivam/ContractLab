import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on('connect', () => {
  console.log('Connected to database')
})

pool.on('error', (err) => {
  console.error('Database error', err)
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database error', err)
  } else {
    console.log('Database is ', res.rows[0])
  }
})

export const db = drizzle(pool, { schema })

