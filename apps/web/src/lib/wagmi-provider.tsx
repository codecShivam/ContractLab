import { WagmiProvider, type Config } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { config } from './wagmi-config'

const queryClient = new QueryClient()

interface WagmiProviderWrapperProps {
  children: ReactNode
  wagmiConfig?: Config
}

export const WagmiProviderWrapper = ({ children, wagmiConfig }: WagmiProviderWrapperProps) => {
  const [configInstance] = useState(wagmiConfig || config)

  return (
    <WagmiProvider config={configInstance}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

