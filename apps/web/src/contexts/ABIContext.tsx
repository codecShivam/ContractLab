import { createContext, useContext, useCallback, type ReactNode, useEffect } from 'react'
import { useABIStorage } from '../hooks/useABIStorage'
import { parseABIString } from '../lib/abi-parser'
import { formatJSON } from '../lib/abi-utils'
import type { SavedABI } from '../types/contract-ide.types'
import type { DragEndEvent } from '@dnd-kit/core'
import { useContract } from './ContractContext'

interface ABIContextValue {
  // State
  abi: string
  savedABIs: SavedABI[]
  currentABIId: string | null
  
  // Actions
  updateCurrentABI: (newABI: string) => void
  switchABI: (id: string) => void
  renameABI: (id: string, newName: string) => void
  addNewABI: () => void
  addNewABIWithData: (name: string, content: string, contractAddress?: string, chainId?: number) => string
  deleteABI: (id: string) => void
  reorderABIs: (newOrder: SavedABI[]) => void
  uploadABI: (file: File) => Promise<void>
  
  // Handlers (with logging)
  handleRenameABI: (id: string, newName: string) => void
  handleSwitchABI: (id: string) => void
  handleDeleteABI: (id: string, e?: React.MouseEvent) => void
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleNewABI: () => void
  handleDragEnd: (event: DragEndEvent) => void
  handleBeautify: () => void
  handleMinify: () => void
  handleReset: () => void
}

const ABIContext = createContext<ABIContextValue | undefined>(undefined)

interface ABIProviderProps {
  children: ReactNode
  onLog: (type: 'info' | 'success' | 'error', message: string) => void
}

export function ABIProvider({ children, onLog }: ABIProviderProps) {
  const abiStorage = useABIStorage()
  const { setContractAddress } = useContract()

  // Sync contract address when ABI changes
  useEffect(() => {
    if (abiStorage.currentABIId) {
      const currentABI = abiStorage.savedABIs.find(a => a.id === abiStorage.currentABIId)
      if (currentABI?.metadata?.contractAddress) {
        setContractAddress(currentABI.metadata.contractAddress)
      }
    }
  }, [abiStorage.currentABIId, abiStorage.savedABIs, setContractAddress])

  // Handlers with logging
  const handleRenameABI = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return
    abiStorage.renameABI(id, newName)
    onLog('info', `Renamed → ${newName}`)
  }, [abiStorage, onLog])

  const handleSwitchABI = useCallback((id: string) => {
    const found = abiStorage.savedABIs.find(a => a.id === id)
    if (found) {
      abiStorage.switchABI(id)
      
      // Auto-update contract address if ABI has metadata
      if (found.metadata?.contractAddress) {
        setContractAddress(found.metadata.contractAddress)
      } else {
        // Clear contract address if ABI has no associated contract
        setContractAddress('')
      }
      
      onLog('info', `Opened ${found.name}`)
    }
  }, [abiStorage, setContractAddress, onLog])

  const handleDeleteABI = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const found = abiStorage.savedABIs.find(a => a.id === id)
    if (found) {
      abiStorage.deleteABI(id)
      onLog('info', `Closed ${found.name}`)
    }
  }, [abiStorage, onLog])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const parsed = parseABIString(await file.text())
      if (!parsed.isValid) {
        onLog('error', parsed.error || 'Invalid ABI format')
        return
      }

      await abiStorage.uploadABI(file)
      const fileName = file.name.replace(/\.[^/.]+$/, '')
      onLog('success', `Imported ${fileName}`)
    } catch (error) {
      onLog('error', 'Failed to read file')
    }
    
    if (event.target) {
      event.target.value = ''
    }
  }, [abiStorage, onLog])

  const handleNewABI = useCallback(() => {
    abiStorage.addNewABI()
    // Clear contract address when creating new ABI
    setContractAddress('')
    onLog('info', `Created new ABI tab`)
  }, [abiStorage, setContractAddress, onLog])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = abiStorage.savedABIs.findIndex((item) => item.id === active.id)
      const newIndex = abiStorage.savedABIs.findIndex((item) => item.id === over.id)
      const newOrder = [...abiStorage.savedABIs]
      const [removed] = newOrder.splice(oldIndex, 1)
      newOrder.splice(newIndex, 0, removed)
      abiStorage.reorderABIs(newOrder)
      onLog('info', 'Tab reordered')
    }
  }, [abiStorage, onLog])

  const handleBeautify = useCallback(() => {
    const formatted = formatJSON(abiStorage.abi)
    if (formatted !== abiStorage.abi) {
      abiStorage.updateCurrentABI(formatted)
      onLog('info', 'Formatted JSON')
    }
  }, [abiStorage, onLog])

  const handleMinify = useCallback(() => {
    try {
      const minified = JSON.stringify(JSON.parse(abiStorage.abi))
      abiStorage.updateCurrentABI(minified)
      onLog('info', 'Minified JSON')
    } catch {
      onLog('error', 'Invalid JSON format')
    }
  }, [abiStorage, onLog])

  const handleReset = useCallback(() => {
    abiStorage.updateCurrentABI('')
    onLog('info', 'Editor cleared')
  }, [abiStorage, onLog])

  const value: ABIContextValue = {
    ...abiStorage,
    handleRenameABI,
    handleSwitchABI,
    handleDeleteABI,
    handleFileUpload,
    handleNewABI,
    handleDragEnd,
    handleBeautify,
    handleMinify,
    handleReset,
  }

  return <ABIContext.Provider value={value}>{children}</ABIContext.Provider>
}

export function useABI() {
  const context = useContext(ABIContext)
  if (context === undefined) {
    throw new Error('useABI must be used within ABIProvider')
  }
  return context
}
