/**
 * Gas Estimator - Estimates gas costs for contract function calls
 */

import { createPublicClient, http, type Address, type Abi } from 'viem'
import { mainnet, sepolia, polygon, arbitrum, optimism, base } from 'viem/chains'
import type { GasEstimate } from '../types/contract.types'

// Re-export type for convenience
export type { GasEstimate }

const CHAINS_MAP = {
  1: mainnet,
  11155111: sepolia,
  137: polygon,
  42161: arbitrum,
  10: optimism,
  8453: base,
} as const

/**
 * Estimate gas for a contract function call
 * @param chainId - Chain ID to estimate gas on
 * @param contractAddress - Contract address
 * @param abi - Contract ABI
 * @param functionName - Function name to call
 * @param args - Function arguments
 * @param account - Account address (optional)
 * @returns Gas estimate or null if estimation fails
 */
export async function estimateGas(
  chainId: number,
  contractAddress: string,
  abi: Abi,
  functionName: string,
  args: unknown[],
  account?: Address
): Promise<GasEstimate | null> {
  try {
    const chain = CHAINS_MAP[chainId as keyof typeof CHAINS_MAP]
    if (!chain) {
      return null
    }

    // Create public client for the chain
    const client = createPublicClient({
      chain,
      transport: http(),
    })

    // Estimate gas
    const gasEstimate = await client.estimateContractGas({
      address: contractAddress as Address,
      abi,
      functionName,
      args,
      account: account || '0x0000000000000000000000000000000000000000', // Default account
    })

    // Get current gas price
    const gasPrice = await client.getGasPrice()

    // Calculate estimated cost in wei
    const estimatedCostWei = gasEstimate * gasPrice
    
    // Convert to ETH (or native currency)
    const estimatedCostEth = Number(estimatedCostWei) / 1e18

    return {
      estimated: gasEstimate,
      withBuffer: gasEstimate + (gasEstimate * BigInt(20)) / BigInt(100), // 20% buffer
      bufferPercentage: 20,
      estimatedCostEth,
    }
  } catch (error) {
    // Silently fail - gas estimation is optional
    return null
  }
}

/**
 * Format gas estimate for display
 * @param estimate - Gas estimate object
 * @returns Formatted string
 */
export function formatGasEstimate(estimate: GasEstimate): string {
  const gasAmount = Number(estimate.estimated).toLocaleString()
  const withBuffer = Number(estimate.withBuffer).toLocaleString()
  return `${gasAmount} (${withBuffer} with ${estimate.bufferPercentage}% buffer)`
}

/**
 * Get a rough gas estimate without making an RPC call
 * Useful for simple read functions or as a fallback
 */
export function getRoughGasEstimate(functionType: 'read' | 'write' | 'payable'): string {
  switch (functionType) {
    case 'read':
      return '~21,000 gas'
    case 'write':
      return '~50,000-100,000 gas'
    case 'payable':
      return '~50,000-150,000 gas'
    default:
      return 'Unknown'
  }
}

