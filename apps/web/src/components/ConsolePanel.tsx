import { Terminal, Trash2, CheckCircle, XCircle, ChevronRight, Package } from 'lucide-react'
import { Tooltip } from './Tooltip'
import { useConsoleContext } from '../contexts'
import theme from '../theme'

export function ConsolePanel() {
  const {
    consoleLogs: logs,
    consoleOpen: isOpen,
    consoleRef,
    toggleConsole: onToggle,
    clearConsole: onClear
  } = useConsoleContext()
  return (
    <>
      <div className="h-9 flex items-center px-3 justify-between shrink-0" style={{ backgroundColor: theme.bg.secondary, borderBottom: `1px solid ${theme.console.border}` }}>
        <div className="flex items-center gap-2">
          <Tooltip content={isOpen ? "Collapse console" : "Expand console"}>
            <button
              onClick={onToggle}
              className="p-1 rounded transition-colors flex items-center"
              style={{ color: theme.text.tertiary, cursor: 'pointer', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.text.primary
                e.currentTarget.style.backgroundColor = theme.bg.hover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.text.tertiary
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Terminal size={14} />
            </button>
          </Tooltip>
          
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: theme.text.secondary }}>
            Console
          </span>
          
          {logs.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
              backgroundColor: 'rgba(112, 145, 230, 0.15)', 
              color: theme.accent.primary,
              fontFamily: 'monospace',
              fontSize: '10px'
            }}>
              {logs.length}
            </span>
          )}

          {isOpen && logs.length > 0 && (
            <Tooltip content="Clear all logs (Ctrl+K)">
              <button
                onClick={onClear}
                className="p-1 ml-1 rounded transition-colors flex items-center"
                style={{ color: theme.text.tertiary, backgroundColor: 'transparent', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.text.secondary
                  e.currentTarget.style.backgroundColor = theme.bg.hover
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
        </div>

        {isOpen && (
          <div className="flex items-center gap-2 text-xs" style={{ color: theme.text.tertiary }}>
            <span className="font-mono" style={{ fontSize: '10px', opacity: 0.7 }}>
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        )}
      </div>

      {isOpen && (
        <div
          ref={consoleRef}
          className="flex-1 overflow-y-auto font-mono text-xs"
          style={{ backgroundColor: theme.console.bg }}
        >
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Terminal className="w-12 h-12 opacity-30" style={{ color: theme.console.icon }} />
                </div>
                <p style={{ color: theme.console.text }}>
                  No logs yet. Execute a function to see output.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {logs.map((log, index) => (
                <div
                  key={log.id}
                  className="group flex items-start gap-2 px-3 py-1.5 hover:bg-opacity-50 transition-colors relative"
                  style={{ 
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                    borderLeft: `2px solid ${
                      log.type === 'error' ? theme.console.errorIcon :
                      log.type === 'success' ? theme.console.successIcon :
                      log.type === 'result' ? theme.accent.primary :
                      'transparent'
                    }`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  {/* Timestamp */}
                  <span 
                    className="text-xs shrink-0 opacity-50 select-none" 
                    style={{ 
                      color: theme.text.tertiary,
                      minWidth: '60px',
                      fontSize: '10px'
                    }}
                  >
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { 
                      hour12: false, 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}
                  </span>

                  {/* Icon */}
                  <span className="shrink-0 mt-0.5">
                    {log.type === 'error' ? (
                      <XCircle size={12} style={{ color: theme.console.errorIcon }} />
                    ) : log.type === 'success' ? (
                      <CheckCircle size={12} style={{ color: theme.console.successIcon }} />
                    ) : log.type === 'result' ? (
                      <Terminal size={12} style={{ color: theme.accent.primary }} />
                    ) : (
                      <ChevronRight size={12} style={{ color: theme.console.infoIcon, opacity: 0.5 }} />
                    )}
                  </span>

                  {/* Message */}
                  <span 
                    className="flex-1" 
                    style={{ 
                      color: log.type === 'error' ? theme.console.errorIcon :
                             log.type === 'success' ? theme.console.successIcon :
                             log.type === 'result' ? theme.text.primary :
                             theme.console.text
                    }}
                  >
                    {log.message}
                  </span>

                  {/* Copy button */}
                  <Tooltip content="Copy to clipboard">
                    <button
                      onClick={() => navigator.clipboard.writeText(log.message)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded shrink-0"
                      style={{ 
                        color: theme.text.tertiary, 
                        backgroundColor: 'transparent',
                        cursor: 'pointer'
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
                      <Package size={11} />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

