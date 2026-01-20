import { History, Settings, Wallet, Download, RefreshCw } from 'lucide-react'
import { ChainSelector } from './ChainSelector'
import { ChainSettings } from './ChainSettings'
import { Tooltip } from './Tooltip'
import { useContract, useHistory } from '../contexts'
import theme from '../theme'

interface TopBarProps {
  onFetchABI: () => void
}

export function TopBar({ onFetchABI }: TopBarProps) {
  const {
    address,
    isConnected,
    chainId,
    chains,
    contractAddress,
    setContractAddress,
    connectWallet,
    switchChain,
    fetchingABI,
    isSettingsOpen,
    setIsSettingsOpen,
    historyOpen,
    setHistoryOpen,
    handleChainsUpdate
  } = useContract()

  const { history } = useHistory()

  return (
    <div className="h-12 flex items-center px-4 gap-3 shrink-0" style={{ backgroundColor: theme.bg.tertiary, borderBottom: `1px solid ${theme.border.subtle}` }}>
      <ChainSelector
        chains={chains}
        selectedChainId={chainId}
        onChainChange={switchChain}
      />

      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="Contract Address (0x...)"
          className="flex-1 h-8 px-3 rounded text-sm font-mono focus:outline-none transition-all"
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && contractAddress) {
              onFetchABI()
            }
          }}
        />

        <Tooltip content="Fetch verified ABI from block explorer" delayDuration={300}>
          <button
            onClick={onFetchABI}
            disabled={!contractAddress || fetchingABI}
            className="h-8 w-8 rounded flex items-center justify-center transition-all"
            style={{
              backgroundColor: theme.bg.input,
              border: `1px solid ${theme.border.default}`,
              color: fetchingABI ? theme.text.tertiary : theme.accent.primary,
              cursor: (!contractAddress || fetchingABI) ? 'not-allowed' : 'pointer',
              opacity: (!contractAddress || fetchingABI) ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (contractAddress && !fetchingABI) {
                e.currentTarget.style.backgroundColor = theme.bg.hover
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.input
            }}
          >
            {fetchingABI ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={connectWallet}
          className="h-8 px-3 rounded text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap"
          style={{
            backgroundColor: isConnected ? theme.accent.primary : theme.button.secondary.bg,
            color: isConnected ? '#ffffff' : theme.text.secondary,
            border: `1px solid ${isConnected ? theme.accent.primary : theme.border.default}`,
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isConnected ? theme.accent.primaryHover : theme.bg.hover
            if (!isConnected) {
              e.currentTarget.style.color = theme.text.primary
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isConnected ? theme.accent.primary : theme.button.secondary.bg
            if (!isConnected) {
              e.currentTarget.style.color = theme.text.secondary
            }
          }}
        >
          {isConnected ? (
            <>
              <div 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: '#22c55e',
                  flexShrink: 0 
                }} 
              />
              {address?.slice(0, 4)}...{address?.slice(-3)}
            </>
          ) : (
            <>
              <Wallet size={14} />
              Connect
            </>
          )}
        </button>

        <Tooltip content={`History (${history.length})`} delayDuration={300}>
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="h-8 w-8 rounded flex items-center justify-center transition-colors relative"
            style={{
              backgroundColor: historyOpen ? theme.bg.hover : theme.bg.input,
              border: `1px solid ${historyOpen ? theme.accent.primary : theme.border.default}`,
              color: historyOpen ? theme.accent.primary : theme.text.secondary,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!historyOpen) {
                e.currentTarget.style.backgroundColor = theme.bg.hover
                e.currentTarget.style.color = theme.text.primary
              }
            }}
            onMouseLeave={(e) => {
              if (!historyOpen) {
                e.currentTarget.style.backgroundColor = theme.bg.input
                e.currentTarget.style.color = theme.text.secondary
              }
            }}
          >
            <History size={16} />
            {history.length > 0 && (
              <div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                style={{
                  backgroundColor: theme.accent.primary,
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 600
                }}
              >
                {history.length > 9 ? '9+' : history.length}
              </div>
            )}
          </button>
        </Tooltip>

        <div className="relative">
          <Tooltip content="Chain Settings" delayDuration={300}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="h-8 w-8 rounded flex items-center justify-center transition-colors"
              style={{
                backgroundColor: isSettingsOpen ? theme.bg.hover : theme.bg.input,
                border: `1px solid ${isSettingsOpen ? theme.accent.primary : theme.border.default}`,
                color: isSettingsOpen ? theme.accent.primary : theme.text.secondary,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSettingsOpen) {
                  e.currentTarget.style.backgroundColor = theme.bg.hover
                  e.currentTarget.style.color = theme.text.primary
                }
              }}
              onMouseLeave={(e) => {
                if (!isSettingsOpen) {
                  e.currentTarget.style.backgroundColor = theme.bg.input
                  e.currentTarget.style.color = theme.text.secondary
                }
              }}
            >
              <Settings size={16} />
            </button>
          </Tooltip>

          <ChainSettings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onChainsUpdate={handleChainsUpdate}
          />
        </div>
      </div>
    </div>
  )
}
