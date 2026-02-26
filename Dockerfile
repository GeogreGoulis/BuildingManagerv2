FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build
# Collect pg runtime deps into a clean directory
RUN mkdir -p /runtime-deps && \
    cd node_modules && \
    for pkg in @prisma/adapter-pg pg pg-types pg-pool pg-protocol pg-connection-string pg-cloudflare pgpass; do \
      if [ -d "$pkg" ]; then cp -r "$pkg" /runtime-deps/; fi \
    done && \
    # Also copy any scoped @prisma packages
    cp -r @prisma /runtime-deps/

# Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built app (standalone includes its own node_modules for Next.js)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma generated client + pg adapter runtime deps
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /runtime-deps/ ./node_modules/

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# Migrate target — full node environment for running prisma CLI
FROM base AS migrator
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
