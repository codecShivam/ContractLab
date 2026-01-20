import { useState, useCallback, useRef, useEffect } from 'react'
import type { ConsoleLog } from '../types/contract-ide.types'

export function useConsole() {
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [consoleOpen, setConsoleOpen] = useState(true)
  const consoleRef = useRef<HTMLDivElement>(null)

  // Add console log
  const addLog = useCallback((type: ConsoleLog['type'], message: string) => {
    const log: ConsoleLog = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
    }
    setConsoleLogs(prev => [...prev, log])
  }, [])

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [consoleLogs])

  // Clear console
  const clearConsole = useCallback(() => {
    setConsoleLogs([])
  }, [])

  // Toggle console
  const toggleConsole = useCallback(() => {
    setConsoleOpen(prev => !prev)
  }, [])

  // Copy console log
  const copyLog = useCallback((message: string) => {
    navigator.clipboard.writeText(message)
    addLog('info', 'Copied to clipboard')
  }, [addLog])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K to clear console
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        clearConsole()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearConsole])

  return {
    consoleLogs,
    consoleOpen,
    consoleRef,
    addLog,
    clearConsole,
    toggleConsole,
    copyLog,
  }
}

