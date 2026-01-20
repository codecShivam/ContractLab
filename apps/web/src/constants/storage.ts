/**
 * Local storage keys and configuration
 * Centralized storage key management
 */

/**
 * Storage key prefix for namespacing
 */
const STORAGE_PREFIX = 'contractlab_' as const

/**
 * Storage keys for different data types
 */
export const STORAGE_KEYS = {
  // ABI related (legacy - for migration)
  SAVED_ABIS: `${STORAGE_PREFIX}saved_abis`,
  CURRENT_ABI_ID: `${STORAGE_PREFIX}current_abi_id`,
  
  // Collections
  COLLECTIONS: `${STORAGE_PREFIX}collections`,
  CURRENT_COLLECTION_ID: `${STORAGE_PREFIX}current_collection_id`,
  COLLECTIONS_MIGRATED: `${STORAGE_PREFIX}collections_migrated`,
  
  // History
  CALL_HISTORY: `${STORAGE_PREFIX}call_history`,
  
  // User preferences
  THEME: `${STORAGE_PREFIX}theme`,
  CONSOLE_OPEN: `${STORAGE_PREFIX}console_open`,
  LAST_CHAIN_ID: `${STORAGE_PREFIX}last_chain_id`,
  LAST_CONTRACT_ADDRESS: `${STORAGE_PREFIX}last_contract_address`,
  
  // UI state
  EXPANDED_FUNCTIONS: `${STORAGE_PREFIX}expanded_functions`,
  PINNED_FUNCTIONS: `${STORAGE_PREFIX}pinned_functions`,
} as const

/**
 * Storage limits
 */
export const STORAGE_LIMITS = {
  MAX_ABIS: 50,
  MAX_COLLECTIONS: 20,
  MAX_ABIS_PER_COLLECTION: 50,
  MAX_HISTORY_ENTRIES: 100,
  MAX_ABI_SIZE: 1024 * 1024, // 1MB
  MAX_INPUT_PRESETS: 20,
} as const

/**
 * Storage version for migration support
 */
export const STORAGE_VERSION = '1.0.0' as const




