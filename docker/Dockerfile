FROM node:22-alpine AS base
 
FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app

RUN npm install -g turbo@^2
COPY . .
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune @tyl/server --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm
RUN pnpm install
 
# Build the project
COPY --from=builder /app/out/full/ .
# This val is included in client build, therefore we need to pass as ARG
ARG VITE_ZERO_DOMAIN
ENV VITE_ZERO_DOMAIN=$VITE_ZERO_DOMAIN
RUN pnpm turbo run build --filter=@tyl/server...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 tylrunner
USER tylrunner
 
COPY --from=installer /app/apps/server/package.json .
 
# Copy app build
COPY --from=installer --chown=tylrunner:nodejs /app/apps/server/.output ./output
COPY --from=installer --chown=tylrunner:nodejs /app/apps/server/.vinxi ./vinxi
 
CMD ["node", "./output/server/index.mjs"]
