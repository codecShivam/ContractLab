# ContractLab


## Project Structure

```
contractlab/
├── apps/
│   ├── api/          # tRPC API server (Express)
│   └── web/          # React frontend (Vite + TanStack)
└── packages/
    ├── db/           # Database layer (Drizzle ORM)
    └── types/        # Shared TypeScript types & Zod schemas
```

## Tech Stack

### Backend (API)
- **tRPC** - End-to-end typesafe APIs
- **Express** - Web server
- **Drizzle ORM** - Database toolkit
- **Zod** - Schema validation (via shared types)
- **TypeScript** - Type safety

### Frontend (Web)
- **React** - UI library
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching
- **tRPC Client** - API communication
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Shared Packages
- **@contractlab/types** - Zod schemas and TypeScript types

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+

### Installation

```bash
# Install all dependencies
pnpm install

# Build shared packages
pnpm build
```

### Development

Run services in separate terminals:

```bash
# Terminal 1: API Server (http://localhost:4000)
pnpm dev:api

# Terminal 2: Web App (http://localhost:3000)
pnpm dev:web

# Terminal 3 (optional): Watch types package
pnpm dev:types
```

## Workspace Dependencies

The monorepo uses pnpm workspaces for package management:

- `apps/api` depends on:
  - `@contractlab/types` (workspace)
  
- `apps/web` depends on:
  - `@contractlab/types` (workspace)
  - `api` (workspace) - for AppRouter types

This ensures:
- ✅ Single source of truth for types
- ✅ Zod schemas defined once, used everywhere
- ✅ End-to-end type safety from DB to UI
- ✅ No duplicate dependencies

## Scripts

### Root Level

```bash
# Build Commands
pnpm build              # Build all packages and apps at once
pnpm build:packages     # Build only shared packages (types, db)
pnpm build:types        # Build only types package
pnpm build:api          # Build only API
pnpm build:web          # Build only web app

# Development Commands
pnpm dev:api            # Run API server
pnpm dev:web            # Run web app
pnpm dev:types          # Watch types package
```

### Package Level

```bash
# API (apps/api)
cd apps/api
pnpm dev            # Run dev server

# Web (apps/web)
cd apps/web
pnpm dev            # Run Vite dev server
pnpm build          # Build for production
pnpm check          # Lint + format check

# Types (packages/types)
cd packages/types
pnpm build          # Build types
pnpm dev            # Watch mode
```

## Adding New Features

### 1. Add a new schema

```typescript
// packages/types/src/user.ts
import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
})

export type User = z.infer<typeof userSchema>
```

Export from index:
```typescript
// packages/types/src/index.ts
export * from './user.js'
```

Build:
```bash
cd packages/types && pnpm build
```
