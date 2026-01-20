/**
 * UI configuration constants
 * Centralized UI settings and magic numbers
 */

/**
 * Console configuration
 */
export const CONSOLE_CONFIG = {
  MAX_LOGS: 1000,
  AUTO_SCROLL_DELAY: 100,
  LOG_RETENTION_TIME: 24 * 60 * 60 * 1000, // 24 hours
} as const

/**
 * Editor configuration
 */
export const EDITOR_CONFIG = {
  TAB_SIZE: 2,
  FONT_SIZE: 14,
  LINE_HEIGHT: 20,
  MIN_LINES: 10,
  MAX_LINES: 50,
} as const

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 150,
} as const

/**
 * Toast notification durations
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 4000,
  LONG: 6000,
} as const

/**
 * Contract address display format
 */
export const ADDRESS_FORMAT = {
  SHORT_PREFIX_LENGTH: 6,
  SHORT_SUFFIX_LENGTH: 4,
  SEPARATOR: '...',
} as const

/**
 * Function types for UI display
 */
export const FUNCTION_TYPES = {
  READ: 'read',
  WRITE: 'write',
  PAYABLE: 'payable',
  EVENT: 'event',
  FALLBACK: 'fallback',
  RECEIVE: 'receive',
} as const

/**
 * Console log types
 */
export const CONSOLE_LOG_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
} as const

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  CLEAR_CONSOLE: 'k',
  NEW_ABI: 'n',
  SAVE: 's',
  BEAUTIFY: 'b',
  SEARCH: 'f',
} as const




