import { useCallback, type ReactNode } from 'react'
import {
  ABIProvider,
  ConsoleProvider,
  FunctionExplorerProvider,
  ContractProvider,
  HistoryProvider,
  CollectionProvider,
  useConsoleContext
} from '../contexts'
import type { HistoryEntry } from '../lib/history-storage'

interface ContractIDEProvidersProps {
  children: ReactNode
}

export function ContractIDEProviders({ children }: ContractIDEProvidersProps) {
  return (
    <CollectionProvider>
      <ConsoleProvider>
        <ContractIDEWithProviders>
          {children}
        </ContractIDEWithProviders>
      </ConsoleProvider>
    </CollectionProvider>
  )
}

function ContractIDEWithProviders({ children }: { children: ReactNode }) {
  const { addLog } = useConsoleContext()

  const handleRerunFromHistory = useCallback((entry: HistoryEntry) => {
    // This will be passed to HistoryProvider
    return entry
  }, [])

  return (
    <ContractProvider onLog={addLog}>
      <ABIProvider onLog={addLog}>
        <FunctionExplorerProvider onLog={addLog}>
          <HistoryProvider onLog={addLog} onRerun={handleRerunFromHistory}>
            {children}
          </HistoryProvider>
        </FunctionExplorerProvider>
      </ABIProvider>
    </ContractProvider>
  )
}

