/**
 * tRPC Client Configuration
 * Sets up the tRPC client for API communication
 */

import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from 'api/src/router'

/**
 * Create tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * Get API URL from environment or use default
 */
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:4000/trpc'
}

/**
 * Create tRPC client configuration
 */
export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: getApiUrl(),
        // Optional: Add headers, credentials, etc.
        // headers: () => ({
        //   authorization: getAuthToken(),
        // }),
      }),
    ],
  })
}

