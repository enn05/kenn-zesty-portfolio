# Next.js 12 on Cloud Run.
#
# Multi-stage so the runtime image carries only the standalone server, not the
# full node_modules or the build toolchain. Requires output: 'standalone' in
# next.config.js.
#
# Node 20, not the Node 16 in .nvmrc — 16 is end-of-life and no longer offered
# by GCP runtimes. Next 12.3 declares `node >=12.22`, so 20 is within range.

# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app

# libc6-compat: some native deps (sharp, three's optional bits) expect glibc
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
COPY scripts ./scripts
# CI=1 makes scripts/postinstall.js skip `zesty init`, which needs interactive auth
ENV CI=1
RUN npm ci

# ---------- build ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV CI=1
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# PRODUCTION=true points lib/zesty/* at the Zesty production domain.
# Set it at build time too: next.config.js reads zesty.config.json during
# redirects() and the value is inlined into the client bundle via env.zesty.
ENV PRODUCTION=true

RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PRODUCTION=true

# Don't run as root
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# The standalone output already contains a minimal node_modules and server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# Cloud Run injects PORT; default for local `docker run`
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
