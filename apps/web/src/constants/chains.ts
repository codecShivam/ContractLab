/**
 * Chain configuration constants
 * Centralized chain definitions for blockchain interactions
 */

export const SUPPORTED_CHAINS = {
  // Ethereum
  ETHEREUM_MAINNET: { id: 1, name: 'Ethereum Mainnet' },
  SEPOLIA_TESTNET: { id: 11155111, name: 'Sepolia Testnet' },
  HOLESKY_TESTNET: { id: 17000, name: 'Holesky Testnet' },
  HOODI_TESTNET: { id: 560048, name: 'Hoodi Testnet' },
  
  // Abstract
  ABSTRACT_MAINNET: { id: 2741, name: 'Abstract Mainnet' },
  ABSTRACT_SEPOLIA: { id: 11124, name: 'Abstract Sepolia Testnet' },
  
  // ApeChain
  APECHAIN_CURTIS: { id: 33111, name: 'ApeChain Curtis Testnet' },
  APECHAIN_MAINNET: { id: 33139, name: 'ApeChain Mainnet' },
  
  // Arbitrum
  ARBITRUM_NOVA: { id: 42170, name: 'Arbitrum Nova Mainnet' },
  ARBITRUM_ONE: { id: 42161, name: 'Arbitrum One Mainnet' },
  ARBITRUM_SEPOLIA: { id: 421614, name: 'Arbitrum Sepolia Testnet' },
  
  // Avalanche
  AVALANCHE_C_CHAIN: { id: 43114, name: 'Avalanche C-Chain' },
  AVALANCHE_FUJI: { id: 43113, name: 'Avalanche Fuji Testnet' },
  
  // Base
  BASE_MAINNET: { id: 8453, name: 'Base Mainnet' },
  BASE_SEPOLIA: { id: 84532, name: 'Base Sepolia Testnet' },
  
  // Berachain
  BERACHAIN_BEPOLIA: { id: 80069, name: 'Berachain Bepolia Testnet' },
  BERACHAIN_MAINNET: { id: 80094, name: 'Berachain Mainnet' },
  
  // BitTorrent
  BITTORRENT_MAINNET: { id: 199, name: 'BitTorrent Chain Mainnet' },
  BITTORRENT_TESTNET: { id: 1029, name: 'BitTorrent Chain Testnet' },
  
  // Blast
  BLAST_MAINNET: { id: 81457, name: 'Blast Mainnet' },
  BLAST_SEPOLIA: { id: 168587773, name: 'Blast Sepolia Testnet' },
  
  // BNB
  BNB_MAINNET: { id: 56, name: 'BNB Smart Chain Mainnet' },
  BNB_TESTNET: { id: 97, name: 'BNB Smart Chain Testnet' },
  
  // Celo
  CELO_MAINNET: { id: 42220, name: 'Celo Mainnet' },
  CELO_SEPOLIA: { id: 11142220, name: 'Celo Sepolia Testnet' },
  
  // Fraxtal
  FRAXTAL_MAINNET: { id: 252, name: 'Fraxtal Mainnet' },
  FRAXTAL_HOODI: { id: 2523, name: 'Fraxtal Hoodi Testnet' },
  
  // Gnosis
  GNOSIS: { id: 100, name: 'Gnosis' },
  
  // HyperEVM
  HYPEREVM_MAINNET: { id: 999, name: 'HyperEVM Mainnet' },
  
  // Katana
  KATANA_BOKUTO: { id: 737373, name: 'Katana Bokuto' },
  KATANA_MAINNET: { id: 747474, name: 'Katana Mainnet' },
  
  // Linea
  LINEA_MAINNET: { id: 59144, name: 'Linea Mainnet' },
  LINEA_SEPOLIA: { id: 59141, name: 'Linea Sepolia Testnet' },
  
  // Mantle
  MANTLE_MAINNET: { id: 5000, name: 'Mantle Mainnet' },
  MANTLE_SEPOLIA: { id: 5003, name: 'Mantle Sepolia Testnet' },
  
  // Memecore & Monad
  MEMECORE_TESTNET: { id: 43521, name: 'Memecore Testnet' },
  MONAD_TESTNET: { id: 10143, name: 'Monad Testnet' },
  
  // Moonbeam
  MOONBASE_ALPHA: { id: 1287, name: 'Moonbase Alpha Testnet' },
  MOONBEAM_MAINNET: { id: 1284, name: 'Moonbeam Mainnet' },
  MOONRIVER_MAINNET: { id: 1285, name: 'Moonriver Mainnet' },
  
  // Optimism
  OP_MAINNET: { id: 10, name: 'OP Mainnet' },
  OP_SEPOLIA: { id: 11155420, name: 'OP Sepolia Testnet' },
  
  // opBNB
  OPBNB_MAINNET: { id: 204, name: 'opBNB Mainnet' },
  OPBNB_TESTNET: { id: 5611, name: 'opBNB Testnet' },
  
  // Polygon
  POLYGON_AMOY: { id: 80002, name: 'Polygon Amoy Testnet' },
  POLYGON_MAINNET: { id: 137, name: 'Polygon Mainnet' },
  
  // Scroll
  SCROLL_MAINNET: { id: 534352, name: 'Scroll Mainnet' },
  SCROLL_SEPOLIA: { id: 534351, name: 'Scroll Sepolia Testnet' },
  
  // Sei
  SEI_MAINNET: { id: 1329, name: 'Sei Mainnet' },
  SEI_TESTNET: { id: 1328, name: 'Sei Testnet' },
  
  // Sonic
  SONIC_MAINNET: { id: 146, name: 'Sonic Mainnet' },
  SONIC_TESTNET: { id: 14601, name: 'Sonic Testnet' },
  
  // Sophon
  STABLE_TESTNET: { id: 2201, name: 'Stable Testnet' },
  SOPHON_MAINNET: { id: 50104, name: 'Sophon Mainnet' },
  SOPHON_SEPOLIA: { id: 531050104, name: 'Sophon Sepolia Testnet' },
  
  // Swellchain
  SWELLCHAIN_MAINNET: { id: 1923, name: 'Swellchain Mainnet' },
  SWELLCHAIN_TESTNET: { id: 1924, name: 'Swellchain Testnet' },
  
  // Taiko
  TAIKO_HOODI: { id: 167013, name: 'Taiko Hoodi' },
  TAIKO_MAINNET: { id: 167000, name: 'Taiko Mainnet' },
  
  // Unichain
  UNICHAIN_MAINNET: { id: 130, name: 'Unichain Mainnet' },
  UNICHAIN_SEPOLIA: { id: 1301, name: 'Unichain Sepolia Testnet' },
  
  // World
  WORLD_MAINNET: { id: 480, name: 'World Mainnet' },
  WORLD_SEPOLIA: { id: 4801, name: 'World Sepolia Testnet' },
  
  // XDC
  XDC_APOTHEM: { id: 51, name: 'XDC Apothem Testnet' },
  XDC_MAINNET: { id: 50, name: 'XDC Mainnet' },
  
  // zkSync
  ZKSYNC_MAINNET: { id: 324, name: 'zkSync Mainnet' },
  ZKSYNC_SEPOLIA: { id: 300, name: 'zkSync Sepolia Testnet' },
} as const

export type ChainId = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS]['id']

/**
 * Get chain configuration by ID
 */
export function getChainById(chainId: number) {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId)
}

/**
 * Check if a chain is supported
 */
export function isSupportedChain(chainId: number): chainId is ChainId {
  return Object.values(SUPPORTED_CHAINS).some(chain => chain.id === chainId)
}

/**
 * Get all supported chain IDs
 */
export function getAllChainIds(): number[] {
  return Object.values(SUPPORTED_CHAINS).map(chain => chain.id)
}




