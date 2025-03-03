FROM node:22-alpine AS base
 
FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app

RUN npm install -g turbo@^2
COPY . .
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune @tyl/migration --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@tyl/migration...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 tylrunner
USER tylrunner

COPY --from=installer --chown=tylrunner:nodejs /app/apps/migration/dist ./dist
COPY --from=installer --chown=tylrunner:nodejs /app/packages/db/drizzle ./drizzle
COPY --from=builder /app/packages/db/src/zero-schema.ts ./zero-schema.ts
#COPY --from=installer --chown=tylrunner:nodejs /app/docker/init.sh .
#RUN chmod +x init.sh

#CMD ["npx", "-y", "zero-deploy-permissions", "--schema-path", "./zero-schema.ts"]
#CMD ["node", "./dist/index.cjs"]
 