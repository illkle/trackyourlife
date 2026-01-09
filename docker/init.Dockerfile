# ---- Create Base Image ----

FROM node:24 AS base
	
# Also add stuff required to build @rocicorp/zero-sqlite3
# This is temporary until we split zero and drizzle into separate packages
#RUN apt-get update && \
#    apt-get install -y --no-install-recommends \
#    ca-certificates \
#    python3 \
#    make \
#    g++ \
#    build-essential && \
#    rm -rf /var/lib/apt/lists/*

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

# ---- Create Runner and Start ----

FROM base AS runner
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs tylrunner

COPY --from=installer --chown=tylrunner:nodejs /app/apps/migration/dist ./dist
COPY --from=installer --chown=tylrunner:nodejs /app/packages/db/drizzle ./drizzle

USER tylrunner
CMD ["node", "./dist/index.cjs"]
 