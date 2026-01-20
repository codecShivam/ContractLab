/**
 * Console-related type definitions
 * Types for console logging and output
 */

/**
 * Console log entry
 */
export interface ConsoleLog {
  id: string
  type: LogTypeValue
  message: string
  timestamp: number
  data?: unknown
  stackTrace?: string
}

/**
 * Log severity constants
 */
export const LogType = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  DEBUG: 'debug',
  RESULT: 'result',
} as const

/**
 * Log type union
 */
export type LogTypeValue = typeof LogType[keyof typeof LogType]

/**
 * Console filter options
 */
export interface ConsoleFilter {
  types?: LogTypeValue[]
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

/**
 * Console configuration
 */
export interface ConsoleConfig {
  maxLogs: number
  autoScroll: boolean
  showTimestamp: boolean
  groupSimilar: boolean
  collapseGroups: boolean
}

/**
 * Log formatter function type
 */
export type LogFormatter = (log: ConsoleLog) => string

/**
 * Log handler function type
 */
export type LogHandler = (log: ConsoleLog) => void

