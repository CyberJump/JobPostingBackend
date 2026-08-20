# CHG-0009 — Shared Infrastructure, Redis, Fixed-Window Rate Limiting & Operational Foundation

## Status
COMPLETED

## Date
2026-08-16

## Category
Infrastructure / Redis / Security / Reliability

## Risk Level
MEDIUM (Shared Infrastructure Addition — Zero Breaking Domain Changes)

## Objective
Establish the reusable shared infrastructure foundation for Phase 3 modular monolith transformation, including centralized Redis client connection management, Cache-Aside service, Fixed-Window rate limiting middleware, Idempotency service, secure OTP infrastructure primitives, Mongoose repository base, Storage/Email port abstractions, container liveness/readiness probes, and graceful process shutdown.

## Files Added
- `src/infrastructure/redis/redis.client.js`
- `src/infrastructure/redis/redis.service.js`
- `src/infrastructure/redis/redis.keys.js`
- `src/infrastructure/redis/redis.health.js`
- `src/infrastructure/cache/cache.service.js`
- `src/infrastructure/rateLimit/rateLimit.config.js`
- `src/infrastructure/rateLimit/fixedWindowRateLimiter.js`
- `src/infrastructure/idempotency/idempotency.service.js`
- `src/infrastructure/otp/otp.service.js`
- `src/infrastructure/database/repositories/base.repository.js`
- `src/infrastructure/storage/storage.port.js`
- `src/infrastructure/email/email.port.js`
- `tests/unit/redis.keys.test.js`
- `tests/unit/cache.service.test.js`
- `tests/unit/fixedWindowRateLimiter.test.js`
- `tests/unit/idempotency.service.test.js`
- `tests/unit/otp.service.test.js`
- `docs/changes/snapshots/chg-0009-pre-implementation.md`
- `docs/changes/CHG-0009-VERIFICATION.md`

## Files Modified
- `package.json` & `package-lock.json` (Added `ioredis` dependency)
- `src/config/env.js` (Added Redis environment configuration validation)
- `src/app.js` (Mounted `/api/v1/health/live` and `/api/v1/health/ready`)
- `src/index.js` (Implemented Redis initialization and graceful shutdown signal handlers)
- `docker-compose.yml` (Added `redis:7.0-alpine` service container)
- `.github/workflows/ci.yml` (Added `redis:7.0-alpine` service container)
- `docs/openapi.yaml` (Documented health live/ready probe endpoints)
- `tests/api/health.test.js` (Added integration tests for liveness and readiness probes)
- `docs/CHANGELOG.md`
- `docs/CHANGE_INDEX.md`

## Files Deleted
None

## Infrastructure Details

### 1. Redis Connection Manager
- Singleton connection instance (`ioredis`). Exponential retry backoff strategy (capped at 3s per attempt). Graceful shutdown via `closeRedis()`. Structured Pino logging without exposing connection secrets.

### 2. Cache-Aside Service
- JSON serialization/deserialization wrapper with fail-open fallback (`null` returned on miss, corruption, or connection failure). Supported methods: `get`, `set`, `delete`, `deleteByPattern` (using non-blocking `SCAN`).

### 3. Fixed-Window Rate Limiting
- **Algorithm**: FIXED WINDOW. Calculates window ID via `Math.floor(Date.now() / (windowSeconds * 1000))`. Uses atomic `INCR` + `EXPIRE` on first creation. Enforces rate limits per identity (user ID or IP). Returns `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After` headers on 429 rejection. Security failure policy fails closed (503) if Redis is down.

### 4. Idempotency Service
- Atomic reservation via `SET key payload NX EX 30`. State tracking (`PROCESSING` -> `COMPLETED`). Result storage and release on mutation failure.

### 5. OTP Primitives
- 6-digit numeric generation via `crypto.randomInt(100000, 1000000)`. Plaintext OTP is **NEVER** stored or logged. SHA-256 hashed storage under `otp:{purpose}:{identifier}` with 10-minute TTL. Enforces 60-second resend cooldown (`otp:cooldown:*`). Single-use invalidation on verification. 5 failed verification attempts trigger immediate OTP deletion and a 15-minute lockout flag (`otp:lockout:*`).

### 6. Health Probes & Lifecycle
- `GET /api/v1/health/live`: Liveness probe (Process check).
- `GET /api/v1/health/ready`: Readiness probe (Verifies MongoDB Atlas & Redis connectivity).
- Graceful shutdown handles `SIGTERM`/`SIGINT`, closes HTTP server to new requests, drains in-flight requests, closes Redis connections, closes MongoDB connection, and exits cleanly within a 10s fallback timeout.

## Automated Verification Tests
```text
Suites:  10 passed, 10 total
Tests:   49 passed, 49 total
Passed:  49
Failed:  0
Skipped: 0
```

## Rollback Strategy
Revert CHG-0009 files via Git commit restoration. Zero database schema migrations were performed.
