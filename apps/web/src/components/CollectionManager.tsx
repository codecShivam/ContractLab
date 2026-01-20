/**
 * Collection Manager Component
 * Dropdown for switching between collections with CRUD actions
 */

import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  Plus,
  Folder,
  FolderOpen,
  Settings,
  Trash2,
  Cloud,
  CloudOff,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { useCollection } from '../contexts'
import theme from '../theme'
import type { SyncStatus } from '@contractlab/types'

interface CollectionManagerProps {
  onOpenSettings?: (collectionId: string) => void
}

export function CollectionManager({ onOpenSettings }: CollectionManagerProps) {
  const {
    collections,
    currentCollection,
    selectCollection,
    createCollection,
    deleteCollection,
    syncToCloud,
    isLoading,
  } = useCollection()

  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCreating])

  const handleCreate = () => {
    if (newName.trim()) {
      createCollection(newName.trim())
      setNewName('')
      setIsCreating(false)
    }
  }

  const handleSync = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSyncingId(id)
    await syncToCloud(id)
    setSyncingId(null)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this collection?')) {
      deleteCollection(id)
    }
  }

  const handleSettings = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    onOpenSettings?.(id)
  }

  const getSyncIcon = (status: SyncStatus, id: string) => {
    if (syncingId === id) {
      return <Loader2 size={14} className="animate-spin" style={{ color: theme.text.tertiary }} />
    }

    switch (status) {
      case 'synced':
        return <Cloud size={14} style={{ color: theme.state.success }} />
      case 'pending':
        return <CloudOff size={14} style={{ color: theme.state.warning }} />
      default:
        return <CloudOff size={14} style={{ color: theme.text.tertiary }} />
    }
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ backgroundColor: theme.bg.secondary }}
      >
        <Loader2 size={16} className="animate-spin" style={{ color: theme.accent.primary }} />
        <span style={{ color: theme.text.secondary, fontSize: '14px' }}>Loading...</span>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isOpen ? theme.bg.elevated : theme.bg.secondary,
          border: `1px solid ${isOpen ? theme.border.focus : theme.border.subtle}`,
        }}
      >
        <FolderOpen size={16} style={{ color: theme.accent.primary }} />
        <span style={{ color: theme.text.primary, fontSize: '14px', fontWeight: 500 }}>
          {currentCollection?.name || 'No Collection'}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: theme.text.tertiary,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-72 rounded-lg overflow-hidden shadow-xl z-50"
          style={{
            backgroundColor: theme.bg.secondary,
            border: `1px solid ${theme.border.subtle}`,
          }}
        >
          {/* Collection List */}
          <div className="max-h-64 overflow-y-auto">
            {collections.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Folder size={32} style={{ color: theme.text.tertiary, margin: '0 auto 8px' }} />
                <p style={{ color: theme.text.secondary, fontSize: '14px' }}>No collections yet</p>
                <p style={{ color: theme.text.tertiary, fontSize: '12px' }}>
                  Create one to get started
                </p>
              </div>
            ) : (
              collections.map((collection) => (
                <div
                  key={collection.id}
                  onClick={() => {
                    selectCollection(collection.id)
                    setIsOpen(false)
                  }}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer transition-colors"
                  style={{
                    backgroundColor:
                      currentCollection?.id === collection.id ? theme.bg.tertiary : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (currentCollection?.id !== collection.id) {
                      e.currentTarget.style.backgroundColor = theme.bg.hover
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentCollection?.id !== collection.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {currentCollection?.id === collection.id ? (
                      <FolderOpen size={16} style={{ color: theme.accent.primary }} />
                    ) : (
                      <Folder size={16} style={{ color: theme.text.tertiary }} />
                    )}
                    <span
                      className="truncate"
                      style={{
                        color: theme.text.primary,
                        fontSize: '14px',
                        fontWeight: currentCollection?.id === collection.id ? 500 : 400,
                      }}
                    >
                      {collection.name}
                    </span>
                    <span
                      style={{
                        color: theme.text.tertiary,
                        fontSize: '12px',
                      }}
                    >
                      ({collection.abis.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {getSyncIcon(collection.syncStatus, collection.id)}

                    {collection.syncStatus !== 'synced' && (
                      <button
                        onClick={(e) => handleSync(collection.id, e)}
                        className="p-1 rounded hover:bg-opacity-20 transition-colors"
                        style={{ backgroundColor: 'transparent' }}
                        title="Sync to cloud"
                      >
                        <Cloud size={14} style={{ color: theme.text.tertiary }} />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleSettings(collection.id, e)}
                      className="p-1 rounded hover:bg-opacity-20 transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      title="Settings"
                    >
                      <Settings size={14} style={{ color: theme.text.tertiary }} />
                    </button>

                    <button
                      onClick={(e) => handleDelete(collection.id, e)}
                      className="p-1 rounded hover:bg-opacity-20 transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      title="Delete"
                    >
                      <Trash2 size={14} style={{ color: theme.state.error }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: theme.border.subtle }} />

          {/* Create New */}
          {isCreating ? (
            <div className="p-2">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') {
                      setIsCreating(false)
                      setNewName('')
                    }
                  }}
                  placeholder="Collection name..."
                  className="flex-1 px-2 py-1.5 rounded text-sm outline-none"
                  style={{
                    backgroundColor: theme.bg.input,
                    border: `1px solid ${theme.border.focus}`,
                    color: theme.text.primary,
                  }}
                />
                <button
                  onClick={handleCreate}
                  className="p-1.5 rounded transition-colors"
                  style={{ backgroundColor: theme.accent.primary }}
                  disabled={!newName.trim()}
                >
                  <Check size={14} style={{ color: 'white' }} />
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewName('')
                  }}
                  className="p-1.5 rounded transition-colors"
                  style={{ backgroundColor: theme.bg.tertiary }}
                >
                  <X size={14} style={{ color: theme.text.tertiary }} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bg.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Plus size={16} style={{ color: theme.accent.primary }} />
              <span style={{ color: theme.text.secondary, fontSize: '14px' }}>New Collection</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default CollectionManager

