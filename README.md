# ContractLab Web App

> **Postman for Web3** — Test, document, and share smart contract interactions with auto-generated integration code.

## Overview

**ContractLab** is a smart contract testing and integration platform for Web3 developers. Just like Postman revolutionized API testing, ContractLab simplifies blockchain development by letting you:

- **Test any smart contract** by pasting its ABI or entering a contract address
- **Execute all contract methods** (read/write) directly from your browser
- **Share collections** with frontend developers, complete with auto-generated integration code
- **Generate code snippets** for popular libraries (ethers.js, viem, wagmi)
- **Document contract interactions** for seamless team collaboration

No more writing boilerplate code just to test a function. No more copying ABIs between developers. ContractLab makes Web3 development as smooth as Web2.

### Key Features

#### 🧪 Smart Contract Testing
- **Zero Setup Testing** - Paste any ABI or contract address and start testing immediately
- **Fetch ABIs Automatically** - Enter a contract address to pull ABI from Etherscan, Polygonscan, etc.
- **Execute All Methods** - Test read and write functions with live blockchain data
- **Gas Estimation** - See real-time gas costs before sending transactions
- **Transaction History** - Track all interactions with detailed success/failure logs
- **Multi-Chain Support** - Ethereum, Polygon, BSC, Arbitrum, Optimism, Base, and more

#### 📦 Collections & Sharing (Like Postman)
- **Create Collections** - Group related contracts and test cases together
- **Share with Teams** - Generate shareable links for collections (just like Postman)
- **Auto-Generated Code** - Every collection includes integration code snippets
- **Selective Sharing** - Choose which functions and presets developers can see
- **Fork & Customize** - Import shared collections and adapt them to your needs
- **Input Presets** - Save common parameter combinations for quick testing

#### 💻 Developer Integration
- **Code Generation** - Auto-generate integration code for ethers.js, viem, and wagmi
- **Copy & Paste Ready** - Code snippets include proper types, error handling, and best practices
- **Documentation Mode** - Collections serve as live API documentation for your contracts
- **Frontend Handoff** - Share collections with frontend devs so they know exactly how to integrate
- **Version Control** - Track changes to ABIs and test scenarios over time

#### 🔐 Authentication & Workspace
- **Local-First** - Works offline, no account required for basic usage
- **OAuth Login** - Sign in with Google/GitHub to sync across devices
- **Cloud Sync** - Save collections to your account for backup and collaboration
- **Multi-ABI Tabs** - Work with multiple contracts simultaneously
- **Clean UI** - Dark-mode interface inspired by VS Code and Postman

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- MetaMask browser extension (for transaction execution)

### Installation

```bash
# From repository root
pnpm install
```

### Development

```bash
# Start the web app (from root)
pnpm dev:web

# Or from this directory
pnpm dev
```

The app runs on **http://localhost:3000**

Make sure the API server is also running for authentication and collection sync:

```bash
# From repository root
pnpm dev:api
```

## Usage

### Basic Workflow

1. **Import an ABI**
   - Paste JSON ABI manually
   - Upload a `.json` file
   - Enter a contract address to fetch ABI automatically

2. **Explore Functions**
   - Browse read and write functions in the function explorer
   - Click any function to load it in the execution panel

3. **Execute Functions**
   - Fill in function parameters (with auto-validation)
   - For read functions: click "Call" to query blockchain
   - For write functions: click "Execute" to send transaction via MetaMask

4. **Save Collections**
   - Create collections to organize related ABIs
   - Save input presets for frequently used parameters
   - Sync to cloud for backup and cross-device access

5. **Share & Collaborate**
   - Make collections public via shareable links
   - Choose which functions and presets to expose
   - Let others fork and customize your collections

## Project Structure

```
src/
├── components/          # UI components
│   ├── ABIEditorPanel.tsx
│   ├── FunctionExplorer.tsx
│   ├── ConsolePanel.tsx
│   ├── HistoryPanel.tsx
│   └── TopBar.tsx
├── contexts/           # React contexts for state management
│   ├── ABIContext.tsx
│   ├── ContractContext.tsx
│   ├── ConsoleContext.tsx
│   ├── FunctionExplorerContext.tsx
│   ├── HistoryContext.tsx
│   └── CollectionContext.tsx
├── hooks/              # Custom React hooks
│   ├── useABIStorage.ts
│   ├── useContractIDE.ts
│   └── useConsole.ts
├── lib/                # Core utilities
│   ├── abi-parser.ts
│   ├── gas-estimator.ts
│   └── history-storage.ts
├── services/           # Business logic
│   ├── contract.service.ts
│   ├── storage.service.ts
│   └── etherscan.service.ts
├── types/              # TypeScript definitions
├── routes/             # TanStack Router pages
│   └── index.tsx       # Main IDE interface
└── main.tsx            # App entry point
```

## Technology Stack

- **Frontend Framework**: React 18 + TypeScript
- **Routing**: TanStack Router (file-based)
- **Styling**: CSS-in-JS with custom theme system
- **State Management**: React Context + Hooks
- **API Client**: tRPC with React Query
- **Blockchain**: Viem + wagmi
- **Build Tool**: Vite
- **Authentication**: Auth.js (OAuth)

## Building for Production

```bash
# Build the app
pnpm build

# Preview production build
pnpm preview
```

## Code Quality

```bash
# Type check
pnpm typecheck

# Lint with Biome
pnpm lint

# Format code
pnpm format

# Run all checks
pnpm check
```

## Architecture Documentation

For detailed technical documentation, see:

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and patterns
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints and tRPC procedures

## Contributing

ContractLab is built with modern development practices:

- **Type Safety**: Full TypeScript coverage
- **Local-First**: Works offline, syncs when online
- **Modular Design**: Context-based state management
- **Clean Code**: Biome linting + formatting
- **Performance**: Optimized with React.memo and lazy loading

## License

MIT
