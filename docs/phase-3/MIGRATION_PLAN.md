# Modular Monolith Migration Plan (`docs/phase-3/MIGRATION_PLAN.md`)

> **Migration Philosophy**: Progressive Strangler-Fig Pattern; Zero Downtime; Zero Breaking API Changes  
> **Status**: Stage A Migration Specification  

---

## 1. Domain Migration Sequence

```text
Step 1: Shared Infrastructure (Redis, Config, Mongo Repository Base, Cloudinary, Email)
   ↓
Step 2: Auth & Identity Module (src/modules/auth/)
   ↓
Step 3: Users Module (src/modules/users/)
   ↓
Step 4: Companies Module (src/modules/companies/)
   ↓
Step 5: Jobs Module (src/modules/jobs/)
   ↓
Step 6: Applications Module (src/modules/applications/)
   ↓
Step 7: Invitations Module (src/modules/invitations/)
   ↓
Step 8: Verification & Student Module (src/modules/verification/)
   ↓
Step 9: Admin & Moderation Module (src/modules/admin/)
   ↓
Step 10: Final Modular Architecture Audit & Verification Gate
```

---

## 2. Step-by-Step Domain Migration Protocol

For each domain module (e.g. `jobs`), execute the following 8-step protocol:

1. **Analyze Current Implementation**: Inspect existing route definitions in `src/routes/` and controllers in `src/controllers/`. Identify Mongoose calls, file uploads, authorization rules, and validation schemas.
2. **Design Domain Interfaces & Use Cases**: Define repository interface (`IJobRepository`), domain policy (`JobPolicy`), and application use cases (`CreateJobPostingUseCase`, `ListJobsUseCase`).
3. **Implement Infrastructure Repositories**: Create Mongoose repository implementation (`MongoJobRepository`) implementing the repository interface.
4. **Implement Application Use Cases**: Write pure use-case classes orchestrating domain policies, repositories, and cache services.
5. **Implement Presentation Controllers & Routes**: Write light Express controllers translating HTTP DTOs to Use Cases and binding Zod schema validation middleware.
6. **Execute Domain Regression Tests**: Run Jest unit tests for Use Cases & Domain Policies; run Supertest API integration tests against `/api/v1/*` routes.
7. **Update OpenAPI Specification**: Verify all endpoints in `docs/openapi.yaml` match the migrated presentation layer.
8. **Document Change Record**: Generate `CHG-00XX` change record and update master logs (`CHANGELOG.md`, `CHANGE_INDEX.md`).

---

## 3. Backward Compatibility & Risk Mitigation

- **Route Compatibility**: All migrated routes remain mounted under `/api/v1/*`. Response JSON structures retain standard `ApiResponse(statusCode, data, message)` formatting.
- **Fail-Safe Cache Fallback**: Redis cache-aside implementation fails open to MongoDB Atlas in the event of a Redis outage.
- **No Direct ORM Imports**: Controllers in migrated modules are forbidden from importing Mongoose models directly.
