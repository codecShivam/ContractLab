import { createContext, useContext, type ReactNode } from 'react'
import { useConsole } from '../hooks/useConsole'
import type { ConsoleLog } from '../types/contract-ide.types'

interface ConsoleContextValue {
  // State
  consoleLogs: ConsoleLog[]
  consoleOpen: boolean
  consoleRef: React.RefObject<HTMLDivElement | null>
  
  // Actions
  addLog: (type: ConsoleLog['type'], message: string) => void
  clearConsole: () => void
  toggleConsole: () => void
}

const ConsoleContext = createContext<ConsoleContextValue | undefined>(undefined)

interface ConsoleProviderProps {
  children: ReactNode
}

export function ConsoleProvider({ children }: ConsoleProviderProps) {
  const consoleState = useConsole()

  return (
    <ConsoleContext.Provider value={consoleState}>
      {children}
    </ConsoleContext.Provider>
  )
}

export function useConsoleContext() {
  const context = useContext(ConsoleContext)
  if (context === undefined) {
    throw new Error('useConsoleContext must be used within ConsoleProvider')
  }
  return context
}

