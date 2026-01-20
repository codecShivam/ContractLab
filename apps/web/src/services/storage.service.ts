/**
 * Storage Service
 * High-level service layer for data persistence
 */

import { storage } from '../utils/storage'
import { STORAGE_KEYS, STORAGE_LIMITS } from '../constants'
import { logError } from '../utils/error-handler'
import { ABISource } from '../types/storage.types'
import type { SavedABI } from '../types/storage.types'
import type { Collection, CollectionABI, SyncStatus, InputPreset } from '@contractlab/types'

// ============================================================================
// Local Collection Types (with sync status)
// ============================================================================

export interface LocalCollection extends Omit<Collection, 'createdAt' | 'updatedAt'> {
  createdAt: number
  updatedAt: number
  syncStatus: SyncStatus
}

// ============================================================================
// Storage Service Class
// ============================================================================

export class StorageService {
  // ==========================================================================
  // Legacy ABI Methods (for backward compatibility)
  // ==========================================================================

  /**
   * Save ABIs with validation
   */
  static saveABIs(abis: SavedABI[]): boolean {
    try {
      if (abis.length > STORAGE_LIMITS.MAX_ABIS) {
        console.warn(`Trimming ABIs to limit of ${STORAGE_LIMITS.MAX_ABIS}`)
        abis = abis.slice(0, STORAGE_LIMITS.MAX_ABIS)
      }

      return storage.set(STORAGE_KEYS.SAVED_ABIS, abis)
    } catch (error) {
      logError(error, 'StorageService.saveABIs')
      return false
    }
  }

  /**
   * Load ABIs from storage
   */
  static loadABIs(): SavedABI[] {
    try {
      return storage.get<SavedABI[]>(STORAGE_KEYS.SAVED_ABIS, []) || []
    } catch (error) {
      logError(error, 'StorageService.loadABIs')
      return []
    }
  }

  /**
   * Save current ABI ID
   */
  static saveCurrentABIId(id: string): boolean {
    return storage.set(STORAGE_KEYS.CURRENT_ABI_ID, id)
  }

  /**
   * Load current ABI ID
   */
  static loadCurrentABIId(): string | null {
    return storage.get<string>(STORAGE_KEYS.CURRENT_ABI_ID, undefined) ?? null
  }

  /**
   * Create new ABI with metadata
   */
  static createABI(
    name: string,
    content: string,
    source: ABISource = ABISource.PASTED,
    additionalMetadata?: Partial<SavedABI['metadata']>
  ): SavedABI {
    return {
      id: Date.now().toString(),
      name,
      content,
      timestamp: Date.now(),
      metadata: {
        source,
        ...additionalMetadata,
      },
    }
  }

  // ==========================================================================
  // Collection Methods
  // ==========================================================================

  /**
   * Load all collections from storage
   */
  static loadCollections(): LocalCollection[] {
    try {
      return storage.get<LocalCollection[]>(STORAGE_KEYS.COLLECTIONS, []) || []
    } catch (error) {
      logError(error, 'StorageService.loadCollections')
      return []
    }
  }

  /**
   * Save all collections to storage
   */
  static saveCollections(collections: LocalCollection[]): boolean {
    try {
      if (collections.length > STORAGE_LIMITS.MAX_COLLECTIONS) {
        console.warn(`Trimming collections to limit of ${STORAGE_LIMITS.MAX_COLLECTIONS}`)
        collections = collections.slice(0, STORAGE_LIMITS.MAX_COLLECTIONS)
      }

      return storage.set(STORAGE_KEYS.COLLECTIONS, collections)
    } catch (error) {
      logError(error, 'StorageService.saveCollections')
      return false
    }
  }

  /**
   * Get a single collection by ID
   */
  static getCollection(id: string): LocalCollection | null {
    const collections = this.loadCollections()
    return collections.find((c) => c.id === id) || null
  }

  /**
   * Create a new collection
   */
  static createCollection(name: string, description?: string): LocalCollection {
    const now = Date.now()
    const collection: LocalCollection = {
      id: `local_${now}`,
      name,
      description,
      isPublic: false,
      abis: [],
      syncStatus: 'local',
      createdAt: now,
      updatedAt: now,
    }

    const collections = this.loadCollections()
    collections.unshift(collection)
    this.saveCollections(collections)

    return collection
  }

  /**
   * Update a collection
   */
  static updateCollection(
    id: string,
    updates: Partial<Pick<LocalCollection, 'name' | 'description' | 'isPublic' | 'abis'>>
  ): boolean {
    try {
      const collections = this.loadCollections()
      const index = collections.findIndex((c) => c.id === id)

      if (index === -1) return false

      collections[index] = {
        ...collections[index],
        ...updates,
        updatedAt: Date.now(),
        syncStatus: collections[index].syncStatus === 'synced' ? 'pending' : collections[index].syncStatus,
      }

      return this.saveCollections(collections)
    } catch (error) {
      logError(error, 'StorageService.updateCollection')
      return false
    }
  }

  /**
   * Delete a collection
   */
  static deleteCollection(id: string): boolean {
    try {
      const collections = this.loadCollections()
      const filtered = collections.filter((c) => c.id !== id)

      if (filtered.length === collections.length) return false

      return this.saveCollections(filtered)
    } catch (error) {
      logError(error, 'StorageService.deleteCollection')
      return false
    }
  }

  /**
   * Get current collection ID
   */
  static getCurrentCollectionId(): string | null {
    return storage.get<string>(STORAGE_KEYS.CURRENT_COLLECTION_ID, undefined) ?? null
  }

  /**
   * Set current collection ID
   */
  static setCurrentCollectionId(id: string): boolean {
    return storage.set(STORAGE_KEYS.CURRENT_COLLECTION_ID, id)
  }

  // ==========================================================================
  // Collection ABI Methods
  // ==========================================================================

  /**
   * Add an ABI to a collection
   */
  static addABIToCollection(collectionId: string, abi: Omit<CollectionABI, 'order'>): boolean {
    try {
      const collections = this.loadCollections()
      const collection = collections.find((c) => c.id === collectionId)

      if (!collection) return false

      if (collection.abis.length >= STORAGE_LIMITS.MAX_ABIS_PER_COLLECTION) {
        console.warn(`Collection ABI limit reached: ${STORAGE_LIMITS.MAX_ABIS_PER_COLLECTION}`)
        return false
      }

      const newAbi: CollectionABI = {
        ...abi,
        order: collection.abis.length,
      }

      collection.abis.push(newAbi)
      collection.updatedAt = Date.now()

      if (collection.syncStatus === 'synced') {
        collection.syncStatus = 'pending'
      }

      return this.saveCollections(collections)
    } catch (error) {
      logError(error, 'StorageService.addABIToCollection')
      return false
    }
  }

  /**
   * Remove an ABI from a collection
   */
  static removeABIFromCollection(collectionId: string, abiId: string): boolean {
    try {
      const collections = this.loadCollections()
      const collection = collections.find((c) => c.id === collectionId)

      if (!collection) return false

      collection.abis = collection.abis.filter((a) => a.id !== abiId)
      collection.updatedAt = Date.now()

      if (collection.syncStatus === 'synced') {
        collection.syncStatus = 'pending'
      }

      return this.saveCollections(collections)
    } catch (error) {
      logError(error, 'StorageService.removeABIFromCollection')
      return false
    }
  }

  /**
   * Update an ABI in a collection
   */
  static updateABIInCollection(
    collectionId: string,
    abiId: string,
    updates: Partial<Omit<CollectionABI, 'id'>>
  ): boolean {
    try {
      const collections = this.loadCollections()
      const collection = collections.find((c) => c.id === collectionId)

      if (!collection) return false

      const abiIndex = collection.abis.findIndex((a) => a.id === abiId)
      if (abiIndex === -1) return false

      collection.abis[abiIndex] = {
        ...collection.abis[abiIndex],
        ...updates,
      }
      collection.updatedAt = Date.now()

      if (collection.syncStatus === 'synced') {
        collection.syncStatus = 'pending'
      }

      return this.saveCollections(collections)
    } catch (error) {
      logError(error, 'StorageService.updateABIInCollection')
      return false
    }
  }

  /**
   * Reorder ABIs in a collection
   */
  static reorderABIsInCollection(collectionId: string, abiIds: string[]): boolean {
    try {
      const collections = this.loadCollections()
      const collection = collections.find((c) => c.id === collectionId)

      if (!collection) return false

      const abiMap = new Map(collection.abis.map((a) => [a.id, a]))
      collection.abis = abiIds
        .map((id, index) => {
          const abi = abiMap.get(id)
          if (abi) {
            return { ...abi, order: index }
          }
          return null
        })
        .filter((a): a is CollectionABI => a !== null)

      collection.updatedAt = Date.now()

      if (collection.syncStatus === 'synced') {
        collection.syncStatus = 'pending'
      }

      return this.saveCollections(collections)
    } catch (error) {
      logError(error, 'StorageService.reorderABIsInCollection')
      return false
    }
  }

  // ==========================================================================
  // Input Presets Methods
  // ==========================================================================

  /**
   * Add an input preset to an ABI
   */
  static addInputPreset(collectionId: string, abiId: string, preset: Omit<InputPreset, 'id'>): boolean {
    try {
      const collections = this.loadCollections()
      const collection = collections.find((c) => c.id === collectionId)

      if (!collection) return false

      const abi = collection.abis.find((a) => a.id === abiId)
      if (!abi) return false

      if (abi.inputPresets.length >= STORAGE_LIMITS.MAX_INPUT_PRESETS) {
        console.warn(`Input preset limit reached: ${STORAGE_LIMITS.MAX_INPUT_PRESETS}`)
        return false
      }

      const newPreset: InputPreset = {
        ...preset,
        id: `preset_${Date.now()}`,
      }

      abi.inputPresets.push(newPreset)
      collection.updatedAt = Date.now()

      if (collection.syncStatus === 'synced') {
        collection.syncStatus = 'pending'
      }

      return this.saveCollections(collections)
    } catch (error) {
      logError(error, 'StorageService.addInputPreset')
      return false
    }
  }

