# Comprehensive Backend Architecture Audit (`docs/ARCHITECTURE_AUDIT.md`)

> **Date**: 2026-08-15  
> **Audited Repository**: `d:\CS\JobPosting\JobPostingBackend`  
> **Auditor**: Principal Backend Architect & Security Engineer  
> **Baseline Document Reference**: `BACKEND_DOCUMENTATION.md`  

---

## 1. Executive Summary

This architecture audit evaluates the readiness, security posture, code structure, data integrity, and operational resilience of the `JobPostingBackend` codebase. The application is built on Express 5.x, Node.js (ESM), and Mongoose 9.x.

While the backend successfully fulfills basic MVP business workflows, the codebase exhibits critical architectural technical debt, severe security vulnerabilities, data integrity bugs, and zero production observability or automated testing infrastructure.

---

## 2. Comprehensive Component Audit & Technical Debt Matrix

### 2.1 Routing & HTTP Layer (`src/routes/*.js`, `src/app.js`)
- **Central Router Mounting**: Mounted under `/api/v1/*` in `src/app.js`.
- **CORS Vulnerability**: `src/app.js` configures dynamic CORS origin with `callback(null, true)` for all origins with `credentials: true`. This effectively disables CORS protections for cross-origin authenticated requests.
- **Inconsistent Routing Idioms**:
  - `src/routes/student.routes.js` contains inline route handlers (`/pending`, `/:studentId/verify`, `/:studentId/reject`) with direct database mutations, bypassing controller wrappers.
  - Other routes correctly delegate to separate controllers.
- **Lack of Versioning Resilience**: All routes are directly coupled to Express router objects without API contract validation or version strategy.

