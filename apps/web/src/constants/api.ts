/**
 * API configuration constants
 * Centralized API endpoints and configuration
 */

/**
 * Etherscan API v2 unified endpoint
 */
export const ETHERSCAN_API_BASE_URL = 'https://api.etherscan.io/v2/api' as const

/**
 * API request timeout in milliseconds
 */
export const API_TIMEOUT = 30000 as const

/**
 * API retry configuration
 */
export const API_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
} as const

/**
 * Contract module actions
 */
export const CONTRACT_ACTIONS = {
  GET_ABI: 'getabi',
  GET_SOURCE_CODE: 'getsourcecode',
  VERIFY_CONTRACT: 'verifysourcecode',
} as const

/**
 * API response status codes
 */
export const API_STATUS = {
  SUCCESS: '1',
  ERROR: '0',
} as const

/**
 * Default API parameters
 */
export const DEFAULT_API_PARAMS = {
  module: 'contract',
} as const




