import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { loadHistory, addHistoryEntry, updateHistoryEntry, deleteHistoryEntry, clearHistory, type HistoryEntry } from '../lib/history-storage'

interface HistoryContextValue {
  // State
  history: HistoryEntry[]
  
  // Actions
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => HistoryEntry
  updateEntry: (id: string, updates: Partial<HistoryEntry>) => void
  deleteEntry: (id: string) => void
  clearAll: () => void
  rerunEntry: (entry: HistoryEntry) => void
  
  // Handlers with logging
  handleDeleteHistory: (id: string) => void
  handleClearHistory: () => void
  handleRerunFromHistory: (entry: HistoryEntry) => void
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined)

interface HistoryProviderProps {
  children: ReactNode
  onLog: (type: 'info' | 'success' | 'error', message: string) => void
  onRerun: (entry: HistoryEntry) => void
}

export function HistoryProvider({ children, onLog, onRerun }: HistoryProviderProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry = addHistoryEntry(entry)
    setHistory(loadHistory())
    return newEntry
  }, [])

  const updateEntry = useCallback((id: string, updates: Partial<HistoryEntry>) => {
    updateHistoryEntry(id, updates)
    setHistory(loadHistory())
  }, [])

  const deleteEntry = useCallback((id: string) => {
    deleteHistoryEntry(id)
    setHistory(loadHistory())
  }, [])

  const clearAll = useCallback(() => {
    clearHistory()
    setHistory([])
  }, [])

  const handleDeleteHistory = useCallback((id: string) => {
    deleteEntry(id)
    onLog('info', 'History entry deleted')
  }, [deleteEntry, onLog])

  const handleClearHistory = useCallback(() => {
    if (confirm('Clear all history?')) {
      clearAll()
      onLog('info', 'History cleared')
    }
  }, [clearAll, onLog])

  const handleRerunFromHistory = useCallback((entry: HistoryEntry) => {
    onRerun(entry)
    onLog('info', `Loaded ${entry.functionName} from history`)
  }, [onRerun, onLog])

  const value: HistoryContextValue = {
    history,
    addEntry,
    updateEntry,
    deleteEntry,
    clearAll,
    rerunEntry: onRerun,
    handleDeleteHistory,
    handleClearHistory,
    handleRerunFromHistory,
  }

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error('useHistory must be used within HistoryProvider')
  }
  return context
}

