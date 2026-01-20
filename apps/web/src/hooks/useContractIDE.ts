import { useCallback } from 'react'
import { parseABIString } from '../lib/abi-parser'
import { fetchContractABI } from '../lib/abi-fetcher'
import {
  useConsoleContext,
  useContract,
  useABI,
  useFunctionExplorer,
  useHistory
} from '../contexts'
import { LogType } from '../types/console.types'
import { CallStatus } from '../types/history.types'
import type { AbiFunction } from 'viem'
import type { HistoryEntry } from '../lib/history-storage'

export function useContractIDE() {
  // Contexts
  const { addLog } = useConsoleContext()
  const { abi, updateCurrentABI, addNewABIWithData } = useABI()
  const { contractAddress, chainId, setFetchingABI } = useContract()
  const {
    updateInput,
    toggleFunction,
    setLoadingFunction,
    inputValues
  } = useFunctionExplorer()
  const { addEntry, updateEntry } = useHistory()

  // Parse ABI
  const parsedABI = parseABIString(abi)

  // Fetch ABI from block explorer
  const handleFetchABI = useCallback(async () => {
    if (!contractAddress || !contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      addLog(LogType.ERROR, 'Invalid contract address')
      return
    }

    setFetchingABI(true)
    addLog(LogType.INFO, `Fetching ABI for ${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`)

    try {
      const result = await fetchContractABI(contractAddress, chainId)

      if (result.success && result.abi) {
        // Create a new ABI tab with the contract address as name, content, and metadata
        addNewABIWithData(
          contractAddress, 
          result.abi,
          contractAddress, // Pass contract address to metadata
          chainId // Pass chain ID to metadata
        )
        
        if (result.isProxy && result.implementationAddress) {
          addLog(LogType.SUCCESS, `Fetched implementation ABI (Proxy detected)`)
          addLog(LogType.INFO, `Implementation: ${result.implementationAddress.slice(0, 6)}...${result.implementationAddress.slice(-4)}`)
        } else {
          addLog(LogType.SUCCESS, `Fetched ABI for ${result.contractName || 'contract'}`)
        }
      } else {
        addLog(LogType.ERROR, result.error || 'Failed to fetch ABI')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch ABI'
      addLog(LogType.ERROR, message)
    } finally {
      setFetchingABI(false)
    }
  }, [contractAddress, chainId, addLog, setFetchingABI, addNewABIWithData])

  // Handle function call
  const handleCall = useCallback((fn: AbiFunction) => {
    const inputs = fn.inputs?.map(input => inputValues[fn.name]?.[input.name || ''] || '').join(', ')
    addLog(LogType.INFO, `→ ${fn.name}(${inputs})`)

    const historyEntry = addEntry({
      functionName: fn.name,
      contractAddress,
      chainId,
      inputs: inputValues[fn.name] || {},
      status: CallStatus.PENDING,
    })

    setLoadingFunction(fn.name)

    setTimeout(() => {
      const success = Math.random() > 0.1
      const result = success
        ? (fn.stateMutability === 'view' ? '1234567890' : 'true')
        : 'Error: execution reverted'

      updateEntry(historyEntry.id, {
        result: {
          success,
          data: success ? result : undefined,
          error: success ? undefined : result,
          gasUsed: success ? `${Math.floor(Math.random() * 100000) + 21000}` : undefined
        },
        status: success ? CallStatus.SUCCESS : CallStatus.FAILED
      })

      if (success) {
        addLog(LogType.SUCCESS, `0x${Math.random().toString(16).slice(2, 10)}... Transaction sent`)
        addLog(LogType.INFO, `← ${result}`)
      } else {
        addLog(LogType.ERROR, result)
      }
      setLoadingFunction(null)
    }, 1000)
  }, [inputValues, contractAddress, chainId, addLog, setLoadingFunction, addEntry, updateEntry])

  // Handle rerun from history
  const handleRerunFromHistory = useCallback((entry: HistoryEntry) => {
    Object.entries(entry.inputs).forEach(([paramName, value]) => {
      updateInput(entry.functionName, paramName, value)
    })
    toggleFunction(entry.functionName)
    addLog(LogType.INFO, `Loaded ${entry.functionName} from history`)
  }, [updateInput, toggleFunction, addLog])

  // Load example ABI
  const handleLoadExample = useCallback(() => {
    const exampleABI = [
      {
        "type": "function",
        "name": "balanceOf",
        "stateMutability": "view",
        "inputs": [{ "name": "account", "type": "address" }],
        "outputs": [{ "name": "", "type": "uint256" }]
      },
      {
        "type": "function",
        "name": "transfer",
        "stateMutability": "nonpayable",
        "inputs": [
          { "name": "to", "type": "address" },
          { "name": "amount", "type": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "bool" }]
      },
      {
        "type": "function",
        "name": "approve",
        "stateMutability": "nonpayable",
        "inputs": [
          { "name": "spender", "type": "address" },
          { "name": "amount", "type": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "bool" }]
      },
      {
        "type": "function",
        "name": "mint",
        "stateMutability": "payable",
        "inputs": [
          { "name": "to", "type": "address" },
          { "name": "amount", "type": "uint256" }
        ],
        "outputs": []
      }
    ]
    updateCurrentABI(JSON.stringify(exampleABI, null, 2))
    addLog(LogType.INFO, 'Loaded ERC20 example')
  }, [updateCurrentABI, addLog])

  // Filter and sort functions
  const filterFunctions = useCallback((functions: AbiFunction[], searchQuery: string) => {
    if (!searchQuery.trim()) return functions

    const query = searchQuery.toLowerCase()
    return functions.filter(fn => {
      if (fn.name.toLowerCase().includes(query)) return true
      if (fn.stateMutability?.toLowerCase().includes(query)) return true
      if (fn.inputs?.some(input => input.type.toLowerCase().includes(query))) return true
      return false
    })
  }, [])

  const sortFunctions = useCallback((functions: AbiFunction[], pinnedFunctions: Set<string>) => {
    return [...functions].sort((a, b) => {
      const aIsPinned = pinnedFunctions.has(a.name)
      const bIsPinned = pinnedFunctions.has(b.name)

      if (aIsPinned && !bIsPinned) return -1
      if (!aIsPinned && bIsPinned) return 1

      return a.name.localeCompare(b.name)
    })
  }, [])

  const allReadFunctions = parsedABI.readFunctions || []
  const allWriteFunctions = parsedABI.writeFunctions || []
  const allPayableFunctions = parsedABI.payableFunctions || []

  return {
    parsedABI,
    allReadFunctions,
    allWriteFunctions,
    allPayableFunctions,
    handleFetchABI,
    handleCall,
    handleRerunFromHistory,
    handleLoadExample,
    filterFunctions,
    sortFunctions
  }
}

