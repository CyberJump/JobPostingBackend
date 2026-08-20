# Architecture Decision Record — Student Verification Architecture

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Student Verification  

---

## 1. Modular Architecture
```text
Presentation (studentVerification.controller.js)
      │
      ▼
Application (SubmitStudentVerificationUseCase, GetStudentVerificationStatusUseCase, ReviewStudentVerificationUseCase, etc.)
      │
      ├──► Domain Policy (StudentVerificationPolicy.js)
      │
      └──► Repository Port (IStudentVerificationRepository.js)
                 │
                 ▼
          MongoStudentVerificationRepository (Mongoose VerificationApplication)
```

## 2. Layer Isolation
- `Domain` and `Application` layers have ZERO imports of Express, Mongoose, Redis, Cloudinary, Multer, or jsonwebtoken.
- Persistence and populate operations isolated inside `MongoStudentVerificationRepository`.
