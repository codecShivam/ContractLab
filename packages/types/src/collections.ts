import { z } from 'zod'

// ============================================================================
// Collection Sync Status
// ============================================================================

export type SyncStatus = 'local' | 'synced' | 'pending'

// ============================================================================
// Input Preset Types
// ============================================================================

export interface InputPreset {
  id: string
  functionName: string
  name: string
  inputs: Record<string, string>
  isShared: boolean
}

export const inputPresetSchema = z.object({
  id: z.string(),
  functionName: z.string(),
  name: z.string().min(1),
  inputs: z.record(z.string(), z.string()),
  isShared: z.boolean().default(true),
})

// ============================================================================
// Collection Function Types
// ============================================================================

export interface CollectionFunction {
  name: string
  isShared: boolean
}

export const collectionFunctionSchema = z.object({
  name: z.string(),
  isShared: z.boolean().default(true),
})

// ============================================================================
// Collection ABI Types
// ============================================================================

export interface CollectionABI {
  id: string
  name: string
  content: string // JSON ABI string
  contractAddress?: string
  chainId?: number
  isShared: boolean
  order: number
  functions: CollectionFunction[]
  inputPresets: InputPreset[]
}

export const collectionABISchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  content: z.string(),
  contractAddress: z.string().optional(),
  chainId: z.number().optional(),
  isShared: z.boolean().default(true),
  order: z.number().default(0),
  functions: z.array(collectionFunctionSchema).default([]),
  inputPresets: z.array(inputPresetSchema).default([]),
})

// ============================================================================
// Collection Types
// ============================================================================

export interface Collection {
  id: string
  name: string
  description?: string
  isPublic: boolean
  shareId?: string
  abis: CollectionABI[]
  syncStatus: SyncStatus
  createdAt: number
  updatedAt: number
}

export const collectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  shareId: z.string().optional(),
  abis: z.array(collectionABISchema).default([]),
  syncStatus: z.enum(['local', 'synced', 'pending']).default('local'),
  createdAt: z.number(),
  updatedAt: z.number(),
})

// ============================================================================
// API Input/Output Types
// ============================================================================

// Create collection
export const createCollectionInputSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  description: z.string().optional(),
  abis: z.array(collectionABISchema).optional(),
})

export type CreateCollectionInput = z.infer<typeof createCollectionInputSchema>

// Update collection
export const updateCollectionInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
})

export type UpdateCollectionInput = z.infer<typeof updateCollectionInputSchema>

// Sync collection (from local to cloud)
export const syncCollectionInputSchema = z.object({
  localId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  abis: z.array(collectionABISchema),
})

export type SyncCollectionInput = z.infer<typeof syncCollectionInputSchema>

// Update sharing settings
export const updateSharingInputSchema = z.object({
  collectionId: z.string(),
  isPublic: z.boolean(),
  sharedAbis: z.array(z.object({
    abiId: z.string(),
    isShared: z.boolean(),
    sharedFunctions: z.array(z.object({
      name: z.string(),
      isShared: z.boolean(),
    })),
    sharedPresets: z.array(z.object({
      presetId: z.string(),
      isShared: z.boolean(),
    })),
  })),
})

export type UpdateSharingInput = z.infer<typeof updateSharingInputSchema>

// Fork collection
export const forkCollectionInputSchema = z.object({
  shareId: z.string(),
  newName: z.string().min(1).optional(),
})

export type ForkCollectionInput = z.infer<typeof forkCollectionInputSchema>

// ============================================================================
// Shared Collection View (public/filtered view)
// ============================================================================

export interface SharedCollectionABI {
  id: string
  name: string
  content: string
  contractAddress?: string
  chainId?: number
  functions: string[] // Only shared function names
  inputPresets: InputPreset[] // Only shared presets
}

export interface SharedCollection {
  id: string
  shareId: string
  name: string
  description?: string
  abis: SharedCollectionABI[]
  ownerName?: string
  createdAt: number
}

// ============================================================================
// Response Types
// ============================================================================

export interface CollectionListItem {
  id: string
  name: string
  description?: string
  isPublic: boolean
  shareId?: string
  abiCount: number
  createdAt: number
  updatedAt: number
}

export interface CollectionSyncResult {
  success: boolean
  cloudId: string
  shareId?: string
}

