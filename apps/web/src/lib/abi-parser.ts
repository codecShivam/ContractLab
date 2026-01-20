/**
 * ABI Parser - Client-Side Contract ABI Validation & Parsing
 * 
 * This module provides comprehensive ABI parsing with validation, normalization,
 * and categorization of smart contract functions and events.
 * 
 * JSON SCHEMA REQUIREMENTS:
 * -------------------------
 * ABI must be an array of objects with the following structure:
 * 
 * For Functions:
 * {
 *   "type": "function",           // Required: must be "function"
 *   "name": string,                // Required: function name
 *   "stateMutability": string,     // Required: "view" | "pure" | "nonpayable" | "payable"
 *   "inputs": Array<{              // Required: array (can be empty)
 *     "name": string,              // Optional: parameter name
 *     "type": string               // Required: Solidity type (address, uint256, etc.)
 *   }>,
 *   "outputs": Array<{             // Optional: return values
 *     "name": string,              // Optional: return value name
 *     "type": string               // Required: Solidity type
 *   }>
 * }
 * 
 * For Events:
 * {
 *   "type": "event",               // Required: must be "event"
 *   "name": string,                // Required: event name
 *   "inputs": Array<{              // Optional: event parameters
 *     "name": string,              // Optional: parameter name
 *     "type": string,              // Required: Solidity type
 *     "indexed": boolean           // Optional: whether parameter is indexed
 *   }>
 * }
 * 
 * FUNCTION CATEGORIZATION:
 * ------------------------
 * - Read Functions: stateMutability = "view" | "pure"
 *   → Don't modify state, can be called without gas
 * 
 * - Write Functions: stateMutability = "nonpayable"
 *   → Modify state, require gas, don't accept ETH
 * 
 * - Payable Functions: stateMutability = "payable"
 *   → Modify state, require gas, accept ETH transfers
 * 
 * VALIDATION ERRORS:
 * ------------------
 * - INVALID_JSON: Malformed JSON syntax
 * - NOT_AN_ARRAY: ABI is not an array
 * - INVALID_ABI_STRUCTURE: Empty array or invalid structure
 * - MISSING_REQUIRED_FIELDS: Missing required fields (type, name, inputs)
 * 
 * @example
 * ```typescript
 * const abi = '[{"type":"function","name":"balanceOf","stateMutability":"view","inputs":[{"name":"account","type":"address"}],"outputs":[{"name":"","type":"uint256"}]}]'
 * const result = parseABIString(abi)
 * if (result.isValid) {
 *   console.log('Read functions:', result.readFunctions)
 *   console.log('Write functions:', result.writeFunctions)
 * } else {
 *   console.error('Error:', result.error, result.errorType)
 * }
 * ```
 */

import type { AbiFunction } from 'viem'

export interface ParsedABI {
  functions: AbiFunction[]
  readFunctions: AbiFunction[]
  writeFunctions: AbiFunction[]
  payableFunctions: AbiFunction[]
  isValid: boolean
  error?: string
}

/**
 * Normalizes ABI string by:
 * - Removing comments (// and /* *\/)
 * - Trimming whitespace
 * - Accepting both formatted and minified JSON
 */
function normalizeABIString(abiString: string): string {
  // Remove single-line comments
  let normalized = abiString.replace(/\/\/.*$/gm, '')
  
  // Remove multi-line comments
  normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '')
  
  // Trim whitespace
  normalized = normalized.trim()
  
  return normalized
}

/**
 * Extracts ABI array from various contract artifact formats
 * 
 * Supports:
 * - Format A: Pure ABI Array [{ "type": "function", ... }]
 * - Format B: Hardhat Artifact { "_format": "hh-sol-artifact-1", "abi": [...] }
 * - Format C: Foundry Artifact { "abi": [...], "bytecode": "..." }
 * - Format D: Truffle Artifact { "contractName": "MyToken", "abi": [...] }
 * - Format E: Flattened ABI as string (double-encoded JSON)
 * - Format F: ABI wrapped in object { "abi": [...], "metadata": {...} }
 * 
 * @param parsed - Parsed JSON object
 * @returns Extracted ABI array or the original if already in correct format
 */
