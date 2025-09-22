# ---- Create Base Image ----

FROM node:22-slim AS base
	
# Also add stuff required to build @rocicorp/zero-sqlite3
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    python3 \
    make \
    g++ \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

FROM base AS builder
WORKDIR /app

RUN npm install -g turbo@^2

# ---- Create Pruned Monorepo ----

COPY package.json pnpm-lock.yaml turbo.json ./
COPY apps/server/package.json ./apps/server/

COPY . .
RUN turbo prune @tyl/server --docker

# ---- Install and build ----

FROM base AS installer
WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

# This val is included in client build, therefore we need to pass as ARG
ARG VITE_ZERO_DOMAIN
ENV VITE_ZERO_DOMAIN=$VITE_ZERO_DOMAIN
RUN pnpm turbo run build --filter=@tyl/server...

# ---- Create Runner and Start ----

FROM base AS runner
WORKDIR /app

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs tylrunner

COPY --from=installer --chown=tylrunner:nodejs /app/apps/server/.output ./output
COPY --from=installer --chown=tylrunner:nodejs /app/apps/server/.tanstack ./tanstack
COPY --from=installer --chown=tylrunner:nodejs /app/apps/server/package.json ./

USER tylrunner
CMD ["node", "./output/server/index.mjs"]