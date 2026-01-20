import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import theme from '../theme'

interface Chain {
  id: number
  name: string
}

interface ChainSelectorProps {
  chains: Chain[]
  selectedChainId: number
  onChainChange: (chainId: number) => void
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  chains,
  selectedChainId,
  onChainChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedChain = chains.find((c) => c.id === selectedChainId)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-3 rounded text-sm focus:outline-none flex items-center justify-between gap-2 min-w-[160px] transition-all"
        style={{
          backgroundColor: isOpen ? theme.bg.elevated : theme.bg.input,
          border: `1px solid ${isOpen ? theme.accent.primary : theme.border.default}`,
          color: theme.text.primary,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = theme.border.focus
            e.currentTarget.style.backgroundColor = theme.bg.hover
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = theme.border.default
            e.currentTarget.style.backgroundColor = theme.bg.input
          }
        }}
      >
        <span className="flex-1 text-left truncate text-xs font-medium">
          {selectedChain?.name || 'Select Chain'}
        </span>
        <ChevronDown
          size={12}
          style={{
            color: theme.text.tertiary,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-full rounded-lg shadow-2xl overflow-hidden z-50 animate-fadeIn"
          style={{
            backgroundColor: theme.bg.elevated,
            border: `1px solid ${theme.border.default}`,
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {chains.map((chain) => {
            const isSelected = chain.id === selectedChainId

            return (
              <button
                key={chain.id}
                onClick={() => {
                  onChainChange(chain.id)
                  setIsOpen(false)
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center justify-between transition-colors"
                style={{
                  backgroundColor: isSelected ? theme.bg.tertiary : 'transparent',
                  color: isSelected ? theme.text.primary : theme.text.secondary,
                  cursor: 'pointer',
                  fontWeight: isSelected ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = theme.bg.hover
                    e.currentTarget.style.color = theme.text.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = theme.text.secondary
                  }
                }}
              >
                <span className="truncate">{chain.name}</span>
                {isSelected && (
                  <Check
                    size={12}
                    style={{ color: theme.accent.primary, flexShrink: 0 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

