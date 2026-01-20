/**
 * Collection Context
 * Manages collection state and operations
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { StorageService, type LocalCollection } from '../services/storage.service'
import type { CollectionABI, InputPreset, SyncStatus } from '@contractlab/types'
import { trpc } from '../lib/trpc-client'

// ============================================================================
// Types
// ============================================================================

interface CollectionContextType {
  // State
  collections: LocalCollection[]
  currentCollection: LocalCollection | null
  isLoading: boolean
  error: string | null

  // Collection CRUD
  createCollection: (name: string, description?: string) => LocalCollection
  updateCollection: (id: string, updates: Partial<Pick<LocalCollection, 'name' | 'description' | 'isPublic'>>) => boolean
  deleteCollection: (id: string) => boolean
  selectCollection: (id: string) => void

  // ABI operations
  addABI: (abi: Omit<CollectionABI, 'order'>) => boolean
  removeABI: (abiId: string) => boolean
  updateABI: (abiId: string, updates: Partial<Omit<CollectionABI, 'id'>>) => boolean
  reorderABIs: (abiIds: string[]) => boolean

  // Input preset operations
  addInputPreset: (abiId: string, preset: Omit<InputPreset, 'id'>) => boolean
  removeInputPreset: (abiId: string, presetId: string) => boolean

  // Sync operations
  syncToCloud: (collectionId: string) => Promise<boolean>
  syncStatus: SyncStatus

  // Refresh
  refreshCollections: () => void
}

// ============================================================================
// Context
// ============================================================================

const CollectionContext = createContext<CollectionContextType | null>(null)

// ============================================================================
// Provider
// ============================================================================

interface CollectionProviderProps {
  children: ReactNode
}

export function CollectionProvider({ children }: CollectionProviderProps) {
  const [collections, setCollections] = useState<LocalCollection[]>([])
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // tRPC mutations
  const syncMutation = trpc.collections.sync.useMutation()

  // Current collection derived from state
  const currentCollection = collections.find((c) => c.id === currentCollectionId) || null

  // Sync status based on current collection
  const syncStatus: SyncStatus = currentCollection?.syncStatus || 'local'

  // Load collections on mount
  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = useCallback(() => {
    try {
      setIsLoading(true)
      setError(null)

      // Check and run migration if needed
      if (!StorageService.isMigrationComplete()) {
        StorageService.migrateLegacyABIs()
      }

      const loaded = StorageService.loadCollections()
      setCollections(loaded)

      // Set current collection
      const savedCurrentId = StorageService.getCurrentCollectionId()
      if (savedCurrentId && loaded.some((c) => c.id === savedCurrentId)) {
        setCurrentCollectionId(savedCurrentId)
      } else if (loaded.length > 0) {
        setCurrentCollectionId(loaded[0].id)
        StorageService.setCurrentCollectionId(loaded[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createCollection = useCallback((name: string, description?: string): LocalCollection => {
    const newCollection = StorageService.createCollection(name, description)
    setCollections(StorageService.loadCollections())
    setCurrentCollectionId(newCollection.id)
    StorageService.setCurrentCollectionId(newCollection.id)
    return newCollection
  }, [])

  const updateCollection = useCallback(
    (id: string, updates: Partial<Pick<LocalCollection, 'name' | 'description' | 'isPublic'>>): boolean => {
      const success = StorageService.updateCollection(id, updates)
      if (success) {
        setCollections(StorageService.loadCollections())
      }
      return success
    },
    []
  )

  const deleteCollection = useCallback(
    (id: string): boolean => {
      const success = StorageService.deleteCollection(id)
      if (success) {
        const updated = StorageService.loadCollections()
        setCollections(updated)

        // If deleted collection was current, select another
        if (currentCollectionId === id) {
          if (updated.length > 0) {
            setCurrentCollectionId(updated[0].id)
            StorageService.setCurrentCollectionId(updated[0].id)
          } else {
            setCurrentCollectionId(null)
          }
        }
      }
      return success
    },
    [currentCollectionId]
  )

  const selectCollection = useCallback((id: string) => {
    setCurrentCollectionId(id)
    StorageService.setCurrentCollectionId(id)
  }, [])

  // ABI operations
  const addABI = useCallback(
    (abi: Omit<CollectionABI, 'order'>): boolean => {
      if (!currentCollectionId) return false
      const success = StorageService.addABIToCollection(currentCollectionId, abi)
      if (success) {
        setCollections(StorageService.loadCollections())
      }
      return success
    },
    [currentCollectionId]
  )

  const removeABI = useCallback(
    (abiId: string): boolean => {
      if (!currentCollectionId) return false
      const success = StorageService.removeABIFromCollection(currentCollectionId, abiId)
      if (success) {
        setCollections(StorageService.loadCollections())
      }
      return success
    },
    [currentCollectionId]
  )

  const updateABI = useCallback(
    (abiId: string, updates: Partial<Omit<CollectionABI, 'id'>>): boolean => {
      if (!currentCollectionId) return false
      const success = StorageService.updateABIInCollection(currentCollectionId, abiId, updates)
      if (success) {
        setCollections(StorageService.loadCollections())
      }
      return success
    },
    [currentCollectionId]
  )

  const reorderABIs = useCallback(
    (abiIds: string[]): boolean => {
      if (!currentCollectionId) return false
      const success = StorageService.reorderABIsInCollection(currentCollectionId, abiIds)
      if (success) {
        setCollections(StorageService.loadCollections())
      }
      return success
    },
    [currentCollectionId]
  )

  // Input preset operations
  const addInputPreset = useCallback(
    (abiId: string, preset: Omit<InputPreset, 'id'>): boolean => {
      if (!currentCollectionId) return false
      const success = StorageService.addInputPreset(currentCollectionId, abiId, preset)
      if (success) {
        setCollections(StorageService.loadCollections())
      }
      return success
    },
    [currentCollectionId]
  )

  const removeInputPreset = useCallback(
    (abiId: string, presetId: string): boolean => {
      if (!currentCollectionId) return false
      const success = StorageService.removeInputPreset(currentCollectionId, abiId, presetId)
      if (success) {
        setCollections(StorageService.loadCollections())
      }
      return success
    },
    [currentCollectionId]
  )

  // Sync to cloud
  const syncToCloud = useCallback(
    async (collectionId: string): Promise<boolean> => {
      const collection = collections.find((c) => c.id === collectionId)
      if (!collection) return false

      try {
        const result = await syncMutation.mutateAsync({
          localId: collection.id,
          name: collection.name,
          description: collection.description,
          abis: collection.abis,
        })

        if (result.success) {
          StorageService.markCollectionSynced(collectionId, result.cloudId, result.shareId)
          setCollections(StorageService.loadCollections())
          return true
        }
        return false
      } catch (err) {
        console.error('Sync failed:', err)
        return false
      }
    },
    [collections, syncMutation]
  )

  const value: CollectionContextType = {
    collections,
    currentCollection,
    isLoading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    selectCollection,
    addABI,
    removeABI,
    updateABI,
    reorderABIs,
    addInputPreset,
    removeInputPreset,
    syncToCloud,
    syncStatus,
    refreshCollections: loadCollections,
  }

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>
}

// ============================================================================
// Hook
// ============================================================================

export function useCollection() {
  const context = useContext(CollectionContext)
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider')
  }
  return context
}

export { CollectionContext }

