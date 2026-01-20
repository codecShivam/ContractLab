/**
 * Storage utilities
 * Safe localStorage wrapper with error handling and versioning
 */

import { STORAGE_VERSION } from '../constants'
import type { StorageData, StorageOptions } from '../types'

/**
 * Safe localStorage wrapper with error handling
 */
class StorageManager {
  /**
   * Get item from localStorage with type safety
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return defaultValue ?? null

      const parsed = JSON.parse(item) as StorageData<T>
      
      // Check version compatibility
      if (parsed.version !== STORAGE_VERSION) {
        console.warn(`Storage version mismatch for key: ${key}`)
        // Could trigger migration here
      }

      return parsed.data
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return defaultValue ?? null
    }
  }

  /**
   * Set item in localStorage with versioning
   */
  set<T>(key: string, value: T, _options?: StorageOptions): boolean {
    try {
      const data: StorageData<T> = {
        version: STORAGE_VERSION,
        data: value,
        timestamp: Date.now(),
      }

      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error)
      
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded')
        // Could trigger cleanup here
      }
      
      return false
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
      return false
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }

  /**
   * Get all keys with a specific prefix
   */
  getKeysByPrefix(prefix: string): string[] {
    try {
      return Object.keys(localStorage).filter(key => key.startsWith(prefix))
    } catch (error) {
      console.error('Error getting keys from localStorage:', error)
      return []
    }
  }

  /**
   * Get storage usage information
   */
  getUsageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length
        }
      }

      // Approximate localStorage limit (usually 5-10MB)
      const available = 5 * 1024 * 1024 // 5MB
      const percentage = (used / available) * 100

      return { used, available, percentage }
    } catch (error) {
      console.error('Error calculating storage usage:', error)
      return { used: 0, available: 0, percentage: 0 }
    }
  }

  /**
   * Export all data
   */
  exportAll(): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          data[key] = JSON.parse(localStorage[key])
        }
      }
    } catch (error) {
      console.error('Error exporting localStorage:', error)
    }

    return data
  }

  /**
   * Import data (with confirmation)
   */
  importAll(data: Record<string, unknown>, overwrite = false): boolean {
    try {
      for (const [key, value] of Object.entries(data)) {
        if (!overwrite && this.has(key)) {
          continue
        }
        localStorage.setItem(key, JSON.stringify(value))
      }
      return true
    } catch (error) {
      console.error('Error importing to localStorage:', error)
      return false
    }
  }
}

/**
 * Singleton storage manager instance
 */
export const storage = new StorageManager()

/**
 * Legacy compatibility functions
 */
export function getFromStorage<T>(key: string, defaultValue?: T): T | null {
  return storage.get(key, defaultValue)
}

export function saveToStorage<T>(key: string, value: T): boolean {
  return storage.set(key, value)
}




