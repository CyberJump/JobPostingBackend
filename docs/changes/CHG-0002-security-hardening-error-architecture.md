# CHG-0002 — Security Hardening, Error Architecture & Operational Foundation

## Status
COMPLETED

## Date
2026-08-15

## Category
Security / Architecture / Operational Resilience

## Risk Level
HIGH

## Objective
Remediate critical security vulnerabilities (SEC-0001 through SEC-0005), introduce centralized error architecture (`AppError`, global Express error handler), implement Zod schema validation layer, integrate Pino structured logging with request correlation IDs (`X-Request-ID`), restrict CORS policy, and establish centralized environment configuration validation.

## Problem
- **SEC-0001**: Broken founder authorization check in `job.controller.js` blocked company founders from updating, closing, or deleting their own jobs.
- **SEC-0002**: Permissive CORS allowed any origin with credentials.
- **SEC-0003**: Cloudinary deletion utility failed when full URLs or raw resource types (PDFs) were passed.
- **SEC-0004**: Static `Date.now()` default in `companyinvite.models.js` evaluated once at boot time.
- **SEC-0005**: `student.routes.js` set `verifiedBy` instead of `approvedBy`, breaking schema property mapping.
- **Lack of Global Error Handling**: Unhandled exceptions yielded Express HTML error pages.

## Root Cause
- Direct property access on arrays (`founders.userId`).
- Unrestricted CORS wildcard callback.
- Static default parameter evaluation in Mongoose schema definition.
- Lack of centralized Express error middleware.

## Before
- Permissive CORS origin wildcard (`callback(null, true)`).
- Founder job management checks failed for non-admin users.
- Raw file deletion on Cloudinary failed.
- Unhandled errors output HTML stack traces.

## After
- CORS restricted to environment whitelist (`config.cors.allowedOrigins`).
- Founder check uses `.some()` array verification in `job.controller.js`.
- Hardened Cloudinary helper parses public IDs and handles resource types (`image`, `raw`, `video`).
- `expiredAt` in `companyinvite.models.js` uses dynamic default function `() => new Date(...)`.
- `student.routes.js` updates `approvedBy` property.
- Added `AppError` hierarchy and global error handler middleware `globalErrorHandler`.
- Added request correlation ID middleware (`requestContextMiddleware` setting `X-Request-ID`).
- Centralized env loader with Zod validation in `src/config/env.js`.

## Files Changed
- `src/app.js` (Added CORS whitelist, requestContext, global error handler)
- `src/controllers/job.controller.js` (Fixed founder check in `UpdateJobPosting`, `CloseJobPosting`, `DeleteJobPosting`)
- `src/models/companyinvite.models.js` (Fixed static date default)
- `src/routes/student.routes.js` (Fixed `verifiedBy` -> `approvedBy`)
- `src/utils/cloudinary.js` (Fixed public ID extraction & raw document deletion)

## Files Added
- `src/config/env.js`
- `src/shared/errors/AppError.js`
- `src/shared/logging/logger.js`
- `src/middlewares/requestContext.middleware.js`
- `src/middlewares/error.middleware.js`
- `src/middlewares/validate.middleware.js`
- `docs/changes/CHG-0002-security-hardening-error-architecture.md`

## Files Removed
None.

## Database Changes
None (Fixed dynamic default in `CompanyInvite` schema).

## API Changes
No breaking API contract changes. Added `X-Request-ID` header and standardized JSON error responses.

## Authentication & Authorization Changes
- Fixed job founder authorization policy in `job.controller.js`.

## Dependencies Added
- `zod` (`^3.x`)
- `pino` (`^9.x`)
- `pino-http` (`^10.x`)

## Verification Result
PASS

## Rollback Procedure
Revert changes to `src/app.js`, `src/controllers/job.controller.js`, `src/models/companyinvite.models.js`, `src/routes/student.routes.js`, `src/utils/cloudinary.js`, and remove newly added config/middleware files.
