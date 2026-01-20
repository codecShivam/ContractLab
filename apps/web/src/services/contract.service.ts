/**
 * Contract Service
 * High-level service layer for contract operations
 */

import { fetchContractABI } from '../lib/abi-fetcher'
import { isValidContractAddress } from '../utils/validation'
import { formatAddress } from '../utils/format'
import { logError, toAppError } from '../utils/error-handler'
import type { ABIFetchResult } from '../types/api.types'
import type { ContractMetadata } from '../types/contract.types'

/**
 * Contract service class for managing contract operations
 */
export class ContractService {
  /**
   * Fetch contract ABI with enhanced error handling
   */
  static async fetchABI(
    address: string,
    chainId: number
  ): Promise<ABIFetchResult> {
    try {
      if (!isValidContractAddress(address)) {
        return {
          success: false,
          error: 'Invalid contract address format',
        }
      }

      const result = await fetchContractABI(address, chainId)
      return result
    } catch (error) {
      const appError = toAppError(error)
      logError(appError, 'ContractService.fetchABI')
      
      return {
        success: false,
        error: appError.userMessage || appError.message,
      }
    }
  }

  /**
   * Get contract display name
   */
  static getDisplayName(
    address: string,
    contractName?: string
  ): string {
    if (contractName && contractName !== 'Contract') {
      return contractName
    }
    return formatAddress(address)
  }

  /**
   * Create contract metadata object
   */
  static createMetadata(
    address: string,
    chainId: number,
    additionalData?: Partial<ContractMetadata>
  ): ContractMetadata {
    return {
      address,
      chainId,
      verified: false,
      proxy: false,
      ...additionalData,
    }
  }

  /**
   * Validate contract deployment
   */
  static async isDeployed(
    address: string,
    _chainId: number
  ): Promise<boolean> {
    // This would need actual blockchain interaction
    // For now, just validate address format
    return isValidContractAddress(address)
  }
}

/**
 * Legacy export for backward compatibility
 */
export const contractService = ContractService




