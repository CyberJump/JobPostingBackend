# Target Enterprise Modular Monolith Architecture (`docs/phase-3/TARGET_ARCHITECTURE.md`)

> **Architectural Pattern**: Enterprise Modular Monolith with Clean Layered Boundaries  
> **Status**: Stage A Architecture Design  

---

## 1. Executive Summary

The target architecture transforms `JobPostingBackend` into an **Enterprise Modular Monolith**. High-level domain modules (`auth`, `users`, `companies`, `jobs`, `applications`, `invitations`, `verification`, `moderation`, `admin`) are strictly isolated within `src/modules/`. Within each domain module, Clean Layering enforces the Dependency Rule: inner domain logic has **zero** dependencies on HTTP frameworks (Express), ORMs (Mongoose), cache stores (Redis), or cloud storage SDKs (Cloudinary).

---

## 2. Conceptual System Blueprint

```text
                               ┌────────────────────────────────┐
                               │           Clients              │
                               │  Web App / Mobile App / Admin  │
                               └───────────────┬────────────────┘
                                               │ [HTTPS / Bearer JWT / Cookies]
                                               ▼
                               ┌────────────────────────────────┐
                               │    API & Gateway Layer         │
                               │  Express 5.x / CORS Whitelist  │
                               │  OpenAPI 3.0 / Request IDs     │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │     Global Middleware Layer    │
                               │  Zod Schema Validation         │
                               │  Redis-Backed Rate Limiting    │
                               │  AppError / Error Middleware   │
                               │  Pino Request Logging          │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────┐
 │                                 Domain Modules (src/modules/)                             │
 │                                                                                           │
 │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
 │  │      Auth       │ │      Users      │ │    Companies    │ │      Jobs       │        │
 │  │ Presentation    │ │ Presentation    │ │ Presentation    │ │ Presentation    │        │
 │  │ Application     │ │ Application     │ │ Application     │ │ Application     │        │
 │  │ Domain          │ │ Domain          │ │ Domain          │ │ Domain          │        │
 │  │ Infrastructure  │ │ Infrastructure  │ │ Infrastructure  │ │ Infrastructure  │        │
 │  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘        │
 │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
 │  │  Applications   │ │   Invitations   │ │  Verification   │ │      Admin      │        │
 │  │ Presentation    │ │ Presentation    │ │ Presentation    │ │ Presentation    │        │
 │  │ Application     │ │ Application     │ │ Application     │ │ Application     │        │
 │  │ Domain          │ │ Domain          │ │ Domain          │ │ Domain          │        │
 │  │ Infrastructure  │ │ Infrastructure  │ │ Infrastructure  │ │ Infrastructure  │        │
 │  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘        │
 └─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                               │
                                               ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────┐
 │                            Shared Infrastructure (src/infrastructure/)                    │
 │                                                                                           │
 │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
 │  │     MongoDB     │ │  Redis Service  │ │   Cloudinary    │ │  Email Provider │        │
 │  │  Mongoose ORM   │ │ Cache / RateLim │ │ Storage Service │ │ OTP / Notify    │        │
 │  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘        │
 └───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Strict Layering Responsibilities & Inward Dependency Rule

```text
Presentation Layer (Controllers, Routes, Schemas, DTOs)
       │
       ▼
Application Layer (Use Cases, Transaction Boundaries, Orchestration)
       │
       ▼
Domain Layer (Entities, Value Objects, Domain Policies, Repository Interfaces)
       ▲
       │ [Implements Interfaces]
Infrastructure Layer (MongoRepositories, RedisCacheService, CloudinaryStorageProvider)
```

### Layer Rules
1. **Presentation Layer (`presentation/`)**: Express controllers, routes, Zod schema validation middleware. Translates HTTP requests to Use Case input DTOs. Contains zero business rules.
2. **Application Layer (`application/`)**: Use cases (e.g., `CreateJobUseCase`, `SubmitApplicationUseCase`). Coordinates repositories, domain policies, caches, and notifications.
3. **Domain Layer (`domain/`)**: Pure JavaScript domain entities, value objects, domain policies (e.g. `JobPolicy.canUpdate()`), and Repository Interfaces (`IJobRepository`). Must NEVER import Express, Mongoose, Redis, or Cloudinary.
4. **Infrastructure Layer (`infrastructure/`)**: Mongoose repository implementations (`MongoJobRepository`), Redis key/cache adapters, Cloudinary SDK adapters. Implements interfaces defined in Application/Domain layers.

---

## 4. Target Directory Organization

```text
src/
├── modules/
│   ├── auth/
│   │   ├── application/
│   │   │   ├── LoginUseCase.js
│   │   │   ├── RegisterUseCase.js
│   │   │   └── RequestOtpUseCase.js
│   │   ├── domain/
│   │   │   ├── AuthPolicy.js
│   │   │   └── OtpEntity.js
│   │   ├── infrastructure/
│   │   │   ├── RedisOtpStore.js
│   │   │   └── MongoUserRepository.js
│   │   ├── presentation/
│   │   │   ├── auth.controller.js
│   │   │   └── auth.routes.js
│   │   └── schemas/
│   │       └── auth.schemas.js
│   │
│   ├── jobs/
│   ├── companies/
│   ├── applications/
│   ├── invitations/
│   ├── verification/
│   ├── users/
│   └── admin/
│
├── infrastructure/
│   ├── database/
│   │   ├── mongoose.connection.js
│   │   └── models/
│   ├── redis/
│   │   ├── redis.client.js
│   │   ├── redis.service.js
│   │   └── redis.keys.js
│   ├── storage/
│   │   └── cloudinary.provider.js
│   └── email/
│       └── email.provider.js
│
├── shared/
│   ├── errors/
│   │   └── AppError.js
│   ├── logging/
│   │   └── logger.js
│   ├── config/
│   │   └── env.js
│   └── middlewares/
│       ├── auth.middleware.js
│       ├── validate.middleware.js
│       ├── rateLimit.middleware.js
│       ├── requestContext.middleware.js
│       └── error.middleware.js
│
├── app.js
└── index.js
```

---

## 5. Architectural Quality Attributes

1. **Testability**: Domain policies and application use cases can be unit-tested with 100% isolation without mocking Express HTTP objects or database ORMs.
2. **Replaceability**: Mongoose or Cloudinary can be replaced by implementing domain interfaces (`IStorageProvider`, `IJobRepository`) without modifying core business logic.
3. **Resilience**: Redis outages fail-open for Read Caching (falling back to MongoDB Atlas) and fail-closed for Auth/OTP security.
