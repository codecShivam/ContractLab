import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import type { Request, Response } from 'express'

export const createContext = ({ req, res }: CreateExpressContextOptions): { req: Request; res: Response } => ({
  req,
  res,
})

export type Context = Awaited<ReturnType<typeof createContext>>