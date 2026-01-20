import { useCallback, useEffect } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  Star, 
  Package, 
  BookOpen, 
  DollarSign, 
  Edit3, 
  Save 
} from 'lucide-react'
import { Tooltip } from './Tooltip'
import { useFunctionExplorer } from '../contexts'
import theme from '../theme'
import type { AbiFunction } from 'viem'

interface FunctionListProps {
  functions: AbiFunction[]
  onCall: (fn: AbiFunction) => void
  type: 'read' | 'write' | 'payable'
}

export function FunctionList({
  functions,
  onCall,
  type
}: FunctionListProps) {
  const {
    expandedFunction,
    toggleFunction: onToggle,
    inputValues,
    updateInput: onInputChange,
    pinnedFunctions,
    handleTogglePin: onTogglePin,
    lastInputValues,
    loadingFunction
  } = useFunctionExplorer()
  if (functions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm" style={{ color: theme.text.tertiary }}>
        No {type} functions found
      </div>
    )
  }

  const getButtonColor = () => {
    if (type === 'read') return { bg: theme.accent.primary, hover: theme.accent.primaryHover }
    if (type === 'payable') return { bg: theme.tab.payable.indicator, hover: theme.accent.tertiaryHover }
    return { bg: theme.accent.tertiary, hover: theme.accent.tertiaryHover }
  }

  // Auto-fill inputs when function is expanded
  useEffect(() => {
    if (expandedFunction && lastInputValues[expandedFunction]) {
      const lastValues = lastInputValues[expandedFunction]
      Object.keys(lastValues).forEach((paramName) => {
        if (!inputValues[expandedFunction]?.[paramName]) {
          onInputChange(expandedFunction, paramName, lastValues[paramName])
        }
      })
    }
  }, [expandedFunction, lastInputValues, inputValues, onInputChange])

  const copyFunctionSignature = useCallback((fn: AbiFunction) => {
    const params = fn.inputs?.map(input => `${input.type} ${input.name || ''}`).join(', ') || ''
    const signature = `${fn.name}(${params})`
    navigator.clipboard.writeText(signature)
  }, [])

  return (
    <div className="space-y-1.5">
      {functions.map((fn) => {
        const isExpanded = expandedFunction === fn.name
        const isPinned = pinnedFunctions.has(fn.name)
        const isLoading = loadingFunction === fn.name
        const inputs = fn.inputs || []

        return (
          <div 
            key={fn.name} 
            className="rounded overflow-hidden transition-all"
            style={{ 
              backgroundColor: isExpanded ? theme.bg.tertiary : 'transparent',
              border: `1px solid ${isExpanded ? theme.border.default : isPinned ? theme.border.focus : 'transparent'}`,
              borderLeftWidth: isPinned ? '2px' : '1px',
              borderLeftColor: isPinned ? theme.accent.secondary : undefined
            }}
          >
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.function-name-area')) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderRadius = ''
                  onToggle(fn.name)
                }
              }}
              className="w-full px-3 py-2.5 text-left font-mono flex items-center justify-between transition-colors group"
              style={{ 
                backgroundColor: 'transparent', 
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.backgroundColor = theme.bg.hover
                  e.currentTarget.style.borderRadius = '4px'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderRadius = ''
              }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0 function-name-area">
                {isExpanded ? (
                  <ChevronDown size={14} style={{ color: theme.text.secondary, flexShrink: 0 }} />
                ) : (
                  <ChevronRight size={14} style={{ color: theme.text.tertiary, flexShrink: 0 }} />
                )}
                {isPinned && (
                  <Star 
                    size={11} 
                    style={{ color: theme.accent.secondary, flexShrink: 0 }} 
                    fill={theme.accent.secondary}
                  />
                )}
                <span 
                  className="font-medium text-sm truncate" 
                  style={{ color: isExpanded ? theme.text.primary : theme.text.secondary }}
                >
                  {fn.name}
                </span>
                {!isExpanded && inputs.length > 0 && (
                  <span 
                    className="text-xs font-mono shrink-0" 
                    style={{ 
                      color: theme.text.tertiary,
                      opacity: 0.6,
                      fontSize: '10px'
                    }}
                  >
                    {inputs.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {isExpanded && (
                  <Tooltip content="Copy signature">
                    <button 
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      style={{ color: theme.text.tertiary, cursor: 'pointer', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = theme.text.primary
                        e.currentTarget.style.backgroundColor = theme.bg.hover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme.text.tertiary
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        copyFunctionSignature(fn)
                      }}
                    >
                      <Package size={13} />
                    </button>
                  </Tooltip>
                )}
                <Tooltip content={isPinned ? "Unpin function" : "Pin function"}>
                  <button 
                    className={`transition-opacity p-1 rounded shrink-0 ${isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    style={{ 
                      color: isPinned ? theme.accent.secondary : theme.text.tertiary, 
                      cursor: 'pointer', 
                      backgroundColor: 'transparent' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = theme.accent.secondary
                      e.currentTarget.style.backgroundColor = theme.bg.hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isPinned ? theme.accent.secondary : theme.text.tertiary
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onTogglePin(fn.name)
                    }}
                  >
                    <Star size={13} fill={isPinned ? theme.accent.secondary : 'none'} />
                  </button>
                </Tooltip>
              </div>
            </div>

            {isExpanded && (
              <div className="px-3 pb-2.5 pt-2">
                {inputs.length > 0 ? (
                  <div className="space-y-2 mb-2.5">
                    {inputs.map((input, idx) => (
                      <div key={idx}>
                        <label className="flex items-center gap-1.5 text-xs mb-1 font-mono" style={{ color: theme.text.secondary }}>
                          <span className="font-medium">{input.name || `param${idx}`}</span>
                          <span className="font-normal opacity-60" style={{ fontSize: '10px' }}>
                            {input.type}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={inputValues[fn.name]?.[input.name || ''] || ''}
                          onChange={(e) => onInputChange(fn.name, input.name || '', e.target.value)}
                          placeholder={`${input.type}`}
                          className="w-full px-2.5 py-1.5 rounded text-xs font-mono focus:outline-none transition-all"
                          style={{
                            backgroundColor: theme.bg.input,
                            border: `1px solid ${theme.border.default}`,
                            color: theme.text.primary
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = theme.accent.primary
                            e.currentTarget.style.backgroundColor = theme.bg.elevated
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = theme.border.default
                            e.currentTarget.style.backgroundColor = theme.bg.input
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex gap-1.5">
                  <button
                    onClick={() => onCall(fn)}
                    disabled={isLoading}
                    className="px-4 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    style={{ 
                      backgroundColor: isLoading ? theme.bg.hover : getButtonColor().bg, 
                      color: '#ffffff',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = getButtonColor().hover
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = getButtonColor().bg
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Loading...</span>
                      </>
                    ) : type === 'read' ? (
                      <><BookOpen size={13} /> <span>Read</span></>
                    ) : type === 'payable' ? (
                      <><DollarSign size={13} /> <span>Send</span></>
                    ) : (
                      <><Edit3 size={13} /> <span>Write</span></>
                    )}
                  </button>
                  <Tooltip content="Save call">
                    <button 
                      className="px-2 py-1.5 rounded text-xs transition-all flex items-center justify-center"
                      style={{ 
                        backgroundColor: theme.bg.tertiary, 
                        color: theme.text.secondary, 
                        cursor: 'pointer',
                        border: `1px solid ${theme.border.default}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.bg.hover
                        e.currentTarget.style.borderColor = theme.border.focus
                        e.currentTarget.style.color = theme.text.primary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.bg.tertiary
                        e.currentTarget.style.borderColor = theme.border.default
                        e.currentTarget.style.color = theme.text.secondary
                      }}
                    >
                      <Save size={13} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

