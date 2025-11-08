# ContractLab Web App

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Run development server

```bash
# From root:
pnpm dev:web

# Or from this directory:
pnpm dev
```

The app will run on `http://localhost:3000`

## Using tRPC

The app is configured to communicate with the API server using tRPC.

### Demo

Visit `/demo/trpc` to see a working example with:
- Health check query
- Save collection mutation
- Form inputs with validation

## Project Structure

```
src/
├── components/       # Reusable UI components
├── integrations/     # Third-party integrations
│   └── tanstack-query/
│       └── root-provider.tsx  # tRPC + React Query provider
├── lib/             # Utilities
│   └── trpc.ts      # tRPC client setup
├── routes/          # File-based routing
│   ├── __root.tsx   # Root layout
│   ├── index.tsx    # Home page
│   └── demo/
│       ├── tanstack-query.tsx
│       └── trpc.tsx  # tRPC demo
└── main.tsx         # App entry point
```

## Building for Production

```bash
pnpm build
```

## Linting & Formatting

```bash
# Check code
pnpm check

# Format code
pnpm format

# Lint code
pnpm lint
```
