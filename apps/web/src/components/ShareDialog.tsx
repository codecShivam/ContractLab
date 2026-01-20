/**
 * Share Dialog Component
 * Configure granular sharing options for a collection
 */

import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Link,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { useCollection } from '../contexts'
import { trpc } from '../lib/trpc-client'
import theme from '../theme'

interface ShareDialogProps {
  collectionId: string
  isOpen: boolean
  onClose: () => void
}

interface ABISharingState {
  id: string
  isShared: boolean
  functions: { name: string; isShared: boolean }[]
  presets: { id: string; isShared: boolean }[]
}

export function ShareDialog({ collectionId, isOpen, onClose }: ShareDialogProps) {
  const { collections, updateCollection } = useCollection()
  const updateSharingMutation = trpc.collections.updateSharing.useMutation()

  const collection = collections.find((c) => c.id === collectionId)

  const [expandedAbis, setExpandedAbis] = useState<Set<string>>(new Set())
  const [sharingState, setSharingState] = useState<ABISharingState[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Initialize sharing state from collection
  useEffect(() => {
    if (collection && isOpen) {
      setSharingState(
        collection.abis.map((abi) => ({
          id: abi.id,
          isShared: abi.isShared,
          functions: abi.functions.map((f) => ({ name: f.name, isShared: f.isShared })),
          presets: abi.inputPresets.map((p) => ({ id: p.id, isShared: p.isShared })),
        }))
      )
    }
  }, [collection, isOpen])

  // Calculate share URL
  const shareUrl = useMemo(() => {
    if (!collection?.shareId) return null
    return `${window.location.origin}/share/${collection.shareId}`
  }, [collection?.shareId])

  if (!isOpen || !collection) return null

  const toggleAbiExpanded = (abiId: string) => {
    setExpandedAbis((prev) => {
      const next = new Set(prev)
      if (next.has(abiId)) {
        next.delete(abiId)
      } else {
        next.add(abiId)
      }
      return next
    })
  }

  const toggleAbiShared = (abiId: string) => {
    setSharingState((prev) =>
      prev.map((abi) => {
        if (abi.id === abiId) {
          const newIsShared = !abi.isShared
          return {
            ...abi,
            isShared: newIsShared,
            // If disabling, also disable all functions and presets
            functions: abi.functions.map((f) => ({
              ...f,
              isShared: newIsShared ? f.isShared : false,
            })),
            presets: abi.presets.map((p) => ({
              ...p,
              isShared: newIsShared ? p.isShared : false,
            })),
          }
        }
        return abi
      })
    )
  }

  const toggleFunctionShared = (abiId: string, funcName: string) => {
    setSharingState((prev) =>
      prev.map((abi) => {
        if (abi.id === abiId) {
          return {
            ...abi,
            functions: abi.functions.map((f) =>
              f.name === funcName ? { ...f, isShared: !f.isShared } : f
            ),
          }
        }
        return abi
      })
    )
  }

  const togglePresetShared = (abiId: string, presetId: string) => {
    setSharingState((prev) =>
      prev.map((abi) => {
        if (abi.id === abiId) {
          return {
            ...abi,
            presets: abi.presets.map((p) =>
              p.id === presetId ? { ...p, isShared: !p.isShared } : p
            ),
          }
        }
        return abi
      })
    )
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Update sharing via API
      await updateSharingMutation.mutateAsync({
        collectionId: collection.id,
        isPublic: collection.isPublic,
        sharedAbis: sharingState.map((abi) => ({
          abiId: abi.id,
          isShared: abi.isShared,
          sharedFunctions: abi.functions.map((f) => ({
            name: f.name,
            isShared: f.isShared,
          })),
          sharedPresets: abi.presets.map((p) => ({
            presetId: p.id,
            isShared: p.isShared,
          })),
        })),
      })

      // Also update local state
      const updatedAbis = collection.abis.map((abi) => {
        const state = sharingState.find((s) => s.id === abi.id)
        if (state) {
          return {
            ...abi,
            isShared: state.isShared,
            functions: abi.functions.map((f) => {
              const funcState = state.functions.find((sf) => sf.name === f.name)
              return { ...f, isShared: funcState?.isShared ?? f.isShared }
            }),
            inputPresets: abi.inputPresets.map((p) => {
              const presetState = state.presets.find((sp) => sp.id === p.id)
              return { ...p, isShared: presetState?.isShared ?? p.isShared }
            }),
          }
        }
        return abi
      })

      updateCollection(collection.id, { abis: updatedAbis } as any)
      onClose()
    } catch (error) {
      console.error('Failed to save sharing settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sharedCount = sharingState.filter((a) => a.isShared).length
  const totalCount = sharingState.length

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[80vh] flex flex-col rounded-xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: theme.bg.secondary,
          border: `1px solid ${theme.border.subtle}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{
            backgroundColor: theme.bg.tertiary,
            borderBottom: `1px solid ${theme.border.subtle}`,
          }}
        >
          <div>
            <h2 style={{ color: theme.text.primary, fontSize: '18px', fontWeight: 600 }}>
              Share Collection
            </h2>
            <p style={{ color: theme.text.tertiary, fontSize: '13px', marginTop: '2px' }}>
              {collection.name}
            </p>
          </div>
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

        {/* Share Link */}
        {shareUrl && (
          <div
            className="px-5 py-4 flex-shrink-0"
            style={{ borderBottom: `1px solid ${theme.border.subtle}` }}
          >
            <label
              style={{
                display: 'block',
                color: theme.text.secondary,
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '8px',
              }}
            >
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg"
                style={{
                  backgroundColor: theme.bg.input,
                  border: `1px solid ${theme.border.default}`,
                }}
              >
                <Link size={14} style={{ color: theme.text.tertiary }} />
                <span
                  className="flex-1 truncate"
                  style={{ color: theme.text.primary, fontSize: '13px' }}
                >
                  {shareUrl}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: copied ? theme.state.success : theme.accent.primary,
                  color: 'white',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: theme.bg.tertiary,
                  border: `1px solid ${theme.border.default}`,
                }}
              >
                <ExternalLink size={14} style={{ color: theme.text.secondary }} />
              </a>
            </div>
          </div>
        )}

        {/* ABI List */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-4">
            <label
              style={{
                color: theme.text.secondary,
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Select ABIs to Share
            </label>
            <span style={{ color: theme.text.tertiary, fontSize: '12px' }}>
              {sharedCount} of {totalCount} shared
            </span>
          </div>

          <div className="space-y-2">
            {collection.abis.map((abi, index) => {
              const state = sharingState[index]
              const isExpanded = expandedAbis.has(abi.id)

              return (
                <div
                  key={abi.id}
                  className="rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: theme.bg.tertiary,
                    border: `1px solid ${theme.border.subtle}`,
                  }}
                >
                  {/* ABI Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() => toggleAbiExpanded(abi.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown size={16} style={{ color: theme.text.tertiary }} />
                      ) : (
                        <ChevronRight size={16} style={{ color: theme.text.tertiary }} />
                      )}
                      <div>
                        <p
                          style={{
                            color: theme.text.primary,
                            fontSize: '14px',
                            fontWeight: 500,
                          }}
                        >
                          {abi.name}
                        </p>
                        <p style={{ color: theme.text.tertiary, fontSize: '12px' }}>
                          {abi.functions.length} functions • {abi.inputPresets.length} presets
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleAbiShared(abi.id)
                      }}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: state?.isShared ? theme.accent.primary : theme.bg.elevated,
                      }}
                    >
                      {state?.isShared ? (
                        <Eye size={16} style={{ color: 'white' }} />
                      ) : (
                        <EyeOff size={16} style={{ color: theme.text.tertiary }} />
                      )}
                    </button>
                  </div>

                  {/* ABI Details */}
                  {isExpanded && state?.isShared && (
                    <div
                      className="px-4 pb-4 pt-2"
                      style={{ borderTop: `1px solid ${theme.border.subtle}` }}
                    >
                      {/* Functions */}
                      {abi.functions.length > 0 && (
                        <div className="mb-4">
                          <p
                            style={{
                              color: theme.text.tertiary,
                              fontSize: '12px',
                              fontWeight: 500,
                              marginBottom: '8px',
                            }}
                          >
                            Functions
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {abi.functions.map((func) => {
                              const funcState = state.functions.find((f) => f.name === func.name)
                              return (
                                <button
                                  key={func.name}
                                  onClick={() => toggleFunctionShared(abi.id, func.name)}
                                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                                  style={{
                                    backgroundColor: funcState?.isShared
                                      ? theme.accent.primary
                                      : theme.bg.elevated,
                                    color: funcState?.isShared ? 'white' : theme.text.tertiary,
                                  }}
                                >
                                  {func.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Input Presets */}
                      {abi.inputPresets.length > 0 && (
                        <div>
                          <p
                            style={{
                              color: theme.text.tertiary,
                              fontSize: '12px',
                              fontWeight: 500,
                              marginBottom: '8px',
                            }}
                          >
                            Input Presets
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {abi.inputPresets.map((preset) => {
                              const presetState = state.presets.find((p) => p.id === preset.id)
                              return (
                                <button
                                  key={preset.id}
                                  onClick={() => togglePresetShared(abi.id, preset.id)}
                                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                                  style={{
                                    backgroundColor: presetState?.isShared
                                      ? theme.accent.secondary
                                      : theme.bg.elevated,
                                    color: presetState?.isShared ? 'white' : theme.text.tertiary,
                                  }}
                                >
                                  {preset.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-5 py-4 flex-shrink-0"
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
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareDialog

