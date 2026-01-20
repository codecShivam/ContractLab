/**
 * Persistent History Storage for function calls
 * Manages storage and retrieval of contract function call history
 */

import { STORAGE_KEYS, STORAGE_LIMITS } from '../constants'
import { storage } from '../utils/storage'
import { logError } from '../utils/error-handler'
import type { HistoryEntry, HistoryFilter } from '../types/history.types'

// Re-export types
export type { HistoryEntry } from '../types/history.types'

/**
 * Load history from localStorage
 * @returns Array of history entries, sorted by timestamp (newest first)
 */
export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  
  try {
    const history = storage.get<HistoryEntry[]>(STORAGE_KEYS.CALL_HISTORY, [])
    return Array.isArray(history) ? history : []
  } catch (error) {
    logError(error, 'loadHistory')
    return []
  }
}

/**
 * Save history to localStorage
 * Automatically trims to max entries limit
 * @param history - Array of history entries to save
 */
export function saveHistory(history: HistoryEntry[]): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // Keep only the most recent entries
    const trimmed = history.slice(0, STORAGE_LIMITS.MAX_HISTORY_ENTRIES)
    return storage.set(STORAGE_KEYS.CALL_HISTORY, trimmed)
  } catch (error) {
    logError(error, 'saveHistory')
    return false
  }
}

/**
 * Add a new entry to history
 * @param entry - History entry data (without id and timestamp)
 * @returns The created history entry with id and timestamp
 */
export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): HistoryEntry {
  const newEntry: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    timestamp: Date.now(),
  }
  
  const history = loadHistory()
  history.unshift(newEntry) // Add to beginning (newest first)
  
  const saved = saveHistory(history)
  if (!saved) {
    console.warn('Failed to save history entry to storage')
  }
  
  return newEntry
}

/**
 * Update an existing history entry (e.g., add result after execution)
 * @param id - History entry ID to update
 * @param updates - Partial history entry data to merge
 * @returns true if entry was found and updated, false otherwise
 */
export function updateHistoryEntry(id: string, updates: Partial<HistoryEntry>): boolean {
  const history = loadHistory()
  const index = history.findIndex(entry => entry.id === id)
  
  if (index === -1) {
    console.warn(`History entry with id ${id} not found`)
    return false
  }
  
  history[index] = { ...history[index], ...updates }
  return saveHistory(history)
}

/**
 * Delete a history entry
 * @param id - History entry ID to delete
 * @returns true if entry was deleted, false otherwise
 */
export function deleteHistoryEntry(id: string): boolean {
  const history = loadHistory()
  const filtered = history.filter(entry => entry.id !== id)
  
  if (filtered.length === history.length) {
    console.warn(`History entry with id ${id} not found`)
    return false
  }
  
  return saveHistory(filtered)
}

/**
 * Clear all history
 * @returns true if history was cleared successfully
 */
export function clearHistory(): boolean {
  if (typeof window === 'undefined') return false
  return storage.remove(STORAGE_KEYS.CALL_HISTORY)
}

/**
 * Get history filtered by contract address
 * @param contractAddress - Contract address to filter by (case-insensitive)
 * @returns Filtered history entries
 */
export function getHistoryByContract(contractAddress: string): HistoryEntry[] {
  const history = loadHistory()
  const normalizedAddress = contractAddress.toLowerCase()
  return history.filter(entry => 
    entry.contractAddress.toLowerCase() === normalizedAddress
  )
}

/**
 * Get history filtered by function name
 * @param functionName - Function name to filter by (exact match)
 * @returns Filtered history entries
 */
export function getHistoryByFunction(functionName: string): HistoryEntry[] {
  const history = loadHistory()
  return history.filter(entry => entry.functionName === functionName)
}

/**
 * Get history with advanced filtering
 * @param filter - Filter options
 * @returns Filtered history entries
 */
export function getFilteredHistory(filter: HistoryFilter): HistoryEntry[] {
  let history = loadHistory()

  if (filter.functionName) {
    history = history.filter(entry => entry.functionName === filter.functionName)
  }

  if (filter.contractAddress) {
    const normalizedAddress = filter.contractAddress.toLowerCase()
    history = history.filter(entry => 
      entry.contractAddress.toLowerCase() === normalizedAddress
    )
  }

  if (filter.chainId !== undefined) {
    history = history.filter(entry => entry.chainId === filter.chainId)
  }

  if (filter.status) {
    history = history.filter(entry => entry.status === filter.status)
  }

  if (filter.dateFrom) {
    const fromTime = filter.dateFrom.getTime()
    history = history.filter(entry => entry.timestamp >= fromTime)
  }

  if (filter.dateTo) {
    const toTime = filter.dateTo.getTime()
    history = history.filter(entry => entry.timestamp <= toTime)
  }

  return history
}

/**
 * Get history statistics
 * @returns Statistics about stored history
 */
export function getHistoryStats() {
  const history = loadHistory()
  
  const totalCalls = history.length
  const successfulCalls = history.filter(entry => entry.status === 'success').length
  const failedCalls = history.filter(entry => entry.status === 'failed').length
  
  const uniqueContracts = new Set(
    history.map(entry => entry.contractAddress.toLowerCase())
  ).size
  
  const uniqueFunctions = new Set(
    history.map(entry => entry.functionName)
  ).size

  return {
    totalCalls,
    successfulCalls,
    failedCalls,
    uniqueContracts,
    uniqueFunctions,
    oldestCall: history[history.length - 1]?.timestamp,
    newestCall: history[0]?.timestamp,
  }
}

