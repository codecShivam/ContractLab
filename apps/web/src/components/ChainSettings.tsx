import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import theme from '../theme'
import { Tooltip } from './Tooltip'
import type { CustomChain } from '../lib/wagmi-config'
import { loadCustomChains, saveCustomChains } from '../lib/wagmi-config'

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

interface ChainSettingsProps {
  isOpen: boolean
  onClose: () => void
  onChainsUpdate: (chains: CustomChain[]) => void
}

export const ChainSettings: React.FC<ChainSettingsProps> = ({
  isOpen,
  onClose,
  onChainsUpdate,
}) => {
  const [customChains, setCustomChains] = useState<CustomChain[]>([])
  const [isAddingChain, setIsAddingChain] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [newChain, setNewChain] = useState<CustomChain>({
    id: 0,
    name: '',
    rpcUrl: '',
    blockExplorer: '',
    nativeCurrency: {
      name: '',
      symbol: '',
      decimals: 18,
    },
  })

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setCustomChains(loadCustomChains())
      setIsAddingChain(false)
      setJustAdded(null)
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleAddChain = async () => {
    if (!newChain.name || !newChain.rpcUrl || !newChain.id) {
      return
    }

    // Add chain to wallet (MetaMask)
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${newChain.id.toString(16)}`,
              chainName: newChain.name,
              nativeCurrency: {
                name: newChain.nativeCurrency.name,
                symbol: newChain.nativeCurrency.symbol,
                decimals: newChain.nativeCurrency.decimals,
              },
              rpcUrls: [newChain.rpcUrl],
              blockExplorerUrls: newChain.blockExplorer ? [newChain.blockExplorer] : undefined,
            },
          ],
        })
      }
    } catch (error: any) {
      if (error.code === 4001) {
        // User rejected - still save to app
      } else if (error.code === -32002) {
        // Request already pending - continue
      }
    }

    const updated = [...customChains, newChain]
    setCustomChains(updated)
    saveCustomChains(updated)
    onChainsUpdate(updated)

    // Show subtle success indicator
    setJustAdded(newChain.name)
    setTimeout(() => setJustAdded(null), 2000)

    // Reset form
    setNewChain({
      id: 0,
      name: '',
      rpcUrl: '',
      blockExplorer: '',
      nativeCurrency: {
        name: '',
        symbol: '',
        decimals: 18,
      },
    })
    setIsAddingChain(false)
  }

  const handleDeleteChain = (chainId: number) => {
    const updated = customChains.filter((c) => c.id !== chainId)
    setCustomChains(updated)
    saveCustomChains(updated)
    onChainsUpdate(updated)
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-1 w-80 rounded-lg z-50 animate-fadeIn"
      style={{
        backgroundColor: theme.bg.secondary,
        border: `1px solid ${theme.border.default}`,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        maxHeight: '420px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{
          borderBottom: `1px solid ${theme.border.subtle}`,
        }}
      >
        <h3
          className="text-xs font-semibold"
          style={{ color: theme.text.primary }}
        >
          Custom Chains
        </h3>
        <button
          onClick={onClose}
          className="p-0.5 rounded transition-all"
          style={{
            color: theme.text.tertiary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.text.primary
            e.currentTarget.style.backgroundColor = theme.bg.hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.text.tertiary
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Success indicator */}
      {justAdded && (
        <div
          className="px-2.5 py-1 text-xs flex items-center gap-1.5"
          style={{
            backgroundColor: theme.bg.secondary,
            borderBottom: `1px solid ${theme.border.subtle}`,
            color: theme.text.secondary,
            fontSize: '11px'
          }}
        >
          <Check size={10} style={{ color: theme.accent.primary }} />
          <span>{justAdded} added</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {/* Add New Chain Button */}
        {!isAddingChain && (
          <button
            onClick={() => setIsAddingChain(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all mb-2.5"
            style={{
              backgroundColor: theme.accent.primary,
              color: '#ffffff',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent.primaryHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent.primary
            }}
          >
            <Plus size={13} />
            Add Chain
          </button>
        )}

        {/* Add Chain Form */}
        {isAddingChain && (
          <div
            className="p-2.5 rounded space-y-2 mb-2.5"
            style={{
              backgroundColor: theme.bg.tertiary,
              border: `1px solid ${theme.border.default}`,
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label 
                  className="block text-xs mb-0.5"
                  style={{ color: theme.text.secondary, fontSize: '10px' }}
                >
                  Chain ID
                </label>
                <input
                  type="number"
                  value={newChain.id || ''}
                  onChange={(e) =>
                    setNewChain({ ...newChain, id: Number.parseInt(e.target.value) })
                  }
                  placeholder="1"
                  className="w-full px-2 py-1 rounded text-xs transition-all focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{
                    backgroundColor: theme.bg.input,
                    color: theme.text.primary,
                    border: `1px solid ${theme.border.subtle}`,
                    fontSize: '11px'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.subtle
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-xs mb-0.5"
                  style={{ color: theme.text.secondary, fontSize: '10px' }}
                >
                  Chain Name
                </label>
                <input
                  type="text"
                  value={newChain.name}
                  onChange={(e) =>
                    setNewChain({ ...newChain, name: e.target.value })
                  }
                  placeholder="Ethereum"
                  className="w-full px-2 py-1 rounded text-xs transition-all focus:outline-none"
                  style={{
                    backgroundColor: theme.bg.input,
                    color: theme.text.primary,
                    border: `1px solid ${theme.border.subtle}`,
                    fontSize: '11px'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.subtle
                  }}
                />
              </div>
            </div>

            <div>
              <label 
                className="block text-xs mb-0.5"
                style={{ color: theme.text.secondary, fontSize: '10px' }}
              >
                RPC URL
              </label>
              <input
                type="text"
                value={newChain.rpcUrl}
                onChange={(e) =>
                  setNewChain({ ...newChain, rpcUrl: e.target.value })
                }
                placeholder="https://eth.llamarpc.com"
                className="w-full px-2 py-1 rounded text-xs transition-all focus:outline-none"
                style={{
                  backgroundColor: theme.bg.input,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border.subtle}`,
                  fontSize: '11px'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.accent.primary
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.border.subtle
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label 
                  className="block text-xs mb-0.5"
                  style={{ color: theme.text.secondary, fontSize: '10px' }}
                >
                  Symbol
                </label>
                <input
                  type="text"
                  value={newChain.nativeCurrency.symbol}
                  onChange={(e) =>
                    setNewChain({
                      ...newChain,
                      nativeCurrency: {
                        ...newChain.nativeCurrency,
                        name: e.target.value,
                        symbol: e.target.value,
                      },
                    })
                  }
                  placeholder="ETH"
                  className="w-full px-2 py-1 rounded text-xs transition-all focus:outline-none"
                  style={{
                    backgroundColor: theme.bg.input,
                    color: theme.text.primary,
                    border: `1px solid ${theme.border.subtle}`,
                    fontSize: '11px'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.subtle
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-xs mb-0.5"
                  style={{ color: theme.text.tertiary, fontSize: '10px' }}
                >
                  Explorer (opt)
                </label>
                <input
                  type="text"
                  value={newChain.blockExplorer}
                  onChange={(e) =>
                    setNewChain({ ...newChain, blockExplorer: e.target.value })
                  }
                  placeholder="etherscan.io"
                  className="w-full px-2 py-1 rounded text-xs transition-all focus:outline-none"
                  style={{
                    backgroundColor: theme.bg.input,
                    color: theme.text.primary,
                    border: `1px solid ${theme.border.subtle}`,
                    fontSize: '11px'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.subtle
                  }}
                />
              </div>
            </div>

            <div className="flex gap-1.5 pt-1">
              <button
                onClick={handleAddChain}
                disabled={!newChain.name || !newChain.rpcUrl || !newChain.id}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all"
                style={{
                  backgroundColor: theme.accent.primary,
                  color: '#ffffff',
                  cursor: newChain.name && newChain.rpcUrl && newChain.id ? 'pointer' : 'not-allowed',
                  opacity: newChain.name && newChain.rpcUrl && newChain.id ? 1 : 0.5,
                  fontSize: '11px'
                }}
                onMouseEnter={(e) => {
                  if (newChain.name && newChain.rpcUrl && newChain.id) {
                    e.currentTarget.style.backgroundColor = theme.accent.primaryHover
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary
                }}
              >
                <Check size={11} />
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingChain(false)
                  setNewChain({
                    id: 0,
                    name: '',
                    rpcUrl: '',
                    blockExplorer: '',
                    nativeCurrency: {
                      name: '',
                      symbol: '',
                      decimals: 18,
                    },
                  })
                }}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all"
                style={{
                  backgroundColor: 'transparent',
                  color: theme.text.secondary,
                  cursor: 'pointer',
                  border: `1px solid ${theme.border.default}`,
                  fontSize: '11px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.hover
                  e.currentTarget.style.color = theme.text.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = theme.text.secondary
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Custom Chains List */}
        {!isAddingChain && customChains.length === 0 ? (
          <div
            className="text-center py-8 text-xs"
            style={{ color: theme.text.tertiary }}
          >
            No custom chains
          </div>
        ) : customChains.length > 0 ? (
          <div className="space-y-1.5">
            {customChains.map((chain) => (
              <div
                key={chain.id}
                className="flex items-center justify-between p-2 rounded group transition-all"
                style={{
                  backgroundColor: theme.bg.tertiary,
                  border: `1px solid ${theme.border.subtle}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-medium truncate"
                    style={{ color: theme.text.primary, fontSize: '11px' }}
                  >
                    {chain.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-xs px-1 py-0.5 rounded"
                      style={{ 
                        backgroundColor: theme.bg.secondary,
                        color: theme.text.tertiary,
                        fontSize: '9px',
                        fontFamily: 'monospace'
                      }}
                    >
                      {chain.id}
                    </span>
                    <span
                      className="text-xs"
                      style={{ 
                        color: theme.text.tertiary,
                        fontSize: '9px'
                      }}
                    >
                      {chain.nativeCurrency.symbol}
                    </span>
                  </div>
                </div>
                <Tooltip content="Delete" delayDuration={300}>
                  <button
                    onClick={() => handleDeleteChain(chain.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all ml-1.5"
                    style={{
                      color: theme.text.tertiary,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444'
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = theme.text.tertiary
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </Tooltip>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
