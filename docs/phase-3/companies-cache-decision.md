# Architecture Decision Record — Companies Cache Strategy

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Companies Module  

---

## 1. Decision
Public company profile reads (`GET /api/v1/companies/:companyId`) use **Cache-Aside** via `cacheService` (`src/infrastructure/cache/cache.service.js`).

## 2. Key Format & TTL
- **Redis Key Structure**: `bc_api:cache:company:{companyId}`
- **TTL**: 300 seconds (5 minutes).

## 3. Invalidation & Fail-Open Behavior
- **Invalidation**: Cache key `bc_api:cache:company:{companyId}` is invalidated upon profile update (`PATCH /update`), withdrawal (`DELETE /withdraw`), or status mutation.
- **Fail-Open Policy**: If Redis is unavailable or cache contains corrupted JSON, `cacheService.get` fails open to MongoDB Atlas (`null` cache hit).
