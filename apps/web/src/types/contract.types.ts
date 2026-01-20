/**
 * Contract-related type definitions
 * Extended types for contract interactions
 */

import type { AbiFunction } from 'viem'

/**
 * Enhanced function type with additional metadata
 */
export interface EnhancedAbiFunction extends AbiFunction {
  isPayable?: boolean
  isView?: boolean
  isPure?: boolean
  signature?: string
}

/**
 * Function input value map
 */
export type FunctionInputValues = Record<string, Record<string, string>>

/**
 * Function loading state
 */
export type LoadingState = Record<string, boolean>

/**
 * Contract metadata
 */
export interface ContractMetadata {
  address: string
  chainId: number
  name?: string
  symbol?: string
  decimals?: number
  verified?: boolean
  proxy?: boolean
  implementationAddress?: string
}

/**
 * Function call parameters
 */
export interface FunctionCallParams {
  functionName: string
  args: unknown[]
  value?: bigint
  gas?: bigint
}

/**
 * Function call result
 */
export interface FunctionCallResult {
  success: boolean
  data?: unknown
  error?: string
  transactionHash?: string
  gasUsed?: bigint
  blockNumber?: bigint
}

/**
 * Gas estimation result
 */
export interface GasEstimate {
  estimated: bigint
  withBuffer: bigint
  bufferPercentage: number
  estimatedCostEth?: number
}

/**
 * Contract verification status
 */
export enum VerificationStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  PARTIALLY_VERIFIED = 'partially_verified',
  UNKNOWN = 'unknown',
}

/**
 * Function category for organization
 */
export enum FunctionCategory {
  READ = 'read',
  WRITE = 'write',
  PAYABLE = 'payable',
  EVENT = 'event',
}
