/**
 * History-related type definitions
 * Types for function call history tracking
 */

/**
 * Function call history entry
 */
export interface HistoryEntry {
  id: string
  timestamp: number
  functionName: string
  inputs: Record<string, string>
  result?: unknown
  error?: string
  chainId: number
  contractAddress: string
  transactionHash?: string
  gasUsed?: string
  blockNumber?: number
  status: CallStatusValue
}

/**
 * Call status constants
 */
export const CallStatus = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
  REVERTED: 'reverted',
} as const

/**
 * Call status type union
 */
export type CallStatusValue = typeof CallStatus[keyof typeof CallStatus]

/**
 * History filter options
 */
export interface HistoryFilter {
  functionName?: string
  status?: CallStatusValue
  chainId?: number
  contractAddress?: string
  dateFrom?: Date
  dateTo?: Date
}

/**
 * History sort options
 */
export interface HistorySort {
  field: keyof HistoryEntry
  order: 'asc' | 'desc'
}

/**
 * History pagination
 */
export interface HistoryPagination {
  page: number
  pageSize: number
  total: number
}

/**
 * History export format
 */
export enum HistoryExportFormat {
  JSON = 'json',
  CSV = 'csv',
  TXT = 'txt',
}