### 2.2 Controllers & Business Logic Concentration (`src/controllers/*.js`)
- **Overstuffed Controllers**: Controllers perform direct Mongoose queries, Cloudinary API calls, custom authorization checks, response transformations, and input validations in a single procedural handler.
- **Critical Authorization Bug in Job Controller**:
  - In [src/controllers/job.controller.js](file:///d:/CS/JobPosting/JobPostingBackend/src/controllers/job.controller.js#L82), [L154](file:///d:/CS/JobPosting/JobPostingBackend/src/controllers/job.controller.js#L154), and [L190](file:///d:/CS/JobPosting/JobPostingBackend/src/controllers/job.controller.js#L190):
    `const isFounder = job.company?.founders?.userId?.toString() === req.user._id.toString();`
  - `job.company.founders` is an array of subdocuments (`[{ userId: ObjectId }]`). Accessing `.userId` directly on an array object returns `undefined`. Thus, `isFounder` evaluates to `false` for legitimate company founders, preventing them from updating, closing, or deleting jobs unless they have role `ADMIN`.
- **Inconsistent Founder Check Implementation**:
  - `company.contoller.js` and `application.controller.js` use `.some()` correctly:
    `const isFounder = company.founders?.some(founder => founder.userId?._id?.toString() === req.user._id.toString());`
- **Spelling Inconsistencies**: Filenames `company.contoller.js`, `student.contoller.js`, and `user.contoller.js` are misspelled (`contoller` instead of `controller`).

### 2.3 Middleware & Security Layer (`src/middlewares/*.js`)
- **`auth.middleware.js`**: `verifyJWT` extracts tokens from cookies or Authorization headers. `verifyRole` checks roles.
- **`admin.middleware.js`**: `verifyAdmin` checks for `ADMIN` role. `checkNotBlocked` verifies user `status !== "BLOCKED"`.
- **`multer.middleware.js`**: Saves files to `./public` using `file.originalname` without sanitization or unique random IDs. Concurrent uploads with identical names overwrite each other on local disk.

### 2.4 Data Layer & Schemas (`src/models/*.js`)
- **Active Models (7)**: `User`, `Student`, `Company`, `Job`, `Application`, `CompanyInvite`, `VerificationApplication`.
- **Dead Models (2)**: `block.models.js` and `notification.models.js` are completely commented out.
- **Static Schema Expiration Bug**:
  - In [src/models/companyinvite.models.js#L26](file:///d:/CS/JobPosting/JobPostingBackend/src/models/companyinvite.models.js#L26):
    `default: Date.now() + 15*60*1000` evaluates `Date.now()` at module boot time, locking expiration dates for all documents created without an explicit `expiredAt`.
- **Schema Field Property Typo**:
  - In [src/models/application.models.js#L28](file:///d:/CS/JobPosting/JobPostingBackend/src/models/application.models.js#L28):
    Field is defined as `addtionalDocuments` (missing 'i'), but controllers pass `additionalDocuments`.
- **Schema Property Mismapping in Student Route**:
  - In `src/routes/student.routes.js`: Sets `verifiedBy: req.user._id`, but `student.models.js` schema field is named `approvedBy`. In Mongoose strict mode, `verifiedBy` is silently ignored.

### 2.5 Error Handling Architecture (`src/utils/ApiError.js`, `src/utils/asynchandler.js`)
- **`ApiError` Parameter Mismatch**: Sets `this.code = statusCode` while standard Node/Express errors expect `this.statusCode`.
- **`ApiResponse` Status Property Mismatch**: Sets `this.statuscode` (lowercase 'c'), resulting in `{ statuscode: 200 }` in JSON bodies.
- **Missing Global Express Error Middleware**: `src/app.js` has no centralized 4-parameter error handler middleware (`app.use((err, req, res, next) => ...)`). Exceptions outside `asynchandler` yield Express HTML error pages.

### 2.6 File Upload & Cloud Storage (`src/utils/cloudinary.js`)
- **Cloudinary Deletion Failure**:
  - `user.contoller.js` and `student.contoller.js` pass full Cloudinary URLs to `DeletefromCloudinary` instead of public IDs.
  - `DeletefromCloudinary` defaults to `resource_type: "image"`. Raw documents (PDFs, DOCs) uploaded with `uploadDocumentOnCloudinary` fail deletion on Cloudinary.

### 2.7 Dependencies (`package.json`)
- **Redundant Hashing Libraries**: Both `bcrypt` (`^6.0.0`) and `bcryptjs` (`^3.0.3`) are listed in `package.json`. Code strictly imports `bcrypt`. `bcryptjs` is unused.

### 2.8 Infrastructure & Operations
- **Testing**: 0 tests present (`npm test` returns exit code 1 error script).
- **Docker**: No Dockerfile or compose configuration.
- **CI/CD**: No GitHub Actions pipeline.
- **Logging**: No structured logging (uses raw `console.log`). No request correlation IDs (`X-Request-ID`).
- **Monitoring / Health**: Basic `/api/v1/health` endpoint exists, but no DB readiness check or liveness probe.

---

## 3. Targeted Remediation Strategy

To transform this repository into a production-grade enterprise modular monolith, we execute the following phased roadmap:

1. **Phase 1: Security, Safety & Operational Foundation**
   - Fix broken founder authorization bug in `job.controller.js`.
   - Restrict CORS origin in `src/app.js` to whitelist configuration.
   - Fix Cloudinary deletion utility to parse public IDs and resource types correctly.
   - Fix static date default in `companyinvite.models.js`.
   - Fix schema field name mismatch in `student.routes.js` and `application.models.js`.
   - Implement centralized error architecture (`AppError`, global Express error handler).
   - Implement centralized schema validation using Zod.
   - Implement structured logging with Pino and request correlation IDs (`X-Request-ID`).
   - Implement centralized configuration management (`src/config/env.js`).

2. **Phase 2: Automated Testing Infrastructure**
   - Setup Jest / Vitest + Supertest testing suite.
   - Implement unit and integration tests covering security, authorization, authentication, and core business rules.

3. **Phase 3: Domain-Driven Modular Monolith Architecture**
   - Re-organize codebase into domain modules under `src/modules/` (`identity`, `students`, `companies`, `jobs`, `applications`, `invitations`, `verification`, `administration`).
   - Extract use cases, domain policies, and repositories to decouple business logic from HTTP and Mongoose controllers.

4. **Phase 4: Infrastructure & Operations**
   - Production Docker containerization (multi-stage Dockerfile, docker-compose).
   - GitHub Actions CI pipeline.
   - Health probes (`/health/live`, `/health/ready`) and graceful shutdown handlers (`SIGTERM`/`SIGINT`).

5. **Phase 5: Observability, Contracts & Documentation**
   - OpenAPI 3.0 specification (`docs/openapi.yaml`).
   - Enterprise Architecture Master Document (`docs/ENTERPRISE_ARCHITECTURE.md`).
