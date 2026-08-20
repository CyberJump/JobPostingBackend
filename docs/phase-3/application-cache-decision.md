# Architecture Decision Record — Applications Cache Strategy

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Applications Module  

---

## 1. Decision
**DEFAULT: NO REDIS CACHE** for personalized application reads (`GET /my-applications`, `GET /:applicationId/status`, `GET /job/:jobId`).

## 2. Technical Justification
- **Privacy & Isolation**: Application payloads contain sensitive PII, applicant details, resume URLs, and review notes tied strictly to individual students or company founders. Caching cross-user or multi-tenant query lists introduces risk of cache pollution or data leakage.
- **Dynamic State Mutations**: Application review states (`APPLIED` -> `SHORTLISTED` -> `OFFER` -> `REJECTED`) change dynamically upon reviewer actions. Omitting caching ensures immediate consistency without cache invalidation overhead.