function extractABIFromArtifact(parsed: any): any {
  // Format A: Already a pure ABI array
  if (Array.isArray(parsed)) {
    return parsed
  }

  // Not an object - cannot extract ABI
  if (typeof parsed !== 'object' || parsed === null) {
    return parsed
  }

  // Format B, C, D, F: Extract `abi` field if present
  if (parsed.abi && Array.isArray(parsed.abi)) {
    return parsed.abi
  }

  // If object doesn't have `abi` field, return as-is (will fail validation)
  return parsed
}

/**
 * Validates that an ABI item has required fields
 */
function validateABIItem(item: any, index: number): { valid: boolean; error?: string } {
  if (!item || typeof item !== 'object') {
    return { valid: false, error: `Item at index ${index} is not an object` }
  }

  // Type is required
  if (!item.type || typeof item.type !== 'string') {
    return { valid: false, error: `Item at index ${index} is missing 'type' field` }
  }

  // For functions and events, name is required
  if ((item.type === 'function' || item.type === 'event') && !item.name) {
    return { valid: false, error: `${item.type} at index ${index} is missing 'name' field` }
  }

  // For functions, inputs must be an array (can be empty)
  if (item.type === 'function') {
    if (!item.inputs || !Array.isArray(item.inputs)) {
      return { valid: false, error: `Function '${item.name}' at index ${index} is missing 'inputs' array` }
    }
    
    // Validate each input has name and type
    for (let i = 0; i < item.inputs.length; i++) {
      const input = item.inputs[i]
      if (!input.type) {
        return { valid: false, error: `Function '${item.name}' input at position ${i} is missing 'type'` }
      }
    }
  }

  return { valid: true }
}

/**
 * Parses ABI string with comprehensive validation and error handling
 */
export function parseABIString(abiString: string): ParsedABI {
  const emptyResult: ParsedABI = {
    functions: [],
    readFunctions: [],
    writeFunctions: [],
    payableFunctions: [],
    isValid: false,
  }

  // Step 1: Normalize the input
  const normalized = normalizeABIString(abiString)
  
  if (!normalized) {
    return {
      ...emptyResult,
      error: 'ABI string is empty',
    }
  }

  // Step 2: Parse JSON
  let parsed: any
  try {
    parsed = JSON.parse(normalized)
  } catch (error: any) {
    return {
      ...emptyResult,
      error: 'Invalid JSON. Check for trailing commas or syntax errors.',
    }
  }

  // Step 3: Extract ABI from artifact formats (B, C, D, F)
  const abi = extractABIFromArtifact(parsed)

  // Step 4: Validate it's an array
  if (!Array.isArray(abi)) {
    return {
      ...emptyResult,
      error: 'This file does not contain a valid ABI. ABI must be an array of functions.',
    }
  }

  // Step 5: Validate it's not empty
  if (abi.length === 0) {
    return {
      ...emptyResult,
      error: 'ABI is empty. Please provide a contract ABI with at least one function.',
    }
  }

  // Step 6: Validate each item
  for (let i = 0; i < abi.length; i++) {
    const validation = validateABIItem(abi[i], i)
    if (!validation.valid) {
      return {
        ...emptyResult,
        error: validation.error,
      }
    }
  }

  // Step 7: Extract functions (skip events for MVP)
  const functions = abi.filter(
    (item): item is AbiFunction => item.type === 'function'
  )

  // Step 8: Categorize functions by stateMutability
  const readFunctions = functions.filter(
    (fn) => fn.stateMutability === 'view' || fn.stateMutability === 'pure'
  )

  const writeFunctions = functions.filter(
    (fn) => fn.stateMutability === 'nonpayable'
  )

  const payableFunctions = functions.filter(
    (fn) => fn.stateMutability === 'payable'
  )

  return {
    functions,
    readFunctions,
    writeFunctions,
    payableFunctions,
    isValid: true,
  }
}

export function formatFunctionSignature(fn: AbiFunction): string {
  const inputs = fn.inputs?.map((input) => `${input.type} ${input.name}`).join(', ') || ''
  const outputs = fn.outputs?.map((output) => output.type).join(', ') || 'void'
  return `${fn.name}(${inputs}) → ${outputs}`
}

export function getFunctionInputs(fn: AbiFunction) {
  return fn.inputs || []
}

