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

# PRODUCTION has to be known at BUILD time, not just at runtime: next.config.js
# calls fetchZestyRedirects() inside redirects(), which Next evaluates during
# the build, and that function picks the Zesty domain from this value. The
# redirect list is therefore baked into the image.
#
# Override for a staging image:  docker build --build-arg PRODUCTION=false
ARG PRODUCTION=true
ENV PRODUCTION=$PRODUCTION

RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# PRODUCTION is deliberately NOT set here. Every reader of it is server-side and
# evaluates per request, so it belongs to the deployment, not the image:
#   gcloud run deploy ... --set-env-vars PRODUCTION=true
# Unset behaves as true (see lib/zesty/fetchPage.js), which is the safe default:
# an unconfigured deploy reads published content rather than drafts. Note that
# an EMPTY value is not the same as unset — PRODUCTION= evaluates false and
# points at the password-protected preview domain, which 401s without zpw.

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
