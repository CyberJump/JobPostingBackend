# CHG-0014 Pre-Implementation Baseline Snapshot

> **Date**: 2026-08-16  
> **Status**: Baseline Recorded  

---

## 1. Baseline Summary
- **Branch**: `main`
- **Infrastructure Status**: CHG-0009 Shared Infrastructure, CHG-0010 Auth, CHG-0011 Users, CHG-0012 Companies, and CHG-0013 Jobs active.
- **Test Status**: 18 test suites passed, 80 tests passing with 100% success (`npm test`).

## 2. Active Applications Endpoints Inventory
- `POST /api/v1/applications/submit` -> `SubmitApplication`
- `DELETE /api/v1/applications/:applicationId` -> `DeleteApplication`
- `GET /api/v1/applications/my-applications` -> `GetUserApplications`
- `GET /api/v1/applications/:applicationId/status` -> `GetApplicationStatus`
- `GET /api/v1/applications/job/:jobId` -> `GetJobApplications`
- `PATCH /api/v1/applications/:applicationId/review` -> `ReviewApplication`
