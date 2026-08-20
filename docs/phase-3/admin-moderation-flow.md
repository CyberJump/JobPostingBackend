# Architecture Decision Record — Admin Moderation Flow & State Transitions

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Moderation Flow  

---

## 1. User & Company State Transitions
```text
User Status:    ACTIVE  <--->  BLOCKED
User Role:      STUDENT / COMPANY  <--->  ADMIN

Company Status: ACTIVE / PENDING  <--->  BLOCKED
```
