# =========================================================
# Stage 1: Build & Dependency Installation
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# =========================================================
# Stage 2: Production Execution Environment
# =========================================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=8000

# Security: Create non-root user
USER node

# Copy dependencies and application source
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src/ ./src/
COPY --chown=node:node public/ ./public/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/v1/health || exit 1

CMD ["node", "src/index.js"]
