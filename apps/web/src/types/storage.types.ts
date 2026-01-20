/**
 * Storage-related type definitions
 * Types for localStorage and data persistence
 */

/**
 * Saved ABI with metadata
 */
export interface SavedABI {
  id: string
  name: string
  content: string
  timestamp: number
  metadata?: ABIMetadata
}

/**
 * ABI metadata for enhanced information
 */
export interface ABIMetadata {
  contractAddress?: string
  chainId?: number
  source?: ABISource
  verified?: boolean
  contractName?: string
  compiler?: string
  optimizationUsed?: boolean
}

/**
 * Source of the ABI
 */
export enum ABISource {
  UPLOADED = 'uploaded',
  FETCHED = 'fetched',
  PASTED = 'pasted',
  EXAMPLE = 'example',
}

/**
 * Storage wrapper with versioning
 */
export interface StorageData<T> {
  version: string
  data: T
  timestamp: number
}

/**
 * Storage migration function type
 */
export type StorageMigration = (oldData: unknown) => unknown

/**
 * Storage options
 */
export interface StorageOptions {
  encrypt?: boolean
  compress?: boolean
  ttl?: number // Time to live in milliseconds
}




