# Current Architecture Discovery (`docs/phase-3/CURRENT_ARCHITECTURE.md`)

> **Architectural Status**: Legacy Monolith with Standardized Infrastructure Foundations (CHG-0001..CHG-0007)  
> **Evaluation Date**: 2026-08-16  

---

## 1. Executive Overview

The current backend architecture of `JobPostingBackend` (`BusinessClinic API`) operates as an Express 5.x monolithic web server. While Phases 0–2 established robust operational foundations (centralized Zod environment configuration, Pino structured logging, `X-Request-ID` correlation IDs, `AppError` class hierarchy, and CORS allowlisting), the internal application design remains tightly coupled around Express request handlers.

---

## 2. Request Flow Breakdown

```text
HTTP Client Request (HTTPS / Cookie / Bearer JWT)
       │
       ▼
X-Request-ID Correlation Middleware (src/middlewares/requestContext.middleware.js)
       │
       ▼
CORS Whitelist Verification (src/app.js)
       │
       ▼
Zod Input Validation Middleware (src/middlewares/validate.middleware.js)
       │
       ▼
JWT Authentication & Role Middleware (src/middlewares/auth.middleware.js)
       │
       ▼
Monolithic Controller Function (e.g. src/controllers/job.controller.js)
  ├── Parses req.body / req.params / req.file
  ├── Executes inline authorization policy checks (e.g. isFounder array calculation)
  ├── Executes Mongoose queries directly (e.g. Job.findById, Job.aggregate)
  ├── Invokes external storage SDK directly (e.g. DeletefromCloudinary)
  └── Returns Express HTTP response (new ApiResponse(200, data))
       │ [On Error]
       ▼
Global Error Handler Middleware (src/middlewares/error.middleware.js)
```

---

## 3. Structural Analysis & Architectural Coupling Points

1. **Monolithic Controllers**: Controllers house HTTP payload parsing, domain validation, role authorization, resource ownership policies, Mongoose queries, Cloudinary SDK calls, and response formatting in single functions.
2. **Direct Mongoose Dependency**: Controllers directly import Mongoose models (`User`, `Job`, `Application`, `Company`, `Student`, `CompanyInvite`, `VerificationApplication`). No abstraction layer or repository boundary exists between business logic and database ORMs.
3. **Lack of Use Cases**: Business operations (e.g. `RegisterCompany`, `SubmitApplication`, `ReviewApplication`) lack dedicated use-case classes, preventing reusable unit testing without mocking Express `req`/`res`.
4. **Missing Cache Layer**: 0 endpoints use Redis caching; all read queries (`GetAllJobs`, `GetCompanyDetails`, `GetStudentDetails`) directly query MongoDB Atlas.
5. **Missing Distributed Rate Limiting**: Endpoint rate limiting is not configured; brute-force attacks on `/login` or `/refresh-token` are unmitigated at the application tier.
6. **No Asynchronous Event Queue**: Multi-step processes (e.g., student verification approval, co-founder invite dispatch) operate synchronously within the HTTP request thread.

---

## 4. Subsystem Coupling Audit

| Layer / Subsystem | Current Implementation | Target Architectural State |
| :--- | :--- | :--- |
| **HTTP Transport** | Express 5.x controllers handle req/res directly | Controllers delegate HTTP input parsing to Application Use Cases |
| **Business Logic** | Embedded inside Express controllers | Isolated in pure, testable Domain Use Cases and Domain Policies |
| **Data Persistence** | Controllers query Mongoose models directly | Domain/Application layers invoke Repository interfaces |
| **Caching & OTP** | Non-existent; direct DB queries only | Redis infrastructure providing Cache-Aside, Rate Limiting, and Secure OTP |
| **Authorization** | Inlined array checks inside controller functions | Centralized Domain Policies (`JobPolicy`, `ApplicationPolicy`, `CompanyPolicy`) |
| **File Storage** | Controllers invoke `cloudinary.uploader` helper directly | Domain invokes `StorageProvider` infrastructure interface |
