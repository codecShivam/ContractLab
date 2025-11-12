import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from './router.js'
import { createContext } from './context.js'
import { pool } from '@contractlab/db'

const app = express()
// allow all origins
app.use(cors({
  origin: '*',
  credentials: true,
  maxAge: 600,
}))

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
)

app.listen(process.env.PORT, async () => {
  console.log(`🚀 API running on http://localhost:${process.env.PORT}`)
})
