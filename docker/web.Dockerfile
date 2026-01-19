# ---- Create Base Image ----

FROM node:24-slim AS base

# Enable corepack for pnpm (version from package.json packageManager field)
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

# ---- Prune Monorepo ----

FROM base AS builder
WORKDIR /app

RUN npm install -g turbo@^2

COPY . .
RUN turbo prune @tyl/server --docker

# ---- Install and build ----

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

# This values are included in client build, therefore we need to pass as ARG
ARG VITE_DEPLOY_DOMAIN
ARG VITE_POWERSYNC_DOMAIN
ARG VITE_PREVIEW_WARNING
ENV VITE_DEPLOY_DOMAIN=$VITE_DEPLOY_DOMAIN
ENV VITE_POWERSYNC_DOMAIN=$VITE_POWERSYNC_DOMAIN
ENV VITE_PREVIEW_WARNING=$VITE_PREVIEW_WARNING
RUN pnpm turbo run build --filter=@tyl/server...

# ---- Production runner ----

FROM base AS runner
WORKDIR /app

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs tylrunner

COPY --from=installer --chown=tylrunner:nodejs /app/apps/server/.output ./output

USER tylrunner

EXPOSE 3000

CMD ["node", "./output/server/index.mjs"]
