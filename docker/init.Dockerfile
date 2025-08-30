# ---- Create Base Image ----

FROM node:22-slim AS base
	
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

FROM base AS builder
WORKDIR /app

RUN npm install -g turbo@^2

# ---- Create Pruned Monorepo ----

COPY package.json pnpm-lock.yaml turbo.json ./
COPY apps/migration/package.json ./apps/migration/

COPY . .
RUN turbo prune @tyl/migration --docker

# ---- Install and build ----
 
FROM base AS installer
WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@tyl/migration...
RUN pnpm run zero:generate-migration

# ---- Create Runner and Start ----

FROM base AS runner
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs tylrunner

COPY --from=installer --chown=tylrunner:nodejs /app/apps/migration/dist ./dist
COPY --from=installer --chown=tylrunner:nodejs /app/packages/db/drizzle ./drizzle
COPY --from=installer --chown=tylrunner:nodejs /app/zero-permissions.sql ./zero-permissions.sql

USER tylrunner
CMD ["node", "./dist/index.cjs"]
 