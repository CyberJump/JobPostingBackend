# Architecture Decision Record — Users Cache Strategy

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Users Module  

---

## Decision
User profile data (`GET /api/v1/users/current-user`) is **EXCLUDED from Redis read caching**.

## Rationale
1. **Personalization & Scope**: Current user profile requests are individual, authenticated, low-frequency reads. Each user reads only their own profile payload upon application load or navigation.
2. **Invalidation Complexity**: Profile updates (`PATCH /update-account`, `PATCH /update-profile-photo`) modify user state. Excluding profile caching avoids stale cache invalidation risks across concurrent user sessions.
3. **Database Performance**: MongoDB Atlas retrieves single user documents by indexed `_id` (`User.findById`) with sub-5ms query latency, rendering Redis read caching unnecessary for personalized user account profile reads.
