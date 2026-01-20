import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useFunctionManagement } from '../hooks/useFunctionManagement'
import type { FunctionTab, FunctionInputValues } from '../types/contract-ide.types'

interface FunctionExplorerContextValue {
  // State
  activeTab: FunctionTab
  expandedFunction: string | null
  searchQuery: string
  pinnedFunctions: Set<string>
  inputValues: FunctionInputValues
  lastInputValues: FunctionInputValues
  loadingFunction: string | null
  
  // Actions
  setActiveTab: (tab: FunctionTab) => void
  toggleFunction: (fnName: string) => void
  setSearchQuery: (query: string) => void
  togglePin: (fnName: string) => void
  updateInput: (fnName: string, paramName: string, value: string) => void
  setLoadingFunction: (fnName: string | null) => void
  
  // Handler with logging
  handleTogglePin: (fnName: string) => void
}

const FunctionExplorerContext = createContext<FunctionExplorerContextValue | undefined>(undefined)

interface FunctionExplorerProviderProps {
  children: ReactNode
  onLog: (type: 'info' | 'success' | 'error', message: string) => void
}

export function FunctionExplorerProvider({ children, onLog }: FunctionExplorerProviderProps) {
  const functionState = useFunctionManagement()

  const handleTogglePin = useCallback((fnName: string) => {
    const wasPinned = functionState.pinnedFunctions.has(fnName)
    functionState.togglePin(fnName)
    onLog('info', wasPinned ? `Unpinned ${fnName}` : `Pinned ${fnName}`)
  }, [functionState.pinnedFunctions, functionState.togglePin, onLog])

  const value: FunctionExplorerContextValue = {
    ...functionState,
    handleTogglePin,
  }

  return (
    <FunctionExplorerContext.Provider value={value}>
      {children}
    </FunctionExplorerContext.Provider>
  )
}

export function useFunctionExplorer() {
  const context = useContext(FunctionExplorerContext)
  if (context === undefined) {
    throw new Error('useFunctionExplorer must be used within FunctionExplorerProvider')
  }
  return context
}

