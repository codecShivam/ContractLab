import { useState, useEffect, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FileText, X, GripVertical, Copy, Check } from 'lucide-react'
import { Tooltip } from './Tooltip'
import type { SavedABI } from '../types/contract-ide.types'
import theme from '../theme'

interface ABITabProps {
  abi: SavedABI
  isActive: boolean
  onClick: () => void
  onClose: (e: React.MouseEvent) => void
  onRename: (newName: string) => void
}

export function ABITab({ abi, isActive, onClick, onClose, onRename }: ABITabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(abi.name)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Check if the name is a contract address (0x followed by 40 hex chars)
  const isContractAddress = /^0x[a-fA-F0-9]{40}$/.test(abi.name)
  
  // Display shortened version for contract addresses
  const displayName = isContractAddress 
    ? `${abi.name.slice(0, 6)}...${abi.name.slice(-4)}`
    : abi.name

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: abi.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditName(abi.name)
  }

  const handleBlur = () => {
    if (editName.trim() && editName !== abi.name) {
      onRename(editName.trim())
    } else {
      setEditName(abi.name)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditName(abi.name)
      setIsEditing(false)
    }
  }
  
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(abi.name)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className="group flex items-center gap-1 px-2.5 h-full transition-all relative"
      onMouseEnter={(e) => {
        if (!isActive && !isDragging) {
          e.currentTarget.style.backgroundColor = theme.bg.hover
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 transition-opacity"
        style={{ 
          color: theme.text.tertiary,
          backgroundColor: 'transparent',
          touchAction: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = theme.text.secondary}
        onMouseLeave={(e) => e.currentTarget.style.color = theme.text.tertiary}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={12} />
      </button>

      {/* Rest of tab content */}
      <div 
        className="flex items-center gap-1.5 flex-1 min-w-0"
        style={{
          maxWidth: '180px',
          borderRight: `1px solid ${theme.border.subtle}`,
        }}
      >
        {/* File icon */}
        <FileText 
          size={12} 
          style={{ 
            color: isActive ? theme.accent.primary : theme.text.tertiary,
            flexShrink: 0
          }} 
        />

             {/* Tab name - editable */}
             {isEditing ? (
               <input
                 ref={inputRef}
                 type="text"
                 value={editName}
                 onChange={(e) => setEditName(e.target.value)}
                 onBlur={handleBlur}
                 onKeyDown={handleKeyDown}
                 className="flex-1 px-1 py-0.5 text-xs rounded focus:outline-none"
                 style={{
                   backgroundColor: theme.bg.input,
                   color: theme.text.primary,
                   border: `1px solid ${theme.accent.primary}`,
                   minWidth: 0
                 }}
                 onClick={(e) => e.stopPropagation()}
               />
             ) : (
               <Tooltip content={abi.name} delayDuration={500}>
                 <span
                   className="flex-1 text-xs truncate font-medium"
                   style={{
                     color: isActive ? theme.text.primary : theme.text.secondary,
                     minWidth: 0
                   }}
                   onDoubleClick={handleDoubleClick}
                 >
                   {displayName}
                 </span>
               </Tooltip>
             )}
             
             {/* Copy button (only for contract addresses) */}
             {isContractAddress && !isEditing && (
               <Tooltip content={copied ? "Copied!" : "Copy address"} delayDuration={300}>
                 <button
                   onClick={handleCopy}
                   className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded shrink-0"
                   style={{
                     color: copied ? theme.accent.primary : theme.text.tertiary,
                     cursor: 'pointer',
                     backgroundColor: 'transparent',
                   }}
                   onMouseEnter={(e) => {
                     if (!copied) {
                       e.currentTarget.style.color = theme.accent.primary
                     }
                   }}
                   onMouseLeave={(e) => {
                     if (!copied) {
                       e.currentTarget.style.color = theme.text.tertiary
                     }
                   }}
                 >
                   {copied ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} strokeWidth={2.5} />}
                 </button>
               </Tooltip>
             )}

        {/* Close button */}
        <Tooltip content="Close tab" delayDuration={500}>
          <button
            onClick={onClose}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded shrink-0"
            style={{
              color: theme.text.tertiary,
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.text.primary
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.text.tertiary
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </Tooltip>

        {/* Active indicator - bottom line */}
        {isActive && (
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '2px',
              backgroundColor: theme.accent.primary,
            }}
          />
        )}
      </div>
    </div>
  )
}

