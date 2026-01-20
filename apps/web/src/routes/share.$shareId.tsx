/**
 * Shared Collection View Page
 * Public page for viewing shared collections
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Folder,
  FileJson,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  GitFork,
  Loader2,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react'
import { trpc } from '../lib/trpc-client'
import theme from '../theme'

export const Route = createFileRoute('/share/$shareId')({
  component: SharedCollectionPage,
})

function SharedCollectionPage() {
  const { shareId } = Route.useParams()
  const [expandedAbis, setExpandedAbis] = useState<Set<string>>(new Set())
  const [copiedAbi, setCopiedAbi] = useState<string | null>(null)
  const [isForking, setIsForking] = useState(false)

  // Fetch shared collection
  const { data: collection, isLoading, error } = trpc.collections.getShared.useQuery({ shareId })
  const forkMutation = trpc.collections.fork.useMutation()

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

  const handleCopyAbi = async (abiId: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedAbi(abiId)
    setTimeout(() => setCopiedAbi(null), 2000)
  }

  const handleFork = async () => {
    setIsForking(true)
    try {
      const result = await forkMutation.mutateAsync({ shareId })
      if (result.success) {
        // Navigate to the IDE with the forked collection
        window.location.href = `/contract-ide?collection=${result.id}`
      }
    } catch (error) {
      console.error('Fork failed:', error)
      alert('Please log in to fork this collection')
    } finally {
      setIsForking(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg.primary }}
      >
        <div className="text-center">
          <Loader2
            size={40}
            className="animate-spin mx-auto mb-4"
            style={{ color: theme.accent.primary }}
          />
          <p style={{ color: theme.text.secondary }}>Loading collection...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !collection) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg.primary }}
      >
        <div
          className="text-center p-8 rounded-xl max-w-md"
          style={{
            backgroundColor: theme.bg.secondary,
            border: `1px solid ${theme.border.subtle}`,
          }}
        >
          <AlertCircle
            size={48}
            style={{ color: theme.state.error, margin: '0 auto 16px' }}
          />
          <h1
            style={{ color: theme.text.primary, fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}
          >
            Collection Not Found
          </h1>
          <p style={{ color: theme.text.secondary, marginBottom: '24px' }}>
            This collection may have been deleted or made private by its owner.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: theme.accent.primary,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg.primary }}>
      {/* Header */}
      <div
        className="border-b"
        style={{
          backgroundColor: theme.bg.secondary,
          borderColor: theme.border.subtle,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Folder size={28} style={{ color: theme.accent.primary }} />
                <h1 style={{ color: theme.text.primary, fontSize: '28px', fontWeight: 700 }}>
                  {collection.name}
                </h1>
              </div>

              {collection.description && (
                <p
                  style={{ color: theme.text.secondary, fontSize: '15px', marginBottom: '16px' }}
                >
                  {collection.description}
                </p>
              )}

              <div className="flex items-center gap-4">
                {collection.ownerName && (
                  <div className="flex items-center gap-2">
                    <User size={14} style={{ color: theme.text.tertiary }} />
                    <span style={{ color: theme.text.tertiary, fontSize: '13px' }}>
                      {collection.ownerName}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={14} style={{ color: theme.text.tertiary }} />
                  <span style={{ color: theme.text.tertiary, fontSize: '13px' }}>
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileJson size={14} style={{ color: theme.text.tertiary }} />
                  <span style={{ color: theme.text.tertiary, fontSize: '13px' }}>
                    {collection.abis.length} ABIs
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFork}
              disabled={isForking}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: theme.accent.primary,
                color: 'white',
              }}
            >
              {isForking ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Forking...
                </>
              ) : (
                <>
                  <GitFork size={18} />
                  Fork Collection
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ABI List */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2
          style={{
            color: theme.text.primary,
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '16px',
          }}
        >
          ABIs in this Collection
        </h2>

        <div className="space-y-4">
          {collection.abis.map((abi) => {
            const isExpanded = expandedAbis.has(abi.id)

            return (
              <div
                key={abi.id}
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: theme.bg.secondary,
                  border: `1px solid ${theme.border.subtle}`,
                }}
              >
                {/* ABI Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => toggleAbiExpanded(abi.id)}
                  style={{
                    backgroundColor: isExpanded ? theme.bg.tertiary : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown size={18} style={{ color: theme.text.tertiary }} />
                    ) : (
                      <ChevronRight size={18} style={{ color: theme.text.tertiary }} />
                    )}
                    <FileJson size={20} style={{ color: theme.accent.primary }} />
                    <div>
                      <p style={{ color: theme.text.primary, fontSize: '15px', fontWeight: 500 }}>
                        {abi.name}
                      </p>
                      <p style={{ color: theme.text.tertiary, fontSize: '12px' }}>
                        {abi.functions.length} functions
                        {abi.contractAddress && ` • ${abi.contractAddress.slice(0, 10)}...`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyAbi(abi.id, abi.content)
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        backgroundColor: copiedAbi === abi.id ? theme.state.success : theme.bg.tertiary,
                        color: copiedAbi === abi.id ? 'white' : theme.text.secondary,
                      }}
                    >
                      {copiedAbi === abi.id ? <Check size={14} /> : <Copy size={14} />}
                      <span className="text-sm">{copiedAbi === abi.id ? 'Copied!' : 'Copy ABI'}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div
                    className="px-5 pb-5"
                    style={{ borderTop: `1px solid ${theme.border.subtle}` }}
                  >
                    {/* Functions */}
                    {abi.functions.length > 0 && (
                      <div className="mt-4">
                        <p
                          style={{
                            color: theme.text.secondary,
                            fontSize: '13px',
                            fontWeight: 500,
                            marginBottom: '12px',
                          }}
                        >
                          Available Functions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {abi.functions.map((funcName: string) => (
                            <span
                              key={funcName}
                              className="px-3 py-1.5 rounded-lg text-sm"
                              style={{
                                backgroundColor: theme.bg.tertiary,
                                color: theme.text.primary,
                                border: `1px solid ${theme.border.subtle}`,
                              }}
                            >
                              {funcName}()
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input Presets */}
                    {abi.inputPresets.length > 0 && (
                      <div className="mt-4">
                        <p
                          style={{
                            color: theme.text.secondary,
                            fontSize: '13px',
                            fontWeight: 500,
                            marginBottom: '12px',
                          }}
                        >
                          Saved Input Presets
                        </p>
                        <div className="grid gap-2">
                          {abi.inputPresets.map((preset: { id: string; name: string; functionName: string; inputs: Record<string, string> }) => (
                            <div
                              key={preset.id}
                              className="px-4 py-3 rounded-lg"
                              style={{
                                backgroundColor: theme.bg.tertiary,
                                border: `1px solid ${theme.border.subtle}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  style={{
                                    color: theme.text.primary,
                                    fontSize: '14px',
                                    fontWeight: 500,
                                  }}
                                >
                                  {preset.name}
                                </span>
                                <span style={{ color: theme.text.tertiary, fontSize: '12px' }}>
                                  {preset.functionName}()
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(preset.inputs).map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="px-2 py-1 rounded text-xs"
                                    style={{
                                      backgroundColor: theme.bg.input,
                                      color: theme.text.secondary,
                                    }}
                                  >
                                    {key}: {String(value).slice(0, 20)}
                                    {String(value).length > 20 && '...'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Use in IDE Button */}
                    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${theme.border.subtle}` }}>
                      <Link
                        to="/contract-ide"
                        search={{ abi: abi.content, chain: abi.chainId, address: abi.contractAddress }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: theme.bg.tertiary,
                          color: theme.accent.primary,
                          border: `1px solid ${theme.accent.primary}`,
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={14} />
                        Open in Contract IDE
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

