FROM node:22-alpine AS base
 
FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app

RUN npm install -g turbo@^2
COPY . .
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune @tyl/db --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/packages/db/drizzle.config.ts /app/packages/db/drizzle.config.ts
COPY --from=builder /app/packages/db/drizzle /app/packages/db/drizzle
COPY --from=builder /app/packages/db/src/zero-schema.ts /app/packages/db/src/zero-schema.ts

RUN npm install -g pnpm
RUN pnpm install

COPY --from=builder /app/docker/init.sh .
RUN chmod +x init.sh

CMD ["./init.sh"]
 