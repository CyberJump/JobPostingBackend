# Architecture Decision Record — Student Verification Lifecycle & Flow

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Verification Lifecycle  

---

## 1. Lifecycle State Machine
```text
[ Submit Request ] ---> PENDING ---> [ Admin Review ] ---> APPROVED (Student status: VERIFIED)
                           |
                           +---> REJECTED (Student status: REJECTED)
```

## 2. Rules
- Only one active `PENDING` request per user is permitted at any time.
- State transitions from `PENDING` to `APPROVED` or `REJECTED` are atomic.
