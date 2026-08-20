# Legacy & Unmounted Route Audit (`docs/LEGACY_ROUTE_AUDIT.md`)

> **Audit Date**: 2026-08-15  
> **Auditor**: Senior Backend Architect  
> **Scope**: Investigation of Route Mounting & Reachability  

---

## 1. Executive Summary

- **Total Active Endpoints**: **57**
- **Mounted Router Files**: 8 (`user`, `job`, `application`, `company`, `companyinvite`, `student`, `verification`, `admin`)
- **Unmounted / Inactive / Dead Code Routes**: **0**

Every single endpoint cataloged in `BACKEND_DOCUMENTATION.md` is fully imported, mounted on `/api/v1/*` in [src/app.js](file:///d:/CS/JobPosting/JobPostingBackend/src/app.js), and reachable via HTTP.

---

## 2. Route Inventory & Mounting Analysis

| Domain | Route File | Mounted Prefix in `src/app.js` | Endpoint Count | Reachable Status | Recommended Action |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Users** | `src/routes/user.routes.js` | `/api/v1/users` | 8 | **ACTIVE** | KEEP |
| **Jobs** | `src/routes/job.routes.js` | `/api/v1/jobs` | 6 | **ACTIVE** | KEEP |
| **Applications** | `src/routes/application.routes.js` | `/api/v1/applications` | 6 | **ACTIVE** | KEEP |
| **Companies** | `src/routes/company.routes.js` | `/api/v1/companies` | 6 | **ACTIVE** | KEEP |
| **Invites** | `src/routes/companyinvite.routes.js` | `/api/v1/invites` | 6 | **ACTIVE** | KEEP |
| **Students** | `src/routes/student.routes.js` | `/api/v1/students` | 6 | **ACTIVE** | KEEP |
| **Verifications** | `src/routes/verification.routes.js` | `/api/v1/verifications` | 5 | **ACTIVE** | KEEP |
| **Admin** | `src/routes/admin.routes.js` | `/api/v1/admin` | 12 | **ACTIVE** | KEEP |
| **Health** | `src/app.js` | `/api/v1` | 2 | **ACTIVE** | KEEP |

Total Active Reachable Endpoints: **57**.
