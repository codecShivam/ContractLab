/**
 * Type definitions for Contract IDE
 * Main types used across the IDE interface
 */

// Re-export from modular type files for backward compatibility
export type { SavedABI, ABIMetadata, ABISource } from './storage.types'
export type { ConsoleLog, LogType, ConsoleFilter, ConsoleConfig } from './console.types'
export type { 
  HistoryEntry, 
  CallStatus, 
  HistoryFilter, 
  HistorySort, 
  HistoryPagination 
} from './history.types'
export type {
  EnhancedAbiFunction,
  FunctionInputValues,
  LoadingState,
  ContractMetadata,
  FunctionCallParams,
  FunctionCallResult,
  GasEstimate,
  FunctionCategory
} from './contract.types'

/**
 * Function tab types for UI navigation
 */
export type FunctionTab = 'read' | 'write' | 'payable'

/**
 * ABI Manager State
 */
export interface ABIManagerState {
  abi: string
  savedABIs: SavedABI[]
  currentABIId: string | null
}

/**
 * Function Explorer State
 */
export interface FunctionExplorerState {
  activeTab: FunctionTab
  expandedFunction: string | null
  searchQuery: string
  pinnedFunctions: Set<string>
  loadingFunction: string | null
}

/**
 * Console State
 */
export interface ConsoleState {
  logs: ConsoleLog[]
  isOpen: boolean
}

/**
 * Contract IDE State (aggregate)
 */
export interface ContractIDEState {
  abi: ABIManagerState
  functionExplorer: FunctionExplorerState
  console: ConsoleState
  contractAddress: string
  chainId: number
}

// Import modular types
import type { SavedABI } from './storage.types'
import type { ConsoleLog } from './console.types'

