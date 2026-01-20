# API Documentation

## Overview

ContractLab provides a comprehensive API for interacting with smart contracts. This document outlines all available functions, services, and utilities.

## Table of Contents

- [Contract Service](#contract-service)
- [Storage Service](#storage-service)
- [ABI Fetcher](#abi-fetcher)
- [History Storage](#history-storage)
- [Utilities](#utilities)
- [Hooks](#hooks)

---

## Contract Service

High-level service for contract operations.

### `ContractService.fetchABI()`

Fetches contract ABI from block explorer.

```typescript
static async fetchABI(
  address: string,
  chainId: number
): Promise<ABIFetchResult>
```

**Parameters:**
- `address` - Contract address (must be valid Ethereum address)
- `chainId` - Chain ID where contract is deployed

**Returns:**
```typescript
interface ABIFetchResult {
  success: boolean
  abi?: string
  error?: string
  contractName?: string
  isProxy?: boolean
  implementationAddress?: string
}
```

**Example:**
```typescript
import { ContractService } from './services'

const result = await ContractService.fetchABI(
  '0x1234567890123456789012345678901234567890',
  1 // Ethereum Mainnet
)

if (result.success) {
  console.log('ABI:', result.abi)
} else {
  console.error('Error:', result.error)
}
```

### `ContractService.getDisplayName()`

Gets a display-friendly name for a contract.

```typescript
static getDisplayName(
  address: string,
  contractName?: string
): string
```

**Example:**
```typescript
const name = ContractService.getDisplayName(
  '0x1234567890123456789012345678901234567890',
  'MyToken'
)
// Returns: 'MyToken' or '0x1234...7890' if name not provided
```

---

## Storage Service

High-level service for data persistence.

### `StorageService.saveABIs()`

Saves ABIs to localStorage with validation.

```typescript
static saveABIs(abis: SavedABI[]): boolean
```

**Example:**
```typescript
import { StorageService } from './services'

const saved = StorageService.saveABIs([
  {
    id: '1',
    name: 'ERC20',
    content: '[...]',
    timestamp: Date.now()
  }
])

if (saved) {
  console.log('ABIs saved successfully')
}
```

### `StorageService.loadABIs()`

Loads saved ABIs from localStorage.

```typescript
static loadABIs(): SavedABI[]
```

### `StorageService.exportAllData()`

Exports all application data for backup.

```typescript
static exportAllData(): {
  abis: SavedABI[]
  currentABIId: string | null
  version: string
  exportedAt: string
}
```

**Example:**
```typescript
const backup = StorageService.exportAllData()
const json = JSON.stringify(backup, null, 2)
// Save to file or send to server
```

---

## ABI Fetcher

Low-level functions for fetching contract ABIs.

### `fetchContractABI()`

Fetches contract ABI from Etherscan API.

```typescript
async function fetchContractABI(
  address: string,
  chainId: number
): Promise<ABIFetchResult>
```

**Supported Chains:**
- Ethereum (1), Sepolia (11155111), Holesky (17000)
- Arbitrum One (42161), Arbitrum Nova (42170)
- Optimism (10), Base (8453)
- Polygon (137), BNB Chain (56)
- And 60+ more chains

**Error Handling:**
```typescript
const result = await fetchContractABI(address, chainId)

if (!result.success) {
  // Handle different error types
  switch (result.error) {
    case 'Invalid contract address format':
      // Show address format help
      break
    case 'Contract not verified on block explorer':
      // Suggest manual ABI entry
      break
    // ... more cases
  }
}
```

---

## History Storage

Functions for managing call history.

### `loadHistory()`

```typescript
function loadHistory(): HistoryEntry[]
```

### `addHistoryEntry()`

```typescript
function addHistoryEntry(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'>
): HistoryEntry
```

**Example:**
```typescript
import { addHistoryEntry } from './lib'

const entry = addHistoryEntry({
  functionName: 'transfer',
  contractAddress: '0x...',
  chainId: 1,
  inputs: { to: '0x...', amount: '100' },
  status: 'success'
})
```

### `getFilteredHistory()`

```typescript
function getFilteredHistory(filter: HistoryFilter): HistoryEntry[]
```

**Example:**
```typescript
const history = getFilteredHistory({
  functionName: 'transfer',
  status: 'success',
  chainId: 1,
  dateFrom: new Date('2024-01-01')
})
```

### `getHistoryStats()`

```typescript
function getHistoryStats(): {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  uniqueContracts: number
  uniqueFunctions: number
  oldestCall?: number
  newestCall?: number
}
```

---

## Utilities

### Validation

#### `isValidAddress()`

```typescript
function isValidAddress(address: string): boolean
```

#### `isValidContractAddress()`

```typescript
function isValidContractAddress(address: string): boolean
```

#### `isValidABIString()`

```typescript
function isValidABIString(abiString: string): {
  valid: boolean
  error?: string
  abi?: Abi
}
```

**Example:**
```typescript
import { isValidABIString } from './utils'

const result = isValidABIString(userInput)
if (result.valid) {
  // Use result.abi
} else {
  console.error(result.error)
}
```

### Formatting

#### `formatAddress()`

```typescript
function formatAddress(
  address: string,
  prefixLength?: number,
  suffixLength?: number
): string
```

**Example:**
```typescript
formatAddress('0x1234567890123456789012345678901234567890')
// Returns: '0x1234...7890'
```

#### `formatBigInt()`

```typescript
function formatBigInt(value: bigint, decimals?: number): string
```

#### `formatTimestamp()`

```typescript
function formatTimestamp(timestamp: number): string
```

#### `formatRelativeTime()`

```typescript
function formatRelativeTime(timestamp: number): string
```

**Example:**
```typescript
formatRelativeTime(Date.now() - 60000)
// Returns: '1m ago'
```

### Error Handling

#### `getErrorMessage()`

```typescript
function getErrorMessage(error: unknown): string
```

#### `toAppError()`

```typescript
function toAppError(
  error: unknown,
  defaultCode?: string
): AppError
```

#### `logError()`

```typescript
function logError(error: unknown, context?: string): void
```

---

## Hooks

### useABIStorage

Manages ABI tabs and content.

```typescript
function useABIStorage(): {
  abi: string
  savedABIs: SavedABI[]
  currentABIId: string | null
  updateCurrentABI: (newABI: string) => void
  switchABI: (id: string) => void
  renameABI: (id: string, newName: string) => void
  addNewABI: () => void
  addNewABIWithData: (name: string, content: string) => string
  deleteABI: (id: string) => void
  reorderABIs: (newOrder: SavedABI[]) => void
  uploadABI: (file: File) => Promise<void>
}
```

**Example:**
```typescript
function MyComponent() {
  const { savedABIs, addNewABI } = useABIStorage()
  
  return (
    <button onClick={addNewABI}>
      New ABI ({savedABIs.length} saved)
    </button>
  )
}
```

### useConsole

Manages console logs.

```typescript
function useConsole(): {
  logs: ConsoleLog[]
  addLog: (type: LogType, message: string) => void
  clearLogs: () => void
}
```

### useContractIDE

Main hook for Contract IDE functionality.

```typescript
function useContractIDE(): {
  // ABI operations
  handleFetchABI: () => Promise<void>
  
  // Function operations
  handleCall: (fn: AbiFunction) => void
  
  // History operations
  handleDeleteHistory: (id: string) => void
  handleClearHistory: () => void
  handleRerunFromHistory: (entry: HistoryEntry) => void
  
  // Gas estimation
  handleEstimateGas: (fn: AbiFunction) => Promise<void>
  
  // State
  fetchingABI: boolean
  parsedFunctions: AbiFunction[]
  gasEstimates: Record<string, GasEstimate>
}
```

**Example:**
```typescript
function ContractIDE() {
  const { handleFetchABI, fetchingABI } = useContractIDE()
  
  return (
    <button 
      onClick={handleFetchABI}
      disabled={fetchingABI}
    >
      {fetchingABI ? 'Fetching...' : 'Fetch ABI'}
    </button>
  )
}
```

---

## Constants

### API Constants

```typescript
import { 
  ETHERSCAN_API_BASE_URL,
  CONTRACT_ACTIONS,
  API_TIMEOUT,
  API_STATUS
} from './constants'
```

### Chain Constants

```typescript
import { 
  SUPPORTED_CHAINS,
  getChainById,
  isSupportedChain,
  getAllChainIds
} from './constants'
```

### Storage Constants

```typescript
import { 
  STORAGE_KEYS,
  STORAGE_LIMITS,
  STORAGE_VERSION
} from './constants'
```

### UI Constants

```typescript
import {
  CONSOLE_CONFIG,
  EDITOR_CONFIG,
  ANIMATION,
  DEBOUNCE,
  TOAST_DURATION,
  ADDRESS_FORMAT,
  KEYBOARD_SHORTCUTS
} from './constants'
```

---

## Types

All TypeScript types are exported from `./types`:

```typescript
import type {
  // Storage types
  SavedABI,
  ABIMetadata,
  ABISource,
  
  // Contract types
  EnhancedAbiFunction,
  ContractMetadata,
  FunctionCallParams,
  FunctionCallResult,
  GasEstimate,
  
  // History types
  HistoryEntry,
  CallStatus,
  HistoryFilter,
  
  // Console types
  ConsoleLog,
  LogType,
  ConsoleConfig,
  
  // API types
  ABIFetchResult,
  APIError,
  APIErrorType
} from './types'
```

---

## Error Codes

```typescript
ERROR_CODES = {
  // Network
  NETWORK_ERROR: 'ERR_NETWORK',
  TIMEOUT_ERROR: 'ERR_TIMEOUT',
  
  // API
  API_ERROR: 'ERR_API',
  RATE_LIMIT: 'ERR_RATE_LIMIT',
  UNAUTHORIZED: 'ERR_UNAUTHORIZED',
  
  // Validation
  INVALID_ADDRESS: 'ERR_INVALID_ADDRESS',
  INVALID_ABI: 'ERR_INVALID_ABI',
  INVALID_INPUT: 'ERR_INVALID_INPUT',
  
  // Storage
  STORAGE_FULL: 'ERR_STORAGE_FULL',
  STORAGE_ERROR: 'ERR_STORAGE',
  
  // Contract
  CONTRACT_NOT_FOUND: 'ERR_CONTRACT_NOT_FOUND',
  CONTRACT_NOT_VERIFIED: 'ERR_CONTRACT_NOT_VERIFIED',
  EXECUTION_REVERTED: 'ERR_EXECUTION_REVERTED',
  
  // Generic
  UNKNOWN: 'ERR_UNKNOWN'
}
```

---

## Best Practices

1. **Always validate inputs** before API calls
2. **Handle errors gracefully** with user-friendly messages
3. **Use TypeScript types** for better IDE support
4. **Leverage hooks** for state management
5. **Use services** for complex operations
6. **Check storage limits** before saving
7. **Log errors** with context for debugging

---

## Examples

### Complete Contract Interaction Example

```typescript
import { ContractService } from './services'
import { useContractIDE } from './hooks'
import { formatAddress, isValidContractAddress } from './utils'

function ContractInteraction() {
  const { handleCall, parsedFunctions } = useContractIDE()
  const [address, setAddress] = useState('')
  const [abi, setABI] = useState('')

  const fetchABI = async () => {
    if (!isValidContractAddress(address)) {
      alert('Invalid address')
      return
    }

    const result = await ContractService.fetchABI(address, 1)
    
    if (result.success) {
      setABI(result.abi!)
      console.log(`Loaded ${formatAddress(address)}`)
    } else {
      alert(result.error)
    }
  }

  return (
    <div>
      <input 
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Contract address"
      />
      <button onClick={fetchABI}>Fetch ABI</button>
      
      {parsedFunctions.map(fn => (
        <button key={fn.name} onClick={() => handleCall(fn)}>
          {fn.name}
        </button>
      ))}
    </div>
  )
}
```

---

For more information, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).




