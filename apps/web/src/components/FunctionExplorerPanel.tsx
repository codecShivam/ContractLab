import { BookOpen, DollarSign, Edit3, Search, FileText, X } from 'lucide-react'
import { FunctionList } from './FunctionList'
import { Tooltip } from './Tooltip'
import { useFunctionExplorer } from '../contexts'
import theme from '../theme'
import type { AbiFunction } from 'viem'

interface FunctionExplorerPanelProps {
  allReadFunctions: AbiFunction[]
  allWriteFunctions: AbiFunction[]
  allPayableFunctions: AbiFunction[]
  isValid: boolean
  error?: string
  onLoadExample: () => void
  onCall: (fn: AbiFunction) => void
  filterFunctions: (functions: AbiFunction[], searchQuery: string, pinnedFunctions: Set<string>) => AbiFunction[]
  sortFunctions: (functions: AbiFunction[], pinnedFunctions: Set<string>) => AbiFunction[]
}

export function FunctionExplorerPanel({
  allReadFunctions,
  allWriteFunctions,
  allPayableFunctions,
  isValid,
  error,
  onLoadExample,
  onCall,
  filterFunctions,
  sortFunctions
}: FunctionExplorerPanelProps) {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    pinnedFunctions
  } = useFunctionExplorer()

  const readFunctions = sortFunctions(filterFunctions(allReadFunctions, searchQuery, pinnedFunctions), pinnedFunctions)
  const writeFunctions = sortFunctions(filterFunctions(allWriteFunctions, searchQuery, pinnedFunctions), pinnedFunctions)
  const payableFunctions = sortFunctions(filterFunctions(allPayableFunctions, searchQuery, pinnedFunctions), pinnedFunctions)

  const currentFunctions = 
    activeTab === 'read' ? readFunctions :
    activeTab === 'write' ? writeFunctions :
    payableFunctions

  return (
    <>
      {/* Tabs */}
      <div className="h-9 flex" style={{ backgroundColor: theme.bg.secondary, borderBottom: `1px solid ${theme.border.subtle}` }}>
        <Tooltip content={`${readFunctions.length} read-only functions`}>
          <button
            onClick={() => setActiveTab('read')}
            className="px-4 text-xs font-medium transition-all relative flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: activeTab === 'read' ? theme.tab.read.activeBg : 'transparent',
              color: activeTab === 'read' ? theme.tab.read.activeText : theme.tab.read.inactiveText,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'read') {
                e.currentTarget.style.backgroundColor = theme.bg.hover
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'read') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <BookOpen size={13} />
            <span>READ</span>
            <span className="text-xs font-mono" style={{
              color: activeTab === 'read' ? theme.tab.read.activeText : theme.text.tertiary,
              opacity: 0.7
            }}>
              {readFunctions.length}
            </span>
            {activeTab === 'read' && (
              <div className="absolute bottom-0 left-0 right-0" style={{ height: '2px', backgroundColor: theme.tab.read.indicator }} />
            )}
          </button>
        </Tooltip>
        
        <Tooltip content={`${writeFunctions.length} state-changing functions`}>
          <button
            onClick={() => setActiveTab('write')}
            className="px-4 text-xs font-medium transition-all relative flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: activeTab === 'write' ? theme.tab.write.activeBg : 'transparent',
              color: activeTab === 'write' ? theme.tab.write.activeText : theme.tab.write.inactiveText,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'write') {
                e.currentTarget.style.backgroundColor = theme.bg.hover
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'write') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <Edit3 size={13} />
            <span>WRITE</span>
            <span className="text-xs font-mono" style={{
              color: activeTab === 'write' ? theme.tab.write.activeText : theme.text.tertiary,
              opacity: 0.7
            }}>
              {writeFunctions.length}
            </span>
            {activeTab === 'write' && (
              <div className="absolute bottom-0 left-0 right-0" style={{ height: '2px', backgroundColor: theme.tab.write.indicator }} />
            )}
          </button>
        </Tooltip>
        
        <Tooltip content={`${payableFunctions.length} payable functions`}>
          <button
            onClick={() => setActiveTab('payable')}
            className="px-4 text-xs font-medium transition-all relative flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: activeTab === 'payable' ? theme.tab.payable.activeBg : 'transparent',
              color: activeTab === 'payable' ? theme.tab.payable.activeText : theme.tab.payable.inactiveText,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'payable') {
                e.currentTarget.style.backgroundColor = theme.bg.hover
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'payable') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <DollarSign size={13} />
            <span>PAYABLE</span>
            <span className="text-xs font-mono" style={{
              color: activeTab === 'payable' ? theme.tab.payable.activeText : theme.text.tertiary,
              opacity: 0.7
            }}>
              {payableFunctions.length}
            </span>
            {activeTab === 'payable' && (
              <div className="absolute bottom-0 left-0 right-0" style={{ height: '2px', backgroundColor: theme.tab.payable.indicator }} />
            )}
          </button>
        </Tooltip>
      </div>

      {/* Search Bar */}
      {isValid && (
        <div className="px-3 pt-2 pb-2">
          <div className="relative">
            <Search 
              size={14} 
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" 
              style={{ color: theme.text.tertiary }} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search functions..."
              className="w-full pl-8 pr-3 py-1.5 rounded text-xs font-mono focus:outline-none transition-all"
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
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
                style={{ color: theme.text.tertiary, backgroundColor: 'transparent', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.text.primary
                  e.currentTarget.style.backgroundColor = theme.bg.hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.text.tertiary
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Function List */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {!isValid ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 max-w-sm px-4">
              <div className="flex justify-center mb-2">
                <FileText className="w-12 h-12 opacity-30" style={{ color: theme.text.tertiary }} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1.5" style={{ color: theme.text.secondary }}>No ABI Loaded</p>
                <p className="text-xs leading-relaxed" style={{ color: theme.text.tertiary }}>
                  {error || 'Paste or upload a contract ABI to explore functions'}
                </p>
              </div>
              <button
                onClick={onLoadExample}
                className="text-xs transition-colors px-3 py-1.5 rounded"
                style={{ 
                  color: theme.accent.primary,
                  backgroundColor: 'rgba(112, 145, 230, 0.1)',
                  cursor: 'pointer',
                  border: `1px solid ${theme.accent.primary}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(112, 145, 230, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(112, 145, 230, 0.1)'
                }}
              >
                Load Example ABI
              </button>
            </div>
          </div>
        ) : (
          currentFunctions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3 px-4">
                <div className="flex justify-center">
                  <Search className="w-12 h-12 opacity-30" style={{ color: theme.text.tertiary }} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                    No {activeTab} functions
                  </p>
                  <p className="text-xs" style={{ color: theme.text.tertiary }}>
                    This ABI has no {activeTab} functions
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <FunctionList
              functions={currentFunctions}
              onCall={onCall}
              type={activeTab}
            />
          )
        )}
      </div>
    </>
  )
}
