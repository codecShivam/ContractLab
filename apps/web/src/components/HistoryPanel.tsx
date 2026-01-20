import { Clock, Zap, CheckCircle, XCircle, Trash2, X, RefreshCw } from 'lucide-react'
import { Tooltip } from './Tooltip'
import { useHistory, useContract } from '../contexts'
import theme from '../theme'
import type { HistoryEntry } from '../lib/history-storage'

interface HistoryPanelProps {
  onRerun: (entry: HistoryEntry) => void
}

export function HistoryPanel({ onRerun }: HistoryPanelProps) {
  const { history, handleDeleteHistory, handleClearHistory } = useHistory()
  const { historyOpen, setHistoryOpen } = useContract()

  if (!historyOpen) return null

  return (
    <div
      className="absolute top-12 right-4 w-96 max-h-96 overflow-y-auto rounded-lg z-50 p-3 space-y-2 animate-fadeIn"
      style={{
        backgroundColor: theme.bg.secondary,
        border: `1px solid ${theme.border.default}`,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold" style={{ color: theme.text.primary }}>
          Call History
        </h3>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <Tooltip content="Clear all history">
              <button
                onClick={handleClearHistory}
                className="p-1 rounded transition-colors"
                style={{ color: theme.text.tertiary }}
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
          )}
          <button
            onClick={() => setHistoryOpen(false)}
            className="p-1 rounded transition-colors"
            style={{ color: theme.text.tertiary }}
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
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-xs" style={{ color: theme.text.tertiary }}>
          No call history yet
        </div>
      ) : (
        history.slice(0, 20).map((entry) => (
          <div
            key={entry.id}
            className="p-2 rounded transition-all group"
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
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span
                  className="font-mono text-xs font-medium truncate"
                  style={{ color: theme.text.primary, fontSize: '11px' }}
                >
                  {entry.functionName}
                </span>
                {entry.status === 'success' ? (
                  <CheckCircle size={10} style={{ color: '#22c55e', flexShrink: 0 }} />
                ) : entry.status === 'failed' ? (
                  <XCircle size={10} style={{ color: '#ef4444', flexShrink: 0 }} />
                ) : null}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip content="Rerun">
                  <button
                    onClick={() => onRerun(entry)}
                    className="p-0.5 rounded transition-colors"
                    style={{ color: theme.text.tertiary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = theme.accent.primary
                      e.currentTarget.style.backgroundColor = 'rgba(112, 145, 230, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = theme.text.tertiary
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <RefreshCw size={10} />
                  </button>
                </Tooltip>
                <Tooltip content="Delete">
                  <button
                    onClick={() => handleDeleteHistory(entry.id)}
                    className="p-0.5 rounded transition-colors"
                    style={{ color: theme.text.tertiary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444'
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = theme.text.tertiary
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Trash2 size={10} />
                  </button>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: theme.text.tertiary, fontSize: '9px' }}>
              <Clock size={9} />
              {new Date(entry.timestamp).toLocaleTimeString()}
              {entry.gasUsed && (
                <>
                  <span>•</span>
                  <Zap size={9} />
                  {Number(entry.gasUsed).toLocaleString()} gas
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

