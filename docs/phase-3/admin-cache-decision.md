# Architecture Decision Record — Admin Cache Strategy

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Admin Cache Strategy  

---

## 1. Decision
**DEFAULT: NO REDIS CACHE** for administrative user moderation, company block state, or content management endpoints.

## 2. Rationale
- Administrative actions require real-time database state accuracy (e.g. blocking a malicious user or company must take effect immediately without stale cache windows).
