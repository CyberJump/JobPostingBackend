# ADR-003: Cache-Aside Caching Strategy & Invalidation Policy

## Status
ACCEPTED

## Context
Database read queries for active jobs and company profiles represent >70% of total read traffic. Caching everything by default causes stale data risks, security leaks, and cache invalidation bugs.

## Decision
We implement an explicit **Cache-Aside** strategy restricted to non-sensitive, low-volatility public resources (`GET /jobs/:id`, `GET /jobs`, `GET /companies/:id`). Sensitive user state, authentication tokens, and administrative moderation queues will NEVER be cached in Redis.

## Invalidation Policy
Every cached resource must define a deterministic invalidation trigger in its application use case:
- `UpdateJobPosting` / `CloseJobPosting` / `DeleteJobPosting` -> Deletes `cache:job:{jobId}` and invalidates `cache:jobs:list:*`.
- `UpdateCompanyDetails` / `WithdrawCompany` -> Deletes `cache:company:{companyId}`.

## Consequences
- Reduces MongoDB Atlas read latency by up to 80% for cached job queries.
- Prevents stale cache bugs through explicit mutation-driven invalidation.
