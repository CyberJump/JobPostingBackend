# API Validation & Schema Matrix (`docs/API_VALIDATION_MATRIX.md`)

> **Inventory Date**: 2026-08-15  
> **Target Baseline**: All 57 API Endpoints  
> **Status**: Zod Validation Schemas Implemented & Attached  

---

## 1. Complete API Route Validation Inventory

| # | Method | Endpoint | Body Schema | Query Schema | Params Schema | Headers | Validation Status |
|---|---|---|---|---|---|---|---|
| 1 | `POST` | `/api/v1/users/register` | `registerUserSchema` | None | None | None | **VALIDATED** |
| 2 | `POST` | `/api/v1/users/login` | `loginUserSchema` | None | None | None | **VALIDATED** |
| 3 | `POST` | `/api/v1/users/refresh-token` | `refreshAccessTokenSchema` | None | None | Cookies / Header | **VALIDATED** |
| 4 | `POST` | `/api/v1/users/logout` | None | None | None | Bearer JWT / Cookies | **VALIDATED** (Auth) |
| 5 | `POST` | `/api/v1/users/change-password` | `changePasswordSchema` | None | None | Bearer JWT / Cookies | **VALIDATED** |
| 6 | `GET` | `/api/v1/users/current-user` | None | None | None | Bearer JWT / Cookies | **VALIDATED** (Auth) |
| 7 | `PATCH` | `/api/v1/users/update-account` | `updateAccountDetailsSchema` | None | None | Bearer JWT / Cookies | **VALIDATED** |
| 8 | `PATCH` | `/api/v1/users/update-profile-photo` | File Payload | None | None | Multipart | **VALIDATED** (Multer) |
| 9 | `GET` | `/api/v1/jobs` | None | `getJobsQuerySchema` | None | None | **VALIDATED** |
| 10 | `GET` | `/api/v1/jobs/:jobId` | None | None | `mongoIdParamSchema` | None | **VALIDATED** |
| 11 | `POST` | `/api/v1/jobs/create` | `createJobSchema` | None | None | Bearer JWT | **VALIDATED** |
| 12 | `PATCH` | `/api/v1/jobs/:jobId/update` | `updateJobSchema` | None | `mongoIdParamSchema` | Bearer JWT | **VALIDATED** |
| 13 | `PATCH` | `/api/v1/jobs/:jobId/close` | None | None | `mongoIdParamSchema` | Bearer JWT | **VALIDATED** |
| 14 | `DELETE` | `/api/v1/jobs/:jobId/delete` | None | None | `mongoIdParamSchema` | Bearer JWT | **VALIDATED** |
| 15 | `POST` | `/api/v1/applications/apply/:jobId` | Multipart | None | `mongoIdParamSchema` | Bearer JWT | **VALIDATED** |
| 16 | `GET` | `/api/v1/applications/user` | None | `paginationQuerySchema` | None | Bearer JWT | **VALIDATED** |
| 17 | `GET` | `/api/v1/applications/job/:jobId` | None | `paginationQuerySchema` | `mongoIdParamSchema` | Bearer JWT | **VALIDATED** |
| 18 | `PATCH` | `/api/v1/applications/:applicationId/status` | `reviewApplicationSchema` | None | `mongoIdParamSchema` | Bearer JWT | **VALIDATED** |
| 19 | `DELETE` | `/api/v1/applications/:applicationId/withdraw` | None | None | `mongoIdParamSchema` | Bearer JWT | **VALIDATED** |
| 20 | `POST` | `/api/v1/companies/create` | `createCompanySchema` | None | None | Bearer JWT | **VALIDATED** |
| 21 | `GET` | `/api/v1/companies/my-companies` | None | None | None | Bearer JWT | **VALIDATED** |
| 22 | `GET` | `/api/v1/companies/:companyId` | None | None | `mongoIdParamSchema` | None | **VALIDATED** |
| 23 | `PATCH` | `/api/v1/companies/:companyId/update` | `updateCompanySchema` | None | `mongoIdParamSchema` | Bearer JWT | **VALIDATED** |
| 24 | `POST` | `/api/v1/invites/send` | `sendInviteSchema` | None | None | Bearer JWT | **VALIDATED** |
| 25 | `POST` | `/api/v1/invites/accept` | `respondInviteSchema` | None | None | Bearer JWT | **VALIDATED** |
| 26 | `POST` | `/api/v1/invites/reject` | `respondInviteSchema` | None | None | Bearer JWT | **VALIDATED** |
| 27 | `GET` | `/api/v1/invites/my-invites` | None | None | None | Bearer JWT | **VALIDATED** |
| 28 | `POST` | `/api/v1/students/onboarding` | Multipart | None | None | Bearer JWT | **VALIDATED** |
| 29 | `GET` | `/api/v1/students/profile` | None | None | None | Bearer JWT | **VALIDATED** |
| 30 | `PATCH` | `/api/v1/students/:studentId/verify` | None | None | `mongoIdParamSchema` | Bearer JWT (Admin) | **VALIDATED** |
| 31 | `POST` | `/api/v1/verifications/request` | Multipart | None | None | Bearer JWT | **VALIDATED** |
| 32 | `GET` | `/api/v1/verifications/my-requests` | None | None | None | Bearer JWT | **VALIDATED** |
| 33 | `GET` | `/api/v1/verifications/pending` | None | `paginationQuerySchema` | None | Bearer JWT (Admin) | **VALIDATED** |
| 34 | `PATCH` | `/api/v1/verifications/:id/review` | `reviewVerificationSchema` | None | `mongoIdParamSchema` | Bearer JWT (Admin) | **VALIDATED** |
| 35 | `POST` | `/api/v1/admin/users/:userId/block` | `blockUserSchema` | None | `mongoIdParamSchema` | Bearer JWT (Admin) | **VALIDATED** |
| 36 | `POST` | `/api/v1/admin/users/:userId/unblock` | None | None | `mongoIdParamSchema` | Bearer JWT (Admin) | **VALIDATED** |
| 37 | `POST` | `/api/v1/admin/companies/:companyId/block` | `blockCompanySchema` | None | `mongoIdParamSchema` | Bearer JWT (Admin) | **VALIDATED** |
| 38 | `POST` | `/api/v1/admin/companies/:companyId/unblock` | None | None | `mongoIdParamSchema` | Bearer JWT (Admin) | **VALIDATED** |
| 39 | `GET` | `/api/v1/admin/users` | None | `paginationQuerySchema` | None | Bearer JWT (Admin) | **VALIDATED** |
| 40 | `GET` | `/api/v1/admin/companies` | None | `paginationQuerySchema` | None | Bearer JWT (Admin) | **VALIDATED** |
| 41 | `GET` | `/api/v1/admin/jobs` | None | `paginationQuerySchema` | None | Bearer JWT (Admin) | **VALIDATED** |
| 42 | `GET` | `/api/v1/admin/applications` | None | `paginationQuerySchema` | None | Bearer JWT (Admin) | **VALIDATED** |
| 43 | `GET` | `/api/v1/admin/stats` | None | None | None | Bearer JWT (Admin) | **VALIDATED** |
| 44 | `GET` | `/api/v1/health` | None | None | None | None | **VALIDATED** (Probe) |
| 45 | `GET` | `/api/v1` | None | None | None | None | **VALIDATED** (Probe) |

*(Endpoints 46-57 include internal sub-routes and administrative filter variants cataloged in BACKEND_DOCUMENTATION.md)*
