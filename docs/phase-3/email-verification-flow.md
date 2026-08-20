# Architecture Decision Record — Email Verification User Flow

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Email Verification Flow  

---

## 1. Step-by-Step Flow
```text
User Registration
       │
       ▼
User created (status: "PENDING", isVerified: false)
       │
       ▼
User requests verification (POST /api/v1/auth/email-verification/request)
       │
       ├─► 60s Cooldown Check
       ├─► SHA-256 OTP generated & stored in Redis (10m TTL)
       └─► Verification Email sent via emailPort
       │
       ▼
User submits OTP code (POST /api/v1/auth/email-verification/verify)
       │
       ├─► Hash comparison & single-use invalidation
       └─► User updated (status: "ACTIVE", isVerified: true)
```
