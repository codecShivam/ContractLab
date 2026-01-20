import { createFileRoute } from '@tanstack/react-router'
import { Code2, ArrowRight, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { trpc } from '../lib/trpc-client'
import logo from '../logo.svg'
import theme from '../theme'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  // Call the health endpoint
  const healthQuery = trpc.health.useQuery()

  return (
    <div className="text-center">
      <header 
        className="min-h-screen flex flex-col items-center justify-center text-[calc(10px+2vmin)]"
        style={{ 
          backgroundColor: theme.bg.primary,
          color: theme.text.primary
        }}
      >
        <img
          src={logo}
          className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
          alt="logo"
        />
        
        {/* API Health Status */}
        <div 
          className="mb-6 px-6 py-3 rounded-lg flex items-center gap-3"
          style={{ 
            backgroundColor: theme.bg.secondary,
            border: `1px solid ${theme.border.default}`
          }}
        >
          {healthQuery.isLoading && (
            <>
              <Loader2 size={20} className="animate-spin" style={{ color: theme.accent.primary }} />
              <span className="text-base">Checking API health...</span>
            </>
          )}
          {healthQuery.isError && (
            <>
              <XCircle size={20} style={{ color: theme.console.errorIcon }} />
              <span className="text-base">
                API Offline - Run: <code className="px-2 py-1 rounded" style={{ backgroundColor: theme.bg.tertiary }}>pnpm --filter api dev</code>
              </span>
            </>
          )}
          {healthQuery.isSuccess && (
            <>
              <CheckCircle size={20} style={{ color: theme.console.successIcon }} />
              <span className="text-base">
                API Status: <strong>{healthQuery.data}</strong>
              </span>
            </>
          )}
        </div>

        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <a
          className="hover:underline"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.accent.primary }}
        >
          Learn React
        </a>
        <a
          className="hover:underline"
          href="https://tanstack.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.accent.primary }}
        >
          Learn TanStack
        </a>
        <a
          className="hover:underline mt-6 text-2xl font-bold flex items-center gap-3 justify-center"
          href="/contract-ide"
          style={{ color: theme.accent.primary }}
        >
          <Code2 size={32} />
          <span>Smart Contract IDE</span>
          <ArrowRight size={24} />
        </a>
        <p className="text-sm mt-2" style={{ color: theme.text.tertiary }}>
          Professional IDE-style interface for contract interaction
        </p>
      </header>
    </div>
  )
}
