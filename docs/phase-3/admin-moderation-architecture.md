# Architecture Decision Record — Admin & Moderation Architecture

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Admin & Moderation  

---

## 1. Modular Architecture
```text
Presentation (admin.controller.js)
      │
      ▼
Application (BlockUserUseCase, BlockCompanyUseCase, ListUsersForModerationUseCase, etc.)
      │
      ├──► Domain Policy (AdminPolicy.js, ModerationPolicy.js)
      │
      └──► Repository Ports (IAdminRepository.js, IModerationRepository.js)
                 │
                 ▼
          MongoAdminRepository & MongoModerationRepository (Mongoose User, Company, Job, Application)
```

## 2. Layer Isolation
- `Domain` and `Application` layers have ZERO direct imports of Express, Mongoose, Redis, Cloudinary, Multer, or jsonwebtoken.
- Persistence and aggregation queries isolated inside infrastructure repositories (`MongoAdminRepository` / `MongoModerationRepository`).
