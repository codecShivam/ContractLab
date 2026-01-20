/// <reference types="node" />
import { config } from 'dotenv'
import { resolve } from 'path'
import { defineConfig } from 'drizzle-kit'

config({ path: resolve(__dirname, '../../.env') })

export default defineConfig({
  schema: './dist/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/contractlab',
  },
})