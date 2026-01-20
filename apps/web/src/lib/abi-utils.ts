import type { AbiFunction } from 'viem'

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        return true
      } finally {
        document.body.removeChild(textArea)
      }
    }
  } catch {
    return false
  }
}

/**
 * Format JSON with proper indentation
 */
export function formatJSON(jsonString: string, indent: number = 2): string {
  try {
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed, null, indent)
  } catch {
    return jsonString
  }
}

/**
 * Minify JSON (remove whitespace)
 */
export function minifyJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed)
  } catch {
    return jsonString
  }
}

/**
 * Get function selector (first 4 bytes of keccak256 hash)
 * This is a simple placeholder - for production use viem's selector function
 */
export function getFunctionSelector(fn: AbiFunction): string {
  const signature = `${fn.name}(${fn.inputs?.map(i => i.type).join(',') || ''})`
  // In production, use: import { toFunctionSelector } from 'viem'
  // return toFunctionSelector(signature)
  return signature // Placeholder
}

/**
 * Export ABI to file
 */
export function exportABIToFile(abi: any, filename: string = 'abi.json'): void {
  const blob = new Blob([JSON.stringify(abi, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download parsed ABI as markdown documentation
 */
export function exportABIAsMarkdown(
  parsedABI: {
    readFunctions: AbiFunction[]
    writeFunctions: AbiFunction[]
    payableFunctions: AbiFunction[]
  },
  contractName: string = 'Contract'
): string {
  let markdown = `# ${contractName} ABI Documentation\n\n`
  
  if (parsedABI.readFunctions.length > 0) {
    markdown += `## Read Functions (View/Pure)\n\n`
    parsedABI.readFunctions.forEach(fn => {
      const inputs = fn.inputs?.map(i => `${i.type} ${i.name}`).join(', ') || ''
      const outputs = fn.outputs?.map(o => o.type).join(', ') || 'void'
      markdown += `### ${fn.name}\n`
      markdown += `- **Signature:** \`${fn.name}(${inputs})\`\n`
      markdown += `- **Returns:** \`${outputs}\`\n`
      markdown += `- **State Mutability:** \`${fn.stateMutability}\`\n\n`
    })
  }
  
  if (parsedABI.writeFunctions.length > 0) {
    markdown += `## Write Functions (Non-Payable)\n\n`
    parsedABI.writeFunctions.forEach(fn => {
      const inputs = fn.inputs?.map(i => `${i.type} ${i.name}`).join(', ') || ''
      const outputs = fn.outputs?.map(o => o.type).join(', ') || 'void'
      markdown += `### ${fn.name}\n`
      markdown += `- **Signature:** \`${fn.name}(${inputs})\`\n`
      markdown += `- **Returns:** \`${outputs}\`\n`
      markdown += `- **State Mutability:** \`${fn.stateMutability}\`\n\n`
    })
  }
  
  if (parsedABI.payableFunctions.length > 0) {
    markdown += `## Payable Functions\n\n`
    parsedABI.payableFunctions.forEach(fn => {
      const inputs = fn.inputs?.map(i => `${i.type} ${i.name}`).join(', ') || ''
      markdown += `### ${fn.name}\n`
      markdown += `- **Signature:** \`${fn.name}(${inputs})\`\n`
      markdown += `- **State Mutability:** \`${fn.stateMutability}\`\n`
      markdown += `- **Accepts ETH:** ✅\n\n`
    })
  }
  
  return markdown
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Validation utilities moved to utils/validation.ts
// Formatting utilities moved to utils/format.ts
// Import from there instead:
// import { isValidAddress, isValidHexString } from '../utils/validation'
// import { formatNumber, formatBigInt } from '../utils/format'

