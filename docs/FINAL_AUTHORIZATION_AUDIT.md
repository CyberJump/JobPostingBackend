# Final Authorization Security Audit (`docs/FINAL_AUTHORIZATION_AUDIT.md`)

> **Audit Date**: 2026-08-15  
> **Auditor**: Principal Security Engineer  
> **Scope**: Authentication, Role Verification, Ownership Checks, Block Checks across 57 Endpoints  

---

## 1. Executive Summary

This audit evaluates the access control enforcement across all routes in `JobPostingBackend`.

- **Authentication Middleware (`verifyJWT`)**: Attached to all protected routes.
- **Role Authorization (`verifyRole`)**: Correctly restricts `ADMIN`, `COMPANY`, and `STUDENT` privileged routes.
- **Moderation Check (`checkNotBlocked`)**: Attached to user state-changing routes to prevent blocked entities from creating jobs, applying, or registering companies.
- **Founder Membership Policy**: In `src/controllers/job.controller.js` and `src/controllers/application.controller.js`, founder array membership uses `.some(f => (f.userId?._id || f.userId)?.toString() === req.user._id.toString())`.
- **Authorization Audit Score**: **4 / 5 (Production Ready)**.

---

## 2. Authorization Verification Matrix

| Endpoint | Authentication | Role Enforcement | Resource Ownership | Admin Override | Blocked User Check | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `POST /users/register` | Public | Optional | N/A | N/A | N/A | **VERIFIED** |
| `POST /users/login` | Public | None | N/A | N/A | N/A | **VERIFIED** |
| `POST /users/logout` | `verifyJWT` | Any | Self | Yes | N/A | **VERIFIED** |
| `POST /users/change-password` | `verifyJWT` | Any | Self | N/A | N/A | **VERIFIED** |
| `PATCH /users/update-account` | `verifyJWT` | Any | Self | N/A | N/A | **VERIFIED** |
| `POST /jobs/create` | `verifyJWT` | `COMPANY` | Founder | Yes | `checkNotBlocked` | **VERIFIED** |
| `PATCH /jobs/:jobId/update` | `verifyJWT` | Any | Founder Check | Yes | `checkNotBlocked` | **VERIFIED** |
| `PATCH /jobs/:jobId/close` | `verifyJWT` | Any | Founder Check | Yes | `checkNotBlocked` | **VERIFIED** |
| `DELETE /jobs/:jobId/delete` | `verifyJWT` | Any | Founder Check | Yes | `checkNotBlocked` | **VERIFIED** |
| `POST /applications/apply/:jobId` | `verifyJWT` | Any | Self | N/A | `checkNotBlocked` | **VERIFIED** |
| `GET /applications/job/:jobId` | `verifyJWT` | `COMPANY` | Founder Check | Yes | `checkNotBlocked` | **VERIFIED** |
| `PATCH /applications/:id/status` | `verifyJWT` | `COMPANY` | Founder Check | Yes | `checkNotBlocked` | **VERIFIED** |
| `POST /companies/register` | `verifyJWT` | `COMPANY` | Founder | Yes | `checkNotBlocked` | **VERIFIED** |
| `PATCH /companies/:id/update` | `verifyJWT` | Any | Founder Check | Yes | `checkNotBlocked` | **VERIFIED** |
| `POST /invites/send` | `verifyJWT` | `COMPANY` | Founder Check | Yes | `checkNotBlocked` | **VERIFIED** |
| `POST /invites/:id/accept` | `verifyJWT` | Any | Invited Email | N/A | `checkNotBlocked` | **VERIFIED** |
| `ALL /admin/*` | `verifyJWT` | `ADMIN` | N/A | Full | N/A | **VERIFIED** |
