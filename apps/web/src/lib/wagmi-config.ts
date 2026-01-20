import { http, createConfig } from 'wagmi'
import { 
  mainnet, 
  sepolia, 
  holesky,
  polygon,
  polygonAmoy,
  arbitrum,
  arbitrumNova,
  arbitrumSepolia,
  optimism,
  optimismSepolia,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  avalanche,
  avalancheFuji,
  blast,
  blastSepolia,
  linea,
  lineaSepolia,
  scroll,
  scrollSepolia,
  gnosis,
  celo,
  moonbeam,
  moonriver,
  moonbaseAlpha,
  fraxtal,
  fraxtalTestnet,
  mantle,
  mantleTestnet,
  zkSync,
  zkSyncSepoliaTestnet,
  taiko,
  taikoHekla,
} from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Custom chain type for user-added chains
export interface CustomChain {
  id: number
  name: string
  rpcUrl: string
  blockExplorer?: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

// Load custom chains from localStorage
export const loadCustomChains = (): CustomChain[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('custom-chains')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load custom chains:', error)
    return []
  }
}

// Save custom chains to localStorage
export const saveCustomChains = (chains: CustomChain[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('custom-chains', JSON.stringify(chains))
  } catch (error) {
    console.error('Failed to save custom chains:', error)
  }
}

// Convert custom chain to wagmi chain format
export const customChainToWagmiChain = (chain: CustomChain) => ({
  id: chain.id,
  name: chain.name,
  nativeCurrency: chain.nativeCurrency,
  rpcUrls: {
    default: { http: [chain.rpcUrl] },
    public: { http: [chain.rpcUrl] },
  },
  blockExplorers: chain.blockExplorer
    ? {
        default: { name: 'Explorer', url: chain.blockExplorer },
      }
    : undefined,
})

// Default chains - organized by network
export const defaultChains = [
  // Ethereum
  mainnet,
  sepolia,
  holesky,
  
  // L2s - Arbitrum
  arbitrum,
  arbitrumNova,
  arbitrumSepolia,
  
  // L2s - Optimism
  optimism,
  optimismSepolia,
  
  // L2s - Base
  base,
  baseSepolia,
  
  // Polygon
  polygon,
  polygonAmoy,
  
  // BNB Chain
  bsc,
  bscTestnet,
  
  // Avalanche
  avalanche,
  avalancheFuji,
  
  // Blast
  blast,
  blastSepolia,
  
  // Linea
  linea,
  lineaSepolia,
  
  // Scroll
  scroll,
  scrollSepolia,
  
  // Other L1/L2
  gnosis,
  celo,
  
  // Moonbeam
  moonbeam,
  moonriver,
  moonbaseAlpha,
  
  // Fraxtal
  fraxtal,
  fraxtalTestnet,
  
  // Mantle
  mantle,
  mantleTestnet,
  
  // zkSync
  zkSync,
  zkSyncSepoliaTestnet,
  
  // Taiko
  taiko,
  taikoHekla,
]

// Create wagmi config with dynamic chains
export const createWagmiConfig = (customChains: CustomChain[] = []) => {
  const allChains = [
    ...defaultChains,
    ...customChains.map(customChainToWagmiChain),
  ]

  return createConfig({
    chains: allChains as any,
    connectors: [
      injected(),
    ],
    transports: allChains.reduce(
      (acc, chain) => ({
        ...acc,
        [chain.id]: http(),
      }),
      {}
    ),
  })
}

// Initial config
export const config = createWagmiConfig(loadCustomChains())

