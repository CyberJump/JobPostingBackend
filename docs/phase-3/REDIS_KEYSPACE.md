# Redis Keyspace & Key Design Specification (`docs/phase-3/REDIS_KEYSPACE.md`)

> **Redis Architecture**: Centralized Infrastructure Connection; Fail-Safe Security & Caching  
> **Status**: Stage A Key Design Specification  

---

## 1. Key Naming Standards & Namespaces

All Redis keys must follow a deterministic, colon-delimited hierarchical structure:

```text
{prefix}:{module}:{type}:{identifier}:{optional_sub_id}
```

- **Prefix**: Set via environment variable `REDIS_KEY_PREFIX` (Default: `bc_api`).
- **Delimiter**: `:` (Colon).
- **TTL Constraint**: **Every Redis key MUST have an explicit TTL**. Unbounded keys are forbidden.

---

## 2. Master Keyspace Catalog

| Namespace Pattern | Module | Purpose | Serialization | TTL | Invalidation Trigger | Security Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `otp:{purpose}:{identifier}` | `auth` | Hashed OTP token storage | JSON (Hashed payload) | 10 Mins (`600s`) | Verification / Expiration | **CRITICAL (Hashed)** |
| `otp:attempts:{purpose}:{identifier}` | `auth` | Tracks failed OTP verification attempts | Integer Counter | 10 Mins (`600s`) | 5 Failed attempts / Reset | **HIGH** |
| `otp:cooldown:{purpose}:{identifier}` | `auth` | Enforces 60-second OTP resend cooldown | Timestamp string | 60 Secs (`60s`) | Expiration | **MEDIUM** |
| `ratelimit:{tier}:{ip_or_user}` | `shared` | Distributed rate limiting counter | Integer Counter | 1 Minute / 1 Hour | Window Expiration | **MEDIUM** |
| `cache:job:{jobId}` | `jobs` | Public job posting details cache | JSON string | 5 Mins (`300s`) | Job Update / Close / Delete | **PUBLIC** |
| `cache:jobs:list:{query_hash}` | `jobs` | Paginated job search results cache | JSON string | 2 Mins (`120s`) | Job Create / Close / Delete | **PUBLIC** |
| `cache:company:{companyId}` | `companies` | Company public profile cache | JSON string | 10 Mins (`600s`) | Company Update / Withdraw | **PUBLIC** |

---

## 3. Failure & Memory Safeguards

1. **OTP Security Fail-Closed**: If Redis connection is lost during OTP request/verification, the system rejects the operation safely with HTTP 503 (`Infrastructure Error`). **In-memory fallback for OTPs is forbidden**.
2. **Cache-Aside Fail-Open**: If Redis is unavailable during cache reads (`cache:job:*`), the system logs a warning via Pino and falls back directly to querying MongoDB Atlas.
3. **Eviction Policy**: Redis instance configured with `maxmemory-policy volatile-lru` to ensure non-TTL keys (if any) or expired keys are evicted first under memory pressure.
