# @contractlab/db

Database layer for ContractLab using Drizzle ORM and PostgreSQL.

## Setup

### Environment Variables

Create a `.env` file in the root of the project:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/contractlab
```

### Install Dependencies

```bash
pnpm install
```

## Usage

### In other packages

Add as a workspace dependency:

```json
{
  "dependencies": {
    "@contractlab/db": "workspace:*"
  }
}
```

Import database client and schema:

```typescript
import { db, collections } from '@contractlab/db'

// Query collections
const allCollections = await db.select().from(collections)

// Insert a new collection
await db.insert(collections).values({
  name: 'My Collection',
  data: { contracts: [] }
})
```

## Database Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Push schema directly to database (dev)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## Schema

Currently includes:

### `collections` table
- `id` - Serial primary key
- `name` - Text (required)
- `data` - JSON (required)
- `createdAt` - Timestamp with default now()

## Development

```bash
# Build the package
pnpm build

# Watch mode for development
pnpm dev
```

## Adding New Tables

1. Define your table in `src/schema.ts`:

```typescript
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  address: text('address').notNull(),
  abi: json('abi').notNull(),
  chainId: integer('chain_id').notNull(),
})
```

2. Generate migration:

```bash
pnpm db:generate
```

3. Push to database:

```bash
pnpm db:push
```

4. Rebuild the package:

```bash
pnpm build
```

