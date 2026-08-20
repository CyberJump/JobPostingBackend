# Cache Strategy & Invalidation Architecture (`docs/phase-3/CACHE_STRATEGY.md`)

> **Caching Pattern**: Explicit Cache-Aside with Invalidation Triggers  
> **Status**: Stage A Cache Specification  

---

## 1. Caching Principles & Safety Rules

1. **Do Not Cache by Default**: Only read-heavy, low-volatility public resources are cached.
2. **Zero Sensitive Data Caching**: Passwords, JWT refresh tokens, OTP secrets, verification documents, and unencrypted PII must **NEVER** be stored in Redis caches.
3. **Explicit Invalidation**: Every cached resource must possess a deterministic invalidation trigger tied to state-changing mutations.

---

## 2. Cached Endpoints Inventory

| Resource | HTTP Endpoint | Cache Key | TTL | Read Path | Invalidation Mutation Trigger | Failure Behavior |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **Job Details** | `GET /api/v1/jobs/:jobId` | `cache:job:{jobId}` | 300s | Cache -> DB -> Set Cache | `UpdateJobPosting`, `CloseJobPosting`, `DeleteJobPosting` | Fail-Open to DB |
| **Job Listing** | `GET /api/v1/jobs` | `cache:jobs:list:{hash}` | 120s | Cache -> DB -> Set Cache | `CreateJobPosting`, `CloseJobPosting`, `DeleteJobPosting` | Fail-Open to DB |
| **Company Profile** | `GET /api/v1/companies/:id` | `cache:company:{companyId}` | 600s | Cache -> DB -> Set Cache | `UpdateCompanyDetails`, `WithdrawCompany` | Fail-Open to DB |

---

## 3. Explicit Non-Cached Endpoints Catalog

The following endpoints are **EXPLICITLY EXCLUDED** from caching due to security, identity, or high volatility:

- `POST /api/v1/users/login` (Authentication)
- `POST /api/v1/users/register` (Account Creation)
- `POST /api/v1/users/refresh-token` (Session Management)
- `POST /api/v1/auth/otp/*` (OTP Verification)
- `GET /api/v1/applications/my-applications` (Personalized Student Applications)
- `GET /api/v1/applications/job/:jobId` (Founder Application Review)
- `GET /api/v1/admin/*` (Administrative Moderation Queues)

---

## 4. Cache-Aside Execution Sequence

```text
HTTP GET Request (e.g. GET /api/v1/jobs/65b1c...)
       │
       ▼
GetJobDetailsUseCase
       │
       ▼
Check Redis Cache (cache.get("cache:job:65b1c..."))
  ├── [CACHE HIT] ──► Return Cached JSON immediately
  └── [CACHE MISS / REDIS DOWN]
       │
       ▼
Execute MongoJobRepository.findById("65b1c...")
       │
       ▼
Populate Redis Cache (cache.set("cache:job:65b1c...", data, TTL=300))
       │
       ▼
Return Response Data
```
