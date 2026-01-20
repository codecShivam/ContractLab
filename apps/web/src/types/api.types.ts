/**
 * API-related type definitions
 * Standardized types for API requests and responses
 */

/**
 * Base API response structure
 */
export interface BaseAPIResponse<T = unknown> {
  status: '0' | '1'
  message: string
  result: T
}

/**
 * Etherscan API error response
 */
export interface EtherscanErrorResponse {
  status: '0'
  message: string
  result: string
}

/**
 * Contract ABI fetch result
 */
export interface ABIFetchResult {
  success: boolean
  abi?: string
  error?: string
  contractName?: string
  isProxy?: boolean
  implementationAddress?: string
}

/**
 * Block explorer configuration
 */
export interface BlockExplorer {
  name: string
  apiUrl: string
  requiresApiKey: boolean
}

/**
 * API request options
 */
export interface APIRequestOptions {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
  params?: Record<string, string | number>
}

/**
 * API error types
 */
export enum APIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Custom API error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public type: APIErrorType,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}




