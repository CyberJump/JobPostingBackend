# API Evolution & Contract Preservation Plan (`docs/phase-3/API_CHANGE_PLAN.md`)

> **Contract Policy**: 100% Backward Compatibility for `/api/v1/*`; Zero Breaking Payload Changes  
> **Status**: Stage A API Evolution Specification  

---

## 1. Preserved Baseline Endpoints (57 Active Routes)

All 57 active routes cataloged in `BACKEND_DOCUMENTATION.md` and `docs/API_VALIDATION_MATRIX.md` will retain their existing HTTP methods, URL patterns, header requirements, and JSON response envelopes (`new ApiResponse(statusCode, data, message)`).

---

## 2. Proposed New Non-Breaking Infrastructure Endpoints

| Endpoint | Method | Domain | Auth | Rate Limit | Cache | Validation | Breaking? | Purpose |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `/api/v1/auth/otp/request` | `POST` | Auth | None | Strict (Redis 3/hr) | No | `requestOtpSchema` | No | Requests OTP for email verification / password reset |
| `/api/v1/auth/otp/verify` | `POST` | Auth | None | Strict (Redis 5/hr) | No | `verifyOtpSchema` | No | Verifies 6-digit SHA-256 OTP code |
| `/api/v1/health/live` | `GET` | Shared | None | None | No | None | No | Kubernetes / Container Liveness Probe |
| `/api/v1/health/ready` | `GET` | Shared | None | None | No | None | No | Readiness probe verifying DB & Redis health |

---

## 3. Progressive Zod Validation Binding Plan

During Phase 3 domain migrations, the 12 endpoints currently using controller/Multer boundary validation will be progressively bound with explicit Zod middleware:

1. `POST /api/v1/applications/submit` -> Bound with `submitApplicationSchema` (Multer + file validation)
2. `PATCH /api/v1/applications/:applicationId/status` -> Bound with `reviewApplicationSchema`
3. `POST /api/v1/companies/create` -> Bound with `createCompanySchema`
4. `PATCH /api/v1/companies/:companyId/update` -> Bound with `updateCompanySchema`
5. `POST /api/v1/invites/send` -> Bound with `sendInviteSchema`
6. `POST /api/v1/invites/:inviteId/accept` -> Bound with `respondInviteSchema`
7. `POST /api/v1/invites/:inviteId/reject` -> Bound with `respondInviteSchema`
8. `POST /api/v1/students/onboarding` -> Bound with `onboardingStudentSchema`
9. `POST /api/v1/verifications/request` -> Bound with `createVerificationSchema`
10. `PATCH /api/v1/verifications/:id/review` -> Bound with `reviewVerificationSchema`
11. `POST /api/v1/admin/users/:userId/block` -> Bound with `blockUserSchema`
12. `POST /api/v1/admin/companies/:companyId/block` -> Bound with `blockCompanySchema`

**Target Validation Gate**: 57 / 57 endpoints with explicit Zod schema validation by end of Phase 3.
