/**
 * Collection Settings Component
 * Modal for editing collection metadata and sharing settings
 */

import { useState, useEffect } from 'react'
import { X, Save, Globe, Lock, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { useCollection } from '../contexts'
import theme from '../theme'

interface CollectionSettingsProps {
  collectionId: string
  isOpen: boolean
  onClose: () => void
  onOpenShareDialog?: () => void
}

export function CollectionSettings({
  collectionId,
  isOpen,
  onClose,
  onOpenShareDialog,
}: CollectionSettingsProps) {
  const { collections, updateCollection, syncToCloud } = useCollection()

  const collection = collections.find((c) => c.id === collectionId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load collection data when opening
  useEffect(() => {
    if (collection && isOpen) {
      setName(collection.name)
      setDescription(collection.description || '')
      setIsPublic(collection.isPublic)
    }
  }, [collection, isOpen])

  if (!isOpen || !collection) return null

  const handleSave = async () => {
    setIsSaving(true)
    const success = updateCollection(collectionId, {
      name: name.trim() || collection.name,
      description: description.trim() || undefined,
      isPublic,
    })

    if (success) {
      // Small delay to show saving state
      await new Promise((r) => setTimeout(r, 300))
    }
    setIsSaving(false)
    onClose()
  }

  const handleSync = async () => {
    setIsSyncing(true)
    await syncToCloud(collectionId)
    setIsSyncing(false)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: theme.bg.secondary,
          border: `1px solid ${theme.border.subtle}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            backgroundColor: theme.bg.tertiary,
            borderBottom: `1px solid ${theme.border.subtle}`,
          }}
        >
          <h2 style={{ color: theme.text.primary, fontSize: '18px', fontWeight: 600 }}>
            Collection Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bg.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={18} style={{ color: theme.text.tertiary }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Name */}
          <div>
            <label
              style={{
                display: 'block',
                color: theme.text.secondary,
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '6px',
              }}
            >
              Collection Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg outline-none transition-colors"
              style={{
                backgroundColor: theme.bg.input,
                border: `1px solid ${theme.border.default}`,
                color: theme.text.primary,
                fontSize: '14px',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = theme.border.focus)}
              onBlur={(e) => (e.currentTarget.style.borderColor = theme.border.default)}
            />
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: 'block',
                color: theme.text.secondary,
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '6px',
              }}
            >
              Description <span style={{ color: theme.text.tertiary }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg outline-none resize-none transition-colors"
              style={{
                backgroundColor: theme.bg.input,
                border: `1px solid ${theme.border.default}`,
                color: theme.text.primary,
                fontSize: '14px',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = theme.border.focus)}
              onBlur={(e) => (e.currentTarget.style.borderColor = theme.border.default)}
              placeholder="Add a description for this collection..."
            />
          </div>

          {/* Visibility Toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-lg"
            style={{
              backgroundColor: theme.bg.tertiary,
              border: `1px solid ${theme.border.subtle}`,
            }}
          >
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe size={20} style={{ color: theme.accent.primary }} />
              ) : (
                <Lock size={20} style={{ color: theme.text.tertiary }} />
              )}
              <div>
                <p style={{ color: theme.text.primary, fontSize: '14px', fontWeight: 500 }}>
                  {isPublic ? 'Public Collection' : 'Private Collection'}
                </p>
                <p style={{ color: theme.text.tertiary, fontSize: '12px' }}>
                  {isPublic ? 'Anyone with the link can view' : 'Only you can access this collection'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: isPublic ? theme.accent.primary : theme.bg.elevated,
              }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full transition-transform"
                style={{
                  backgroundColor: 'white',
                  left: isPublic ? '24px' : '4px',
                }}
              />
            </button>
          </div>

          {/* Sync Status */}
          <div
            className="flex items-center justify-between p-4 rounded-lg"
            style={{
              backgroundColor: theme.bg.tertiary,
              border: `1px solid ${theme.border.subtle}`,
            }}
          >
            <div className="flex items-center gap-3">
              {collection.syncStatus === 'synced' ? (
                <Cloud size={20} style={{ color: theme.state.success }} />
              ) : (
                <CloudOff size={20} style={{ color: theme.text.tertiary }} />
              )}
              <div>
                <p style={{ color: theme.text.primary, fontSize: '14px', fontWeight: 500 }}>
                  Cloud Sync
                </p>
                <p style={{ color: theme.text.tertiary, fontSize: '12px' }}>
                  {collection.syncStatus === 'synced'
                    ? 'Synced to your account'
                    : collection.syncStatus === 'pending'
                      ? 'Changes pending sync'
                      : 'Not yet synced'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing || collection.syncStatus === 'synced'}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  collection.syncStatus === 'synced' ? theme.bg.elevated : theme.accent.primary,
                color: collection.syncStatus === 'synced' ? theme.text.tertiary : 'white',
                opacity: isSyncing ? 0.7 : 1,
              }}
            >
              {isSyncing ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Syncing...
                </div>
              ) : collection.syncStatus === 'synced' ? (
                'Synced'
              ) : (
                'Sync Now'
              )}
            </button>
          </div>

          {/* Share Button (if public) */}
          {isPublic && collection.shareId && (
            <button
              onClick={() => {
                onOpenShareDialog?.()
                onClose()
              }}
              className="w-full py-3 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: theme.bg.tertiary,
                border: `1px solid ${theme.accent.primary}`,
                color: theme.accent.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.accent.primary
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.bg.tertiary
                e.currentTarget.style.color = theme.accent.primary
              }}
            >
              Configure Sharing Options
            </button>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-5 py-4"
          style={{
            backgroundColor: theme.bg.tertiary,
            borderTop: `1px solid ${theme.border.subtle}`,
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: theme.text.secondary,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bg.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: theme.accent.primary,
              color: 'white',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CollectionSettings

