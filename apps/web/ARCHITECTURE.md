# ContractLab Architecture Documentation

## 📁 Project Structure

```
apps/web/src/
├── components/        # React components
│   ├── ABIEditorPanel.tsx
│   ├── FunctionExplorerPanel.tsx
│   ├── ConsolePanel.tsx
│   ├── HistoryPanel.tsx
│   ├── TopBar.tsx
│   ├── ABITab.tsx
│   ├── FunctionList.tsx
│   ├── MonacoEditor.tsx
│   ├── Tooltip.tsx
│   ├── ChainSelector.tsx
│   ├── ChainSettings.tsx
│   ├── Header.tsx
│   ├── ContractIDEProviders.tsx
│   └── index.ts       # Barrel export
│
├── contexts/          # React Context providers
│   ├── ABIContext.tsx
│   ├── ConsoleContext.tsx
│   ├── ContractContext.tsx
│   ├── FunctionExplorerContext.tsx
│   ├── HistoryContext.tsx
│   └── index.tsx      # Barrel export
│
├── hooks/             # Custom React hooks
│   ├── useABIStorage.ts
│   ├── useConsole.ts
│   ├── useContractIDE.ts
│   ├── useFunctionManagement.ts
│   └── index.ts       # Barrel export
│
├── lib/               # Core business logic
│   ├── abi-fetcher.ts
│   ├── abi-parser.ts
│   ├── abi-utils.ts
│   ├── gas-estimator.ts
│   ├── history-storage.ts
│   ├── wagmi-config.ts
│   ├── wagmi-provider.tsx
│   └── index.ts       # Barrel export
│
├── services/          # High-level service layer
│   ├── contract.service.ts
│   ├── storage.service.ts
│   └── index.ts       # Barrel export
│
├── constants/         # Configuration constants
│   ├── api.ts
│   ├── chains.ts
│   ├── storage.ts
│   ├── ui.ts
│   └── index.ts       # Barrel export
│
├── types/             # TypeScript type definitions
│   ├── api.types.ts
│   ├── contract.types.ts
│   ├── storage.types.ts
│   ├── history.types.ts
│   ├── console.types.ts
│   ├── contract-ide.types.ts
│   └── index.ts       # Barrel export
│
├── utils/             # Utility functions
│   ├── validation.ts
│   ├── format.ts
│   ├── storage.ts
│   ├── error-handler.ts
│   └── index.ts       # Barrel export
│
└── routes/            # Application routes
    ├── __root.tsx
    ├── index.tsx
    └── contract-ide.tsx
```

## 🏗️ Architecture Layers

### 1. **Presentation Layer** (Components)
- React components for UI rendering
- Consumes data from Context API
- No direct business logic
- Focuses on user interaction and display

### 2. **State Management Layer** (Contexts + Hooks)
- React Context for global state
- Custom hooks for encapsulated logic
- Manages component state and side effects
- Provides data and actions to components

### 3. **Business Logic Layer** (Lib + Services)
- Core application logic
- API integrations
- Data transformations
- Reusable across the application

### 4. **Data Layer** (Utils + Constants)
- Utility functions
- Validation and formatting
- Configuration constants
- Type definitions

## 🔄 Data Flow

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │ consumes
       ▼
┌─────────────┐
│   Context   │
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│    Hook     │
└──────┬──────┘
       │ calls
       ▼
┌─────────────┐
│   Service   │
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│  Lib/Utils  │
└─────────────┘
```

## 🎯 Key Design Patterns

### 1. **Context API Pattern**
- Eliminates prop drilling
- Centralized state management
- Provider composition for modularity

```typescript
<ABIProvider>
  <ConsoleProvider>
    <ContractProvider>
      <App />
    </ContractProvider>
  </ConsoleProvider>
</ABIProvider>
```

### 2. **Custom Hooks Pattern**
- Encapsulates reusable logic
- Separates concerns
- Testable in isolation

```typescript
// Example: useABIStorage hook
export function useABIStorage() {
  const [savedABIs, setSavedABIs] = useState<SavedABI[]>([])
  // ... logic
  return { savedABIs, addNewABI, deleteABI, ... }
}
```

### 3. **Service Layer Pattern**
- High-level business operations
- Combines multiple lib functions
- Error handling and logging

```typescript
// Example: ContractService
export class ContractService {
  static async fetchABI(address: string, chainId: number) {
    // ... implementation
  }
}
```

### 4. **Barrel Exports Pattern**
- Cleaner imports
- Better organization
- Single source of truth

```typescript
// Instead of:
import { formatAddress } from './utils/format'
import { isValidAddress } from './utils/validation'

