# @contractlab/types

Shared TypeScript types and Zod schemas for ContractLab monorepo.

## Usage

### In other packages

Add as a workspace dependency:

```json
{
  "dependencies": {
    "@contractlab/types": "workspace:*"
  }
}
```

Import schemas and types:

```typescript
import { contractSchema, type ContractInput, collectionSchema } from '@contractlab/types'

## Development

```bash
# Build the package
pnpm build

# Watch mode for development
pnpm dev
```

## Adding new schemas

1. Create a new file in `src/` (e.g., `src/user.ts`)
2. Define your schemas and types
3. Export from `src/index.ts`
4. Run `pnpm build`

