/**
 * ABI Fetcher - Fetches verified contract ABIs from Etherscan v2 API
 * Reference: https://docs.etherscan.io/v2-migration
 */

import { 
  ETHERSCAN_API_BASE_URL, 
  CONTRACT_ACTIONS, 
  API_STATUS,
  API_TIMEOUT 
} from '../constants'
import { getChainById, isSupportedChain } from '../constants/chains'
import { isValidContractAddress, isValidABIString } from '../utils/validation'
import { APIError, APIErrorType } from '../types/api.types'
import type { ABIFetchResult } from '../types/api.types'

export type { ABIFetchResult }

/**
 * Fetch ABI for a contract address from Etherscan block explorer
 * @param address - Contract address to fetch ABI for
 * @param chainId - Chain ID where the contract is deployed
 * @returns Promise with fetch result including ABI or error
 */
export async function fetchContractABI(
  address: string,
  chainId: number
): Promise<ABIFetchResult> {
  // Validate contract address
  if (!isValidContractAddress(address)) {
    return { 
      success: false, 
      error: 'Invalid contract address format. Expected 0x followed by 40 hexadecimal characters.' 
    }
  }

  // Validate chain support
  if (!isSupportedChain(chainId)) {
    const chain = getChainById(chainId)
    return {
      success: false,
      error: chain 
        ? `Chain ${chain.name} is not supported yet.`
        : `Unsupported chain ID: ${chainId}`,
    }
  }

  try {
    const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || ''

    // Build URL with unified v2 API endpoint
    const params = new URLSearchParams({
      ...(apiKey && { apikey: apiKey }),
      chainid: String(chainId),
      module: 'contract',
      action: CONTRACT_ACTIONS.GET_ABI,
      address: address,
    })

    const url = `${ETHERSCAN_API_BASE_URL}?${params.toString()}`

    // Fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    const text = await response.text()

    // Parse response
    let json
    try {
      json = JSON.parse(text)
    } catch (parseError) {
      throw new APIError(
        'Invalid JSON response from API',
        APIErrorType.PARSE_ERROR,
        parseError
      )
    }

    // Check API response status
    if (json.status !== API_STATUS.SUCCESS || !json.result) {
      const errorMessage = json.message || json.result || 'Contract not verified on block explorer'
      throw new APIError(
        errorMessage,
        APIErrorType.API_ERROR
      )
    }

    // Validate and parse ABI
    const abiValidation = isValidABIString(json.result)
    if (!abiValidation.valid) {
      throw new APIError(
        abiValidation.error || 'Invalid ABI format',
        APIErrorType.PARSE_ERROR
      )
    }

    return {
      success: true,
      abi: JSON.stringify(abiValidation.abi, null, 2),
      contractName: 'Contract',
      isProxy: false,
      implementationAddress: undefined,
    }

  } catch (error) {
    // Handle specific error types
    if (error instanceof APIError) {
      return { success: false, error: error.message }
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { 
          success: false, 
          error: 'Request timed out. Please try again.' 
        }
      }

      if (error.message.includes('fetch')) {
        return { 
          success: false, 
          error: 'Network error. Please check your connection.' 
        }
      }

      return { success: false, error: error.message }
    }

    return { 
      success: false, 
      error: 'An unexpected error occurred while fetching ABI' 
    }
  }
}
  

/**
 * Validate and format ABI string
 * @deprecated Use isValidABIString from utils/validation instead
 */
export function validateABI(abiString: string): { valid: boolean; formatted?: string; error?: string } {
  const result = isValidABIString(abiString)
  
  if (!result.valid) {
    return { valid: false, error: result.error }
  }

  return { 
    valid: true, 
    formatted: JSON.stringify(result.abi, null, 2) 
  }
}