  /**
   * Remove an input preset from an ABI
   */
  static removeInputPreset(collectionId: string, abiId: string, presetId: string): boolean {
    try {
      const collections = this.loadCollections()
      const collection = collections.find((c) => c.id === collectionId)

      if (!collection) return false

      const abi = collection.abis.find((a) => a.id === abiId)
      if (!abi) return false

      abi.inputPresets = abi.inputPresets.filter((p) => p.id !== presetId)
      collection.updatedAt = Date.now()

      if (collection.syncStatus === 'synced') {
        collection.syncStatus = 'pending'
      }

      return this.saveCollections(collections)
    } catch (error) {
      logError(error, 'StorageService.removeInputPreset')
      return false
    }
  }

  // ==========================================================================
  // Sync Status Methods
  // ==========================================================================

  /**
   * Mark a collection as synced with cloud
   */
  static markCollectionSynced(localId: string, cloudId: string, shareId?: string): boolean {
    try {
      const collections = this.loadCollections()
      const collection = collections.find((c) => c.id === localId)

      if (!collection) return false

      collection.id = cloudId
      collection.shareId = shareId
      collection.syncStatus = 'synced'
      collection.updatedAt = Date.now()

      return this.saveCollections(collections)
    } catch (error) {
      logError(error, 'StorageService.markCollectionSynced')
      return false
    }
  }

  /**
   * Get collections that need syncing
   */
  static getPendingCollections(): LocalCollection[] {
    return this.loadCollections().filter((c) => c.syncStatus === 'pending')
  }

  // ==========================================================================
  // Migration Methods
  // ==========================================================================

  /**
   * Check if migration has been completed
   */
  static isMigrationComplete(): boolean {
    return storage.get<boolean>(STORAGE_KEYS.COLLECTIONS_MIGRATED, false) || false
  }

  /**
   * Mark migration as complete
   */
  static markMigrationComplete(): boolean {
    return storage.set(STORAGE_KEYS.COLLECTIONS_MIGRATED, true)
  }

  /**
   * Migrate legacy ABIs to a default collection
   */
  static migrateLegacyABIs(): LocalCollection | null {
    try {
      if (this.isMigrationComplete()) {
        return null
      }

      const legacyABIs = this.loadABIs()
      if (legacyABIs.length === 0) {
        this.markMigrationComplete()
        return null
      }

      // Create default collection with migrated ABIs
      const now = Date.now()
      const collection: LocalCollection = {
        id: `local_${now}`,
        name: 'My Contracts',
        description: 'Migrated from previous version',
        isPublic: false,
        abis: legacyABIs.map((legacy, index): CollectionABI => ({
          id: legacy.id,
          name: legacy.name,
          content: legacy.content,
          contractAddress: legacy.metadata?.contractAddress,
          chainId: legacy.metadata?.chainId,
          isShared: true,
          order: index,
          functions: [], // Will be populated when ABI is parsed
          inputPresets: [],
        })),
        syncStatus: 'local',
        createdAt: now,
        updatedAt: now,
      }

      const collections = this.loadCollections()
      collections.unshift(collection)
      this.saveCollections(collections)
      this.setCurrentCollectionId(collection.id)
      this.markMigrationComplete()

      return collection
    } catch (error) {
      logError(error, 'StorageService.migrateLegacyABIs')
      return null
    }
  }

  // ==========================================================================
  // Export/Import Methods
  // ==========================================================================

  /**
   * Export all data for backup
   */
  static exportAllData() {
    return {
      abis: this.loadABIs(),
      collections: this.loadCollections(),
      currentABIId: this.loadCurrentABIId(),
      currentCollectionId: this.getCurrentCollectionId(),
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
    }
  }

  /**
   * Import data from backup
   */
  static importAllData(data: ReturnType<typeof StorageService.exportAllData>): boolean {
    try {
      if (data.abis) {
        this.saveABIs(data.abis)
      }
      if (data.collections) {
        this.saveCollections(data.collections)
      }
      if (data.currentABIId) {
        this.saveCurrentABIId(data.currentABIId)
      }
      if (data.currentCollectionId) {
        this.setCurrentCollectionId(data.currentCollectionId)
      }
      return true
    } catch (error) {
      logError(error, 'StorageService.importAllData')
      return false
    }
  }

  /**
   * Get storage usage information
   */
  static getUsageInfo() {
    return storage.getUsageInfo()
  }

  /**
   * Clear all application data
   */
  static clearAll(): boolean {
    return storage.clear()
  }
}

/**
 * Legacy export for backward compatibility
 */
export const storageService = StorageService
