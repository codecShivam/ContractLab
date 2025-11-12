import express from 'express'
import cors from 'cors'
import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from './router.js'
import { createContext } from './context.js'

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

app.listen(4000, () => console.log('🚀 API running on http://localhost:4000'))
