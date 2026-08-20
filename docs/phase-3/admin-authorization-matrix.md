# Architecture Decision Record — Admin Authorization Matrix

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Admin Authorization  

---

## Authorization Matrix

| Endpoint | Operation | Anonymous | Student | Company | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `POST /api/v1/admin/create-admin` | Create Admin | ❌ | ❌ | ❌ | ✅ |
| `DELETE /api/v1/admin/remove-admin/:userId` | Remove Admin | ❌ | ❌ | ❌ | ✅ |
| `GET /api/v1/admin/users` | List Users | ❌ | ❌ | ❌ | ✅ |
| `PATCH /api/v1/admin/users/:userId/block` | Block User | ❌ | ❌ | ❌ | ✅ |
| `PATCH /api/v1/admin/users/:userId/unblock` | Unblock User | ❌ | ❌ | ❌ | ✅ |
| `PATCH /api/v1/admin/companies/:companyId/block` | Block Company | ❌ | ❌ | ❌ | ✅ |
| `PATCH /api/v1/admin/companies/:companyId/unblock` | Unblock Company | ❌ | ❌ | ❌ | ✅ |
| `GET /api/v1/admin/applications` | List All Applications | ❌ | ❌ | ❌ | ✅ |
| `DELETE /api/v1/admin/applications/:applicationId` | Delete Application | ❌ | ❌ | ❌ | ✅ |
| `GET /api/v1/admin/jobs` | List All Jobs | ❌ | ❌ | ❌ | ✅ |
| `PATCH /api/v1/admin/jobs/:jobId` | Modify Job | ❌ | ❌ | ❌ | ✅ |
| `DELETE /api/v1/admin/jobs/:jobId` | Delete Job | ❌ | ❌ | ❌ | ✅ |
