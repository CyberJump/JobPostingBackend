# CHG-0017 — Admin & Moderation Module Migration

## Status
COMPLETED

## Date
2026-08-16

## Category
Architecture / Domain Migration / Admin & Moderation

## Risk Level
MEDIUM (Admin & Moderation Migration — 100% Backward Compatible)

## Objective
Migrate Admin creation, user moderation, company moderation, job moderation, and application moderation into `src/modules/admin/` adhering to the Enterprise Modular Monolith architecture established in CHG-0008.

## Architecture & Layering Summary
```text
src/modules/admin/
├── application/use-cases/
│   ├── CreateAdminUseCase.js
│   ├── RemoveAdminUseCase.js
│   ├── BlockUserUseCase.js
│   ├── UnblockUserUseCase.js
│   ├── BlockCompanyUseCase.js
│   ├── UnblockCompanyUseCase.js
│   ├── ListUsersForModerationUseCase.js
│   ├── ListApplicationsAdminUseCase.js
│   ├── DeleteApplicationAdminUseCase.js
│   ├── ListJobsAdminUseCase.js
│   ├── ModifyJobAdminUseCase.js
│   └── DeleteJobAdminUseCase.js
├── domain/
│   ├── ports/
│   │   ├── IAdminRepository.js
│   │   └── IModerationRepository.js
│   └── policies/
│       ├── AdminPolicy.js
│       └── ModerationPolicy.js
├── infrastructure/repositories/
│   ├── MongoAdminRepository.js
│   └── MongoModerationRepository.js
├── presentation/
│   ├── controllers/
│   │   └── admin.controller.js
│   └── routes/
│       └── admin.routes.js
└── schemas/
    └── admin.schemas.js
```

## Files Added
- `src/modules/admin/domain/ports/IAdminRepository.js`
- `src/modules/admin/domain/ports/IModerationRepository.js`
- `src/modules/admin/domain/policies/AdminPolicy.js`
- `src/modules/admin/domain/policies/ModerationPolicy.js`
- `src/modules/admin/infrastructure/repositories/MongoAdminRepository.js`
- `src/modules/admin/infrastructure/repositories/MongoModerationRepository.js`
- `src/modules/admin/application/use-cases/CreateAdminUseCase.js`
- `src/modules/admin/application/use-cases/RemoveAdminUseCase.js`
- `src/modules/admin/application/use-cases/BlockUserUseCase.js`
- `src/modules/admin/application/use-cases/UnblockUserUseCase.js`
- `src/modules/admin/application/use-cases/BlockCompanyUseCase.js`
- `src/modules/admin/application/use-cases/UnblockCompanyUseCase.js`
- `src/modules/admin/application/use-cases/ListUsersForModerationUseCase.js`
- `src/modules/admin/application/use-cases/ListApplicationsAdminUseCase.js`
- `src/modules/admin/application/use-cases/DeleteApplicationAdminUseCase.js`
- `src/modules/admin/application/use-cases/ListJobsAdminUseCase.js`
- `src/modules/admin/application/use-cases/ModifyJobAdminUseCase.js`
- `src/modules/admin/application/use-cases/DeleteJobAdminUseCase.js`
- `src/modules/admin/presentation/controllers/admin.controller.js`
- `src/modules/admin/presentation/routes/admin.routes.js`
- `src/modules/admin/schemas/admin.schemas.js`
- `tests/unit/admin.module.test.js`
- `tests/api/admin.routes.test.js`
- `docs/phase-3/admin-moderation-audit.md`
- `docs/phase-3/admin-moderation-architecture.md`
- `docs/phase-3/admin-moderation-security.md`
- `docs/phase-3/admin-moderation-flow.md`
- `docs/phase-3/admin-cache-decision.md`
- `docs/phase-3/admin-authorization-matrix.md`
- `docs/changes/snapshots/chg-0017-pre-implementation.md`
- `docs/changes/snapshots/chg-0017-post-implementation.md`
- `docs/changes/CHG-0017-VERIFICATION.md`

## Files Modified
- `src/routes/admin.routes.js` (Re-exported `src/modules/admin/presentation/routes/admin.routes.js`)
- `docs/CHANGELOG.md`
- `docs/CHANGE_INDEX.md`

## Files Deleted
- `src/controllers/admin.controller.js` (Obsolete legacy controller file removed after confirming zero active dependencies)

## Testing & Regression Verification
```text
Test Suites: 26 passed, 26 total
Tests:       108 passed, 108 total
Passed:      108
Failed:      0
Skipped:     0
```

## Rollback Strategy
Revert CHG-0017 commit boundary. Zero database schema modifications were performed.
