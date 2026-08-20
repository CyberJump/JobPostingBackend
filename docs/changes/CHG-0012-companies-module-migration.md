# CHG-0012 — Companies Module Migration

## Status
COMPLETED

## Date
2026-08-16

## Category
Architecture / Domain Migration / Company Management

## Risk Level
MEDIUM (Company Domain Migration — 100% Backward Compatible)

## Objective
Migrate company profile, metadata, founder authorization, and Dashboard management functionality into `src/modules/companies/` adhering to the Enterprise Modular Monolith architecture established in CHG-0008.

## Architecture & Layering Summary
```text
src/modules/companies/
├── application/use-cases/
│   ├── CreateCompanyUseCase.js
│   ├── GetCompanyUseCase.js
│   ├── UpdateCompanyUseCase.js
│   ├── DeleteCompanyUseCase.js
│   ├── ListCompaniesUseCase.js
│   └── ListMyCompaniesUseCase.js
├── domain/
│   ├── ports/
│   │   └── ICompanyRepository.js
│   └── policies/
│       └── CompanyPolicy.js
├── infrastructure/repositories/
│   └── MongoCompanyRepository.js
├── presentation/
│   ├── controllers/
│   │   └── company.controller.js
│   └── routes/
│       └── company.routes.js
└── schemas/
    └── company.schemas.js
```

## Files Added
- `src/modules/companies/domain/ports/ICompanyRepository.js`
- `src/modules/companies/domain/policies/CompanyPolicy.js`
- `src/modules/companies/infrastructure/repositories/MongoCompanyRepository.js`
- `src/modules/companies/application/use-cases/CreateCompanyUseCase.js`
- `src/modules/companies/application/use-cases/GetCompanyUseCase.js`
- `src/modules/companies/application/use-cases/UpdateCompanyUseCase.js`
- `src/modules/companies/application/use-cases/DeleteCompanyUseCase.js`
- `src/modules/companies/application/use-cases/ListCompaniesUseCase.js`
- `src/modules/companies/application/use-cases/ListMyCompaniesUseCase.js`
- `src/modules/companies/schemas/company.schemas.js`
- `src/modules/companies/presentation/controllers/company.controller.js`
- `src/modules/companies/presentation/routes/company.routes.js`
- `tests/unit/companies.module.test.js`
- `tests/api/companies.routes.test.js`
- `docs/phase-3/company-founder-architecture.md`
- `docs/phase-3/companies-cache-decision.md`
- `docs/changes/snapshots/chg-0012-pre-implementation.md`
- `docs/changes/snapshots/chg-0012-post-implementation.md`
- `docs/changes/CHG-0012-VERIFICATION.md`

## Files Modified
- `src/routes/company.routes.js` (Re-exported `src/modules/companies/presentation/routes/company.routes.js`)
- `docs/CHANGELOG.md`
- `docs/CHANGE_INDEX.md`

## Files Deleted
- `src/controllers/company.contoller.js` (Obsolete legacy controller file removed after confirming zero active dependencies)

## Testing & Regression Verification
```text
Test Suites: 16 passed, 16 total
Tests:       72 passed, 72 total
Passed:      72
Failed:      0
Skipped:     0
```

## Rollback Strategy
Revert CHG-0012 commit boundary. Zero database schema modifications were performed.
