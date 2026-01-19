# ---- Create Base Image ----

FROM node:24-slim AS base

# Enable corepack for pnpm (version from package.json packageManager field)
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

# ---- Prune Monorepo ----

FROM base AS builder
WORKDIR /app

RUN npm install -g turbo@^2

COPY . .
RUN turbo prune @tyl/migration --docker

# ---- Install and build ----

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@tyl/migration...

# ---- Production runner ----

FROM base AS runner
WORKDIR /app

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs tylrunner

COPY --from=installer --chown=tylrunner:nodejs /app/apps/migration/dist ./dist
COPY --from=installer --chown=tylrunner:nodejs /app/packages/db/drizzle ./drizzle

USER tylrunner

CMD ["node", "./dist/index.cjs"]
