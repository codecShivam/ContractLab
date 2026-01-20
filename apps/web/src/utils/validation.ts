/**
 * Validation utilities
 * Reusable validation functions for inputs and data
 */

import { isAddress } from 'viem'
import type { Abi } from 'viem'

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return isAddress(address)
}

/**
 * Validate contract address format
 */
export function isValidContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Validate chain ID
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0
}

/**
 * Validate ABI JSON string
 */
export function isValidABIString(abiString: string): {
  valid: boolean
  error?: string
  abi?: Abi
} {
  if (!abiString || abiString.trim() === '') {
    return { valid: false, error: 'ABI string is empty' }
  }

  try {
    const parsed = JSON.parse(abiString)
    
    if (!Array.isArray(parsed)) {
      return { valid: false, error: 'ABI must be an array' }
    }

    // Basic ABI structure validation
    const isValidABI = parsed.every((item) => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        typeof item.type === 'string'
      )
    })

    if (!isValidABI) {
      return { valid: false, error: 'Invalid ABI structure' }
    }

    return { valid: true, abi: parsed as Abi }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON format',
    }
  }
}

/**
 * Validate function arguments
 */
export function validateFunctionArgs(
  args: unknown[],
  expectedLength: number
): { valid: boolean; error?: string } {
  if (args.length !== expectedLength) {
    return {
      valid: false,
      error: `Expected ${expectedLength} arguments, got ${args.length}`,
    }
  }

  return { valid: true }
}

/**
 * Validate hex string
 */
export function isValidHexString(value: string): boolean {
  return /^0x[a-fA-F0-9]*$/.test(value)
}

/**
 * Validate numeric string
 */
export function isValidNumericString(value: string): boolean {
  return /^\d+(\.\d+)?$/.test(value)
}

/**
 * Validate BigInt string
 */
export function isValidBigIntString(value: string): boolean {
  try {
    BigInt(value)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize contract address
 */
export function sanitizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

/**
 * Validate transaction hash
 */
export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize
}

/**
 * Validate file type
 */
export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}




