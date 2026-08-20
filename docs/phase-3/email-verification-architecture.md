# Architecture Decision Record — Email Verification Architecture

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Email Verification  

---

## 1. Architecture Flow
```text
HTTP Request
     │
     ▼
Email Verification Controller
     │
     ▼
RequestEmailVerificationUseCase / VerifyEmailUseCase
     │
     ├──────────────► OTP Service (SHA-256) ────► Redis Client (Fail-Closed)
     │
     ├──────────────► Email Port ───────────────► Email Provider
     │
     └──────────────► Repository Port ──────────► MongoEmailVerificationRepository
                                                       │
                                                       ▼
                                                 MongoDB User
```

## 2. Dependencies
- Domain / Application layers have zero direct imports of Express, Mongoose, Redis, Cloudinary, or jsonwebtoken.
- Persistence isolated behind `IEmailVerificationRepository` port.
