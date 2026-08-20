# Phase 3 — Admin & Moderation Audit

> **Audit Date**: 2026-08-16  
> **Auditor**: Senior Backend Architect & Security Auditor  
> **Target**: Admin & Moderation Domain  

---

## 1. Baseline Route Inventory & Handler Audit
- `POST /api/v1/admin/create-admin` -> Create new admin account (`CreateAdmin`).
- `DELETE /api/v1/admin/remove-admin/:userId` -> Demote admin user to student role (`RemoveAdmin`).
- `GET /api/v1/admin/users` -> List and filter users (`GetAllUsers`).
- `PATCH /api/v1/admin/users/:userId/block` -> Block user (`BlockUser`).
- `PATCH /api/v1/admin/users/:userId/unblock` -> Unblock user (`UnblockUser`).
- `PATCH /api/v1/admin/companies/:companyId/block` -> Block company (`BlockCompany`).
- `PATCH /api/v1/admin/companies/:companyId/unblock` -> Unblock company (`UnblockCompany`).
- `GET /api/v1/admin/applications` -> List applications across companies/jobs with aggregation (`GetAllApplicationsAdmin`).
- `DELETE /api/v1/admin/applications/:applicationId` -> Delete application (`DeleteApplicationAdmin`).
- `GET /api/v1/admin/jobs` -> List jobs across companies with aggregation (`GetAllJobsAdmin`).
- `PATCH /api/v1/admin/jobs/:jobId` -> Update job details (`ModifyJobAdmin`).
- `DELETE /api/v1/admin/jobs/:jobId` -> Delete job (`DeleteJobAdmin`).

## 2. Migration Target
- Clean modular monolith component: `src/modules/admin/`.
