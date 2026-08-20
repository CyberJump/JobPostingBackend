# CHG-0017 Pre-Implementation Baseline Snapshot

> **Date**: 2026-08-16  
> **Status**: Baseline Recorded  

---

## 1. Baseline Summary
- **Branch**: `main`
- **Infrastructure Status**: CHG-0009 Shared Infrastructure, CHG-0010 Auth, CHG-0011 Users, CHG-0012 Companies, CHG-0013 Jobs, CHG-0014 Applications, CHG-0015 Email Verification, CHG-0016 Student Verification active.
- **Test Status**: 24 test suites passed, 102 tests passing with 100% success (`npm test`).

## 2. Active Admin Endpoints Inventory
- `POST /api/v1/admin/create-admin` -> `CreateAdmin`
- `DELETE /api/v1/admin/remove-admin/:userId` -> `RemoveAdmin`
- `GET /api/v1/admin/users` -> `GetAllUsers`
- `PATCH /api/v1/admin/users/:userId/block` -> `BlockUser`
- `PATCH /api/v1/admin/users/:userId/unblock` -> `UnblockUser`
- `PATCH /api/v1/admin/companies/:companyId/block` -> `BlockCompany`
- `PATCH /api/v1/admin/companies/:companyId/unblock` -> `UnblockCompany`
- `GET /api/v1/admin/applications` -> `GetAllApplicationsAdmin`
- `DELETE /api/v1/admin/applications/:applicationId` -> `DeleteApplicationAdmin`
- `GET /api/v1/admin/jobs` -> `GetAllJobsAdmin`
- `PATCH /api/v1/admin/jobs/:jobId` -> `ModifyJobAdmin`
- `DELETE /api/v1/admin/jobs/:jobId` -> `DeleteJobAdmin`
