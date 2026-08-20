# Redis Operations & Memory Governance (`docs/phase-3/REDIS_OPERATIONS.md`)

> **Redis Operational Rules**: Maxmemory Eviction Governance; Security State Protection  
> **Status**: Stage A Operations Specification  

---

## 1. Data Classification & Memory Eviction Strategy

Redis data is categorized into two strict security tiers:

1. **SECURITY / STATE TIER (`OTP`, `RATE_LIMIT`, `LOCKOUT`)**:
   - Keys: `otp:*`, `ratelimit:*`, `otp:attempts:*`, `otp:lockout:*`
   - Requirement: **MUST NOT be evicted before explicit TTL expiration**.
2. **CACHE TIER (`CACHE`)**:
   - Keys: `cache:job:*`, `cache:jobs:list:*`, `cache:company:*`
   - Requirement: Volatile LRU eviction permitted under memory pressure.

---

## 2. Recommended Production Redis Configuration

```text
# redis.conf
maxmemory 512mb
maxmemory-policy volatile-lru
save "" # Disable RDB snapshots if used strictly for volatile cache/OTP; or configure appendonly yes
appendonly yes
appendfsync everysec
```

### Why `volatile-lru`?
Under memory pressure, Redis will only evict keys that have an explicit TTL set, starting with the least recently used cache keys (`cache:*`). Security keys (`otp:*`) also have TTLs but short lifetimes (10 mins);LRU ensures old cached job/company listings are evicted long before active OTP verification keys.

---

## 3. Distributed Lock & Idempotency Rules

1. **Idempotency Keys**: Used for critical non-idempotent operations (e.g. `POST /api/v1/applications/submit`). Key format: `idempotency:{key}` with 30-second TTL.
2. **Locking**: Distributed locks (if needed) use Redlock/single-instance lock with automatic lease duration (`px 5000`) and random lock identifier to prevent un-locking by another process.