// Use:
import { formatAddress, isValidAddress } from './utils'
```

## 📊 State Management

### Context Providers

1. **ABIContext** - Manages ABI tabs and content
2. **ConsoleContext** - Handles console logs and output
3. **ContractContext** - Stores contract address and chain
4. **FunctionExplorerContext** - Function browser state
5. **HistoryContext** - Call history management

### Data Persistence

- **localStorage** for client-side persistence
- **Versioning** for migration support
- **Error handling** for quota issues
- **Validation** before storage

## 🔐 Type Safety

### Type Organization

- **Domain types**: contract, storage, history, etc.
- **API types**: requests, responses, errors
- **UI types**: component props, state
- **Utility types**: helper types and generics

### Type Patterns

```typescript
// Branded types for safety
type ContractAddress = string & { __brand: 'ContractAddress' }

// Discriminated unions for state
type CallStatus = 
  | { status: 'pending' }
  | { status: 'success'; data: unknown }
  | { status: 'error'; error: string }

// Utility types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
```

## 🚀 Performance Optimizations

1. **Memoization**
   - `useMemo` for expensive computations
   - `useCallback` for stable function references
   - `React.memo` for component optimization

2. **Code Splitting**
   - Lazy loading for routes
   - Dynamic imports for heavy components

3. **Storage Optimization**
   - Debounced saves
   - Compression for large data
   - Cleanup of old entries

## 🧪 Testing Strategy

### Unit Tests
- Utility functions
- Validation logic
- Formatting functions

### Integration Tests
- Custom hooks
- Service layer
- API integrations

### Component Tests
- React components
- User interactions
- State updates

## 📈 Scalability Considerations

1. **Modular Architecture** - Easy to add new features
2. **Type Safety** - Catch errors at compile time
3. **Service Layer** - Abstract complexity
4. **Error Handling** - Graceful degradation
5. **Documentation** - Maintainable codebase

## 🔧 Configuration Management

### Environment Variables
- `VITE_ETHERSCAN_API_KEY` - API authentication
- `VITE_DEFAULT_CHAIN_ID` - Default network
- Feature flags for optional features

### Constants
- API endpoints and timeouts
- Storage keys and limits
- UI configuration
- Supported chains

## 🎨 UI/UX Patterns

1. **Responsive Design** - Mobile-first approach
2. **Accessibility** - ARIA labels and keyboard navigation
3. **Error Feedback** - User-friendly error messages
4. **Loading States** - Skeleton screens and spinners
5. **Dark Mode** - Theme support

## 🔄 Data Synchronization

1. **Local State** → Context → Components
2. **Persistent State** → localStorage → Context
3. **External Data** → API → Service → Context

## 📝 Code Style Guidelines

1. **Naming Conventions**
   - PascalCase for components and types
   - camelCase for variables and functions
   - UPPER_SNAKE_CASE for constants

2. **File Organization**
   - One component per file
   - Co-locate related files
   - Barrel exports for modules

3. **Documentation**
   - JSDoc for public APIs
   - Inline comments for complex logic
   - README files for modules

## 🚦 Error Handling

1. **API Errors** - Standardized error types
2. **Validation Errors** - User feedback
3. **Storage Errors** - Graceful fallbacks
4. **Runtime Errors** - Error boundaries

## 📚 Best Practices

1. **DRY** - Don't Repeat Yourself
2. **KISS** - Keep It Simple, Stupid
3. **SOLID** - Object-oriented design principles
4. **Composition over Inheritance**
5. **Single Responsibility Principle**

## 🔮 Future Enhancements

1. **Offline Support** - Service workers
2. **Real-time Updates** - WebSocket integration
3. **Advanced Caching** - IndexedDB
4. **Analytics** - Usage tracking
5. **Multi-language** - i18n support




