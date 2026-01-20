import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import type { Request, Response } from 'express'
import { eq } from 'drizzle-orm'

// User type from session
export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

// Database instance and tables - using any to avoid complex type issues
let dbInstance: any = null
let tablesRef: any = null

export function setDbInstance(db: any, tables: any) {
  dbInstance = db
  tablesRef = tables
}

export interface ContextType {
  req: Request
  res: Response
  user: User | null
  db: any
  users: any
  accounts: any
  sessions: any
  verificationTokens: any
  collections: any
  collectionAbis: any
  collectionFunctions: any
  collectionInputPresets: any
}

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions): Promise<ContextType> => {
  // Get user from session cookie if exists
  let user: User | null = null

  if (!dbInstance || !tablesRef) {
    throw new Error('Database not initialized. Call setDbInstance() first.')
  }

  // Check for session in cookies
  const sessionToken =
    req.cookies?.['authjs.session-token'] ||
    req.cookies?.['__Secure-authjs.session-token']

  if (sessionToken) {
    try {
      const session = await dbInstance
        .select({
          userId: tablesRef.sessions.userId,
          expires: tablesRef.sessions.expires,
        })
        .from(tablesRef.sessions)
        .where(eq(tablesRef.sessions.sessionToken, sessionToken))
        .limit(1)

      if (session.length && new Date(session[0].expires) > new Date()) {
        const userResult = await dbInstance
          .select()
          .from(tablesRef.users)
          .where(eq(tablesRef.users.id, session[0].userId))
          .limit(1)

        if (userResult.length) {
          user = {
            id: userResult[0].id,
            name: userResult[0].name,
            email: userResult[0].email,
            image: userResult[0].image,
          }
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  return {
    req,
    res,
    user,
    db: dbInstance,
    users: tablesRef.users,
    accounts: tablesRef.accounts,
    sessions: tablesRef.sessions,
    verificationTokens: tablesRef.verificationTokens,
    collections: tablesRef.collections,
    collectionAbis: tablesRef.collectionAbis,
    collectionFunctions: tablesRef.collectionFunctions,
    collectionInputPresets: tablesRef.collectionInputPresets,
  }
}

export type Context = ContextType
