import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from '../../lib/trpc'

export function getContext() {
  const queryClient = new QueryClient()
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: 'https://contractlab-api.lzeuyy.easypanel.host/trpc',
      }),
    ],
  })
  return {
    queryClient,
    trpcClient,
  }
}

export function Provider({
  children,
  queryClient,
  trpcClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
  trpcClient: ReturnType<typeof trpc.createClient>
}) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
