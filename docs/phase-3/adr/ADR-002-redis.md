# ADR-002: Redis Centralized Infrastructure for Caching, OTP & Rate Limiting

## Status
ACCEPTED

## Context
The platform requires distributed rate limiting, secure OTP token storage with attempt tracking, and high-performance read caching for job listings and company profiles across multiple application instances.

## Decision
We introduce Redis via `ioredis` as a centralized shared infrastructure component. Redis will be encapsulated within `src/infrastructure/redis/redis.service.js`. Business modules will interact with Redis exclusively through domain interfaces (`ICacheService`, `IOtpStore`, `IRateLimiter`).

## Failure Strategy
- **Read Caching**: Fail-Open. If Redis is unavailable, read operations fall back directly to MongoDB Atlas.
- **OTP & Security**: Fail-Closed. If Redis is unavailable during OTP verification or request, the operation safely aborts with HTTP 503 (`Infrastructure Error`) to prevent in-memory security vulnerabilities.

## Consequences
- Requires Redis 7.0 container in local `docker-compose.yml` and production infrastructure.
- All Redis keys must have explicit TTLs and follow namespace `bc_api:{module}:{type}:{id}`.
