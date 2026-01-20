/**
 * Error handling utilities
 * Centralized error handling and user-friendly error messages
 */

import { APIError, APIErrorType } from '../types'

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Error codes for different error types
 */
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'ERR_NETWORK',
  TIMEOUT_ERROR: 'ERR_TIMEOUT',
  
  // API errors
  API_ERROR: 'ERR_API',
  RATE_LIMIT: 'ERR_RATE_LIMIT',
  UNAUTHORIZED: 'ERR_UNAUTHORIZED',
  
  // Validation errors
  INVALID_ADDRESS: 'ERR_INVALID_ADDRESS',
  INVALID_ABI: 'ERR_INVALID_ABI',
  INVALID_INPUT: 'ERR_INVALID_INPUT',
  
  // Storage errors
  STORAGE_FULL: 'ERR_STORAGE_FULL',
  STORAGE_ERROR: 'ERR_STORAGE',
  
  // Contract errors
  CONTRACT_NOT_FOUND: 'ERR_CONTRACT_NOT_FOUND',
  CONTRACT_NOT_VERIFIED: 'ERR_CONTRACT_NOT_VERIFIED',
  EXECUTION_REVERTED: 'ERR_EXECUTION_REVERTED',
  
  // Generic errors
  UNKNOWN: 'ERR_UNKNOWN',
} as const

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ERROR_CODES.API_ERROR]: 'API request failed. Please try again later.',
  [ERROR_CODES.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
  [ERROR_CODES.UNAUTHORIZED]: 'API key is invalid or missing.',
  [ERROR_CODES.INVALID_ADDRESS]: 'Invalid contract address format.',
  [ERROR_CODES.INVALID_ABI]: 'Invalid ABI format. Please check your ABI.',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input value. Please check your parameters.',
  [ERROR_CODES.STORAGE_FULL]: 'Storage limit reached. Please delete some items.',
  [ERROR_CODES.STORAGE_ERROR]: 'Failed to save data. Please try again.',
  [ERROR_CODES.CONTRACT_NOT_FOUND]: 'Contract not found on this network.',
  [ERROR_CODES.CONTRACT_NOT_VERIFIED]: 'Contract source code is not verified.',
  [ERROR_CODES.EXECUTION_REVERTED]: 'Transaction execution reverted.',
  [ERROR_CODES.UNKNOWN]: 'An unexpected error occurred.',
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError || error instanceof APIError) {
    return error.message
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]
    }
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR]
    }
    if (error.message.includes('rate limit')) {
      return ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT]
    }
    
    return error.message
  }

  return ERROR_MESSAGES[ERROR_CODES.UNKNOWN]
}

/**
 * Convert error to AppError
 */
export function toAppError(error: unknown, defaultCode = ERROR_CODES.UNKNOWN): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof APIError) {
    const code = apiErrorTypeToCode(error.type)
    return new AppError(
      error.message,
      code,
      ERROR_MESSAGES[code],
      error.originalError
    )
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      defaultCode,
      ERROR_MESSAGES[defaultCode],
      error
    )
  }

  return new AppError(
    String(error),
    defaultCode,
    ERROR_MESSAGES[defaultCode],
    error
  )
}

/**
 * Convert API error type to error code
 */
function apiErrorTypeToCode(type: APIErrorType): string {
  const mapping: Record<APIErrorType, string> = {
    [APIErrorType.NETWORK_ERROR]: ERROR_CODES.NETWORK_ERROR,
    [APIErrorType.TIMEOUT_ERROR]: ERROR_CODES.TIMEOUT_ERROR,
    [APIErrorType.API_ERROR]: ERROR_CODES.API_ERROR,
    [APIErrorType.RATE_LIMIT_ERROR]: ERROR_CODES.RATE_LIMIT,
    [APIErrorType.PARSE_ERROR]: ERROR_CODES.INVALID_ABI,
    [APIErrorType.VALIDATION_ERROR]: ERROR_CODES.INVALID_INPUT,
  }
  
  return mapping[type] || ERROR_CODES.UNKNOWN
}

/**
 * Log error with context
 */
export function logError(error: unknown, context?: string): void {
  const appError = toAppError(error)
  
  console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
    code: appError.code,
    message: appError.message,
    userMessage: appError.userMessage,
    originalError: appError.originalError,
  })
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof APIError) {
    return error.type === APIErrorType.NETWORK_ERROR || 
           error.type === APIErrorType.TIMEOUT_ERROR
  }
  
  if (error instanceof Error) {
    return error.message.includes('network') || 
           error.message.includes('fetch') ||
           error.message.includes('timeout')
  }
  
  return false
}

/**
 * Check if error is user-actionable
 */
export function isUserActionable(error: unknown): boolean {
  const appError = toAppError(error)
  
  const actionableCodes: string[] = [
    ERROR_CODES.INVALID_ADDRESS,
    ERROR_CODES.INVALID_ABI,
    ERROR_CODES.INVALID_INPUT,
    ERROR_CODES.STORAGE_FULL,
    ERROR_CODES.UNAUTHORIZED,
  ]
  
  return actionableCodes.includes(appError.code)
}




