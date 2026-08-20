# Final Architecture Report — JobPostingBackend

> **Date**: 2026-08-16  
> **Architecture**: Enterprise Modular Monolith  

---

## High-Level Dependency Graph
```text
HTTP Request
    │
    ▼
Routes / Express Middleware (Context, CORS, Rate Limit, Auth JWT)
    │
    ▼
Presentation Controllers (Thin Controllers)
    │
    ▼
Application Use Cases (Orchestration, Validation)
    │
    ├──► Domain Policies (Pure Business Rules)
    │
    ├──► Repository Ports (IUserRepository, ICompanyRepository, etc.)
    │          │
    │          ▼
    │     Infrastructure Repositories (Mongo Repository / BaseRepository)
    │          │
    │          ▼
    │       MongoDB
    │
    ├──► Storage Port (Cloudinary Storage Adapter)
    │
    ├──► Cache Service (Redis Cache-Aside)
    │
    └──► Email Port (Email Dispatch Adapter)
```

## Modular Layering Rules Summary
1. **Domain**: Zero framework imports. Pure entities, value objects, ports, and policies.
2. **Application**: Orchestrates use cases using domain policies and repository ports.
3. **Infrastructure**: Implements ports using Mongoose, Redis, Cloudinary, or Nodemailer.
4. **Presentation**: Translates HTTP requests/responses, validates Zod schemas, invokes use cases.
