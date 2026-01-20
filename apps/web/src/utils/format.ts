/**
 * Formatting utilities
 * Reusable functions for formatting data for display
 */

import { ADDRESS_FORMAT } from '../constants'

/**
 * Format Ethereum address for display
 */
export function formatAddress(
  address: string,
  prefixLength = ADDRESS_FORMAT.SHORT_PREFIX_LENGTH,
  suffixLength = ADDRESS_FORMAT.SHORT_SUFFIX_LENGTH
): string {
  if (!address) return ''
  if (address.length <= prefixLength + suffixLength) return address

  return `${address.slice(0, prefixLength)}${ADDRESS_FORMAT.SEPARATOR}${address.slice(-suffixLength)}`
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  if (seconds > 0) return `${seconds}s ago`
  return 'just now'
}

/**
 * Format BigInt for display
 */
export function formatBigInt(value: bigint, decimals = 18): string {
  const divisor = 10n ** BigInt(decimals)
  const wholePart = value / divisor
  const fractionalPart = value % divisor
  
  if (fractionalPart === 0n) {
    return wholePart.toString()
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const trimmedFractional = fractionalStr.replace(/0+$/, '')
  
  return `${wholePart}.${trimmedFractional}`
}

/**
 * Format gas value
 */
export function formatGas(gas: bigint): string {
  const gasNumber = Number(gas)
  
  if (gasNumber >= 1_000_000) {
    return `${(gasNumber / 1_000_000).toFixed(2)}M`
  }
  if (gasNumber >= 1_000) {
    return `${(gasNumber / 1_000).toFixed(2)}K`
  }
  return gasNumber.toString()
}

/**
 * Format wei to ether
 */
export function formatWeiToEther(wei: bigint): string {
  return formatBigInt(wei, 18)
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString()
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Format function signature
 */
export function formatFunctionSignature(
  name: string,
  inputs: { name?: string; type: string }[]
): string {
  const params = inputs.map(input => 
    input.name ? `${input.type} ${input.name}` : input.type
  ).join(', ')
  
  return `${name}(${params})`
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis = '...'
): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Format JSON with indentation
 */
export function formatJSON(data: unknown, indent = 2): string {
  try {
    return JSON.stringify(data, null, indent)
  } catch {
    return String(data)
  }
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}




