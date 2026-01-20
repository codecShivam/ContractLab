import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import type { CustomChain } from '../lib/wagmi-config'

interface ContractContextValue {
  // Wallet state
  address: string | undefined
  isConnected: boolean
  chainId: number
  chains: Array<{ id: number; name: string }>
  
  // Contract state
  contractAddress: string
  setContractAddress: (address: string) => void
  
  // Actions
  connectWallet: () => void
  disconnectWallet: () => void
  switchChain: (chainId: number) => void
  
  // UI state
  isSettingsOpen: boolean
  setIsSettingsOpen: (open: boolean) => void
  historyOpen: boolean
  setHistoryOpen: (open: boolean) => void
  fetchingABI: boolean
  setFetchingABI: (fetching: boolean) => void
  
  // Handler
  handleChainsUpdate: (chains: CustomChain[]) => void
}

const ContractContext = createContext<ContractContextValue | undefined>(undefined)

interface ContractProviderProps {
  children: ReactNode
  onLog: (type: 'info' | 'success' | 'error', message: string) => void
}

export function ContractProvider({ children, onLog }: ContractProviderProps) {
  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain: wagmiSwitchChain, chains: wagmiChains } = useSwitchChain()

  // Local state
  const [contractAddress, setContractAddress] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [fetchingABI, setFetchingABI] = useState(false)

  const connectWallet = useCallback(() => {
    if (isConnected) {
      disconnect()
      onLog('info', 'Wallet disconnected')
    } else {
      const injectedConnector = connectors.find(c => c.name === 'Injected' || c.name === 'MetaMask')
      if (injectedConnector) {
        connect({ connector: injectedConnector })
        onLog('info', 'Connecting wallet...')
      } else {
        onLog('error', 'No wallet connector found. Please install MetaMask.')
      }
    }
  }, [isConnected, disconnect, connect, connectors, onLog])

  const switchChain = useCallback((selectedChainId: number) => {
    if (wagmiSwitchChain) {
      wagmiSwitchChain({ chainId: selectedChainId })
      onLog('info', `Switched to chain ${selectedChainId}`)
    }
  }, [wagmiSwitchChain, onLog])

  const handleChainsUpdate = useCallback((customChains: CustomChain[]) => {
    onLog('success', `Updated custom chains (${customChains.length} chains)`)
  }, [onLog])

  const value: ContractContextValue = {
    address,
    isConnected,
    chainId: chainId || 1,
    chains: wagmiChains.map((chain) => ({ id: chain.id, name: chain.name })),
    contractAddress,
    setContractAddress,
    connectWallet,
    disconnectWallet: () => disconnect(),
    switchChain,
    isSettingsOpen,
    setIsSettingsOpen,
    historyOpen,
    setHistoryOpen,
    fetchingABI,
    setFetchingABI,
    handleChainsUpdate,
  }

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>
}

export function useContract() {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error('useContract must be used within ContractProvider')
  }
  return context
}

