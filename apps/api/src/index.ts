import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables FIRST
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

// Set AUTH_URL for Auth.js
process.env.AUTH_URL = process.env.AUTH_URL || `http://localhost:${process.env.PORT || 4000}/api/auth`

// Now dynamically import modules that need env vars
async function main() {
  // Import after env is loaded
  const express = (await import('express')).default
  const cors = (await import('cors')).default
  const cookieParser = (await import('cookie-parser')).default
  const trpcExpress = await import('@trpc/server/adapters/express')
  const { Auth } = await import('@auth/core')
  const { default: Google } = await import('@auth/core/providers/google')
  const { default: GitHub } = await import('@auth/core/providers/github')
  const { DrizzleAdapter } = await import('@auth/drizzle-adapter')
  const dbModule = await import('@contractlab/db')
  const { appRouter } = await import('./router.js')
  const { createContext, setDbInstance } = await import('./context.js')

  // Initialize database connection
  const { db } = dbModule.initializeDb()

  // Set db instance for context (cast to any to avoid complex type issues)
  setDbInstance(db as any, {
    users: dbModule.users,
    accounts: dbModule.accounts,
    sessions: dbModule.sessions,
    verificationTokens: dbModule.verificationTokens,
    collections: dbModule.collections,
    collectionAbis: dbModule.collectionAbis,
    collectionFunctions: dbModule.collectionFunctions,
    collectionInputPresets: dbModule.collectionInputPresets,
  })

  const app = express()

  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }))

  // Cookie parser
  app.use(cookieParser())

  // Parse bodies
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

  /**
   * Auth.js config with database storage
   */
  const authConfig = {
    // Database adapter - stores users, accounts, sessions in PostgreSQL
    adapter: DrizzleAdapter(db, {
      usersTable: dbModule.users,
      accountsTable: dbModule.accounts,
      sessionsTable: dbModule.sessions,
      verificationTokensTable: dbModule.verificationTokens,
    }),
    basePath: '/api/auth',
    secret: process.env.AUTH_SECRET || 'dev-secret-please-change-in-production',
    trustHost: true,
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      }),
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      }),
    ],
    session: { strategy: 'database' as const },
    callbacks: {
      session({ session, user }: any) {
        if (user && session.user) {
          session.user.id = user.id
        }
        return session
      },
      redirect({ url, baseUrl }: any) {
        if (url.startsWith('/')) {
          return `${FRONTEND_URL}${url}`
        }
        if (url.includes('localhost:4000') || url.includes(baseUrl)) {
          return FRONTEND_URL
        }
        return url
      },
    },
    debug: process.env.NODE_ENV === 'development',
  }

  /**
   * Convert Express request to Web Request for Auth.js
   */
  function toWebRequest(req: any): Request {
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers.host || 'localhost:4000'
    const url = new URL(req.originalUrl, `${protocol}://${host}`)

    const headers = new Headers()
    Object.entries(req.headers as Record<string, string | string[]>).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value)
      }
    })

    const init: RequestInit = {
      method: req.method,
      headers,
    }

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      const contentType = req.headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        init.body = JSON.stringify(req.body)
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        init.body = new URLSearchParams(req.body as Record<string, string>).toString()
      }
    }

    return new Request(url.toString(), init)
  }

  /**
   * Convert Web Response to Express response
   */
  async function sendWebResponse(webRes: Response, res: any) {
    res.status(webRes.status)
    
    webRes.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        res.appendHeader(key, value)
      } else {
        res.setHeader(key, value)
      }
    })

    const text = await webRes.text()
    res.send(text)
  }

  /**
   * Auth handler
   */
  async function handleAuth(req: any, res: any) {
    try {
      const webReq = toWebRequest(req)
      const webRes = await Auth(webReq, authConfig)
      await sendWebResponse(webRes, res)
    } catch (error) {
      console.error('[Auth Error]', error)
      res.status(500).json({ error: 'Authentication error' })
    }
  }

  // Auth routes
  app.all('/api/auth', handleAuth)
  app.all('/api/auth/:path', handleAuth)
  app.all('/api/auth/:path/:subpath', handleAuth)

  // tRPC routes
  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  )

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', auth: 'enabled' })
  })

  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`)
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/signin`)
    console.log(`📡 tRPC: http://localhost:${PORT}/trpc`)
  })
}

main().catch(console.error)
