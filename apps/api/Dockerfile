# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN npm install -g pnpm@10.8.1
RUN pnpm install --frozen-lockfile

# Build shared packages
RUN pnpm --filter=@contractlab/types build
RUN pnpm --filter=@contractlab/db build

# Build API
RUN pnpm --filter=api build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/node_modules ./node_modules

# Install only production dependencies
RUN npm install -g pnpm@10.8.1

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["node", "dist/index.js"]