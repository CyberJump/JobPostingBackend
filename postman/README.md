# Postman Collection & Newman Execution Guide

This directory contains the complete black-box API verification collection and environment definitions for `JobPostingBackend`.

---

## Artifact Files

- **[JobPostingBackend.postman_collection.json](file:///d:/CS/JobPosting/JobPostingBackend/postman/JobPostingBackend.postman_collection.json)**: Complete Postman test collection covering all 63 active endpoints across Health, Auth, OTP, Email Verification, Users, Companies, Company Invites, Jobs, Applications, Student Profile, Student Verification, Admin Moderation, RBAC/IDOR, Rate Limiting, Idempotency, and Error Contracts.
- **[JobPostingBackend.postman_environment.json](file:///d:/CS/JobPosting/JobPostingBackend/postman/JobPostingBackend.postman_environment.json)**: Environment definitions (Base URL, test credentials, tokens, dynamic IDs).

---

## Prerequisites & Setup

1. **Active Application Server / Containers**:
   Ensure Docker containers or local dev server are running and healthy:
   ```bash
   docker compose up -d
   ```
   Or local node runtime:
   ```bash
   npm run dev
   ```
   Verify readiness probe returns `200 OK`:
   ```bash
   curl http://localhost:8000/api/v1/health/ready
   ```

2. **Newman CLI**:
   Run via `npx` (no global installation required):
   ```bash
   npx newman --version
   ```

---

## Executing Newman Test Suite

Run the full automated black-box test suite against local/staging environment:

```bash
npx newman run postman/JobPostingBackend.postman_collection.json \
  -e postman/JobPostingBackend.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export reports/postman-newman-report.json
```

---

## Complete Test Suite Organization (15 Folders)

1. **`01 - Health & Observability`**:
   - `GET /api/v1` (Root API Info & Metadata)
   - `GET /api/v1/health` (Service Health Status)
   - `GET /api/v1/health/live` (Liveness Probe)
   - `GET /api/v1/health/ready` (Readiness Probe with DB & Redis status)

2. **`02 - Auth & Sessions`**:
   - `POST /api/v1/users/register` (Student, Founder, Second Founder, Admin registration)
   - `POST /api/v1/users/login` (Authentication & Access / Refresh Token extraction)
   - `POST /api/v1/users/refresh-token` (Token rotation)
   - `POST /api/v1/users/change-password` (Password update)
   - `POST /api/v1/users/logout` (Session revocation & Cookie clearance)

3. **`03 - OTP Authentication`**:
   - `POST /api/v1/auth/otp/request` (Email verification & Password reset OTP generation)
   - `POST /api/v1/auth/otp/verify` (6-digit OTP verification)

4. **`04 - Email Verification`**:
   - `POST /api/v1/auth/email-verification/request` (Email verification code request)
   - `POST /api/v1/auth/email-verification/verify` (Email code verification & activation)

5. **`05 - User Profile & Account`**:
   - `GET /api/v1/users/current-user` (Profile fetch)
   - `PATCH /api/v1/users/update-account` (Name, email, username updates)
   - `PATCH /api/v1/users/update-profile-photo` (Multipart avatar upload)

6. **`06 - Companies Management`**:
   - `POST /api/v1/companies/register` (Company registration by COMPANY role)
   - `GET /api/v1/companies` (Public paginated company listing)
   - `GET /api/v1/companies/my` (Founder company listing)
   - `GET /api/v1/companies/:companyId` (Company details)
   - `PATCH /api/v1/companies/:companyId/update` (Company updates)
   - `DELETE /api/v1/companies/:companyId/withdraw` (Company withdrawal)

7. **`07 - Company Invites`**:
   - `POST /api/v1/invites/send` (Send founder invite to user)
   - `GET /api/v1/invites/my-invites` (List invites received by user)
   - `GET /api/v1/invites/company/:companyId` (List invites sent by company)
   - `POST /api/v1/invites/:inviteId/accept` (Accept invite & promote to founder)
   - `POST /api/v1/invites/:inviteId/reject` (Reject invite)
   - `DELETE /api/v1/invites/:inviteId/cancel` (Cancel pending invite)

8. **`08 - Jobs Management`**:
   - `POST /api/v1/jobs/create` (Create job posting)
   - `GET /api/v1/jobs` (Public paginated & filtered job search)
   - `GET /api/v1/jobs/:jobId` (Job details by ID)
   - `PATCH /api/v1/jobs/:jobId/update` (Job posting update)
   - `PATCH /api/v1/jobs/:jobId/close` (Close job posting)
   - `DELETE /api/v1/jobs/:jobId/delete` (Delete job posting)

9. **`09 - Applications Lifecycle`**:
   - `POST /api/v1/applications/submit` (Submit application with resume)
   - `GET /api/v1/applications/my-applications` (Student applications history)
   - `GET /api/v1/applications/:applicationId/status` (Application status tracking)
   - `GET /api/v1/applications/job/:jobId` (Company review applicant list)
   - `PATCH /api/v1/applications/:applicationId/review` (Shortlist/Offer/Reject)
   - `DELETE /api/v1/applications/:applicationId` (Application withdrawal)

10. **`10 - Student Academic Profile`**:
    - `POST /api/v1/students` (Create student academic profile with document)
    - `GET /api/v1/students/profile` (Get student profile)
    - `PATCH /api/v1/students/profile` (Update student profile)
    - `GET /api/v1/students/pending` (Admin get pending student profiles)
    - `PATCH /api/v1/students/:studentId/verify` (Admin verify student)
    - `PATCH /api/v1/students/:studentId/reject` (Admin reject student)

11. **`11 - Verification Requests (Workflow)`**:
    - `POST /api/v1/verifications` (Submit student/organization verification request)
    - `GET /api/v1/verifications/my-request` (Get verification request status)
    - `GET /api/v1/verifications` (Admin get pending verification requests)
    - `PATCH /api/v1/verifications/:requestId/approve` (Admin approve verification)
    - `PATCH /api/v1/verifications/:requestId/reject` (Admin reject verification)

12. **`12 - Admin Management & Moderation`**:
    - `POST /api/v1/admin/create-admin` (Create admin user)
    - `DELETE /api/v1/admin/remove-admin/:userId` (Revoke admin permissions)
    - `GET /api/v1/admin/users` (Admin user moderation listing)
    - `PATCH /api/v1/admin/users/:userId/block` (Block user)
    - `PATCH /api/v1/admin/users/:userId/unblock` (Unblock user)
    - `PATCH /api/v1/admin/companies/:companyId/block` (Block company)
    - `PATCH /api/v1/admin/companies/:companyId/unblock` (Unblock company)
    - `GET /api/v1/admin/applications` (Admin list all applications)
    - `DELETE /api/v1/admin/applications/:applicationId` (Admin delete application)
    - `GET /api/v1/admin/jobs` (Admin list all jobs)
    - `PATCH /api/v1/admin/jobs/:jobId` (Admin modify job)
    - `DELETE /api/v1/admin/jobs/:jobId` (Admin delete job)

13. **`13 - Security & RBAC / IDOR`**:
    - Role protection checks (Student -> Admin route, Student -> Company routes, Company -> Admin route)
    - Unauthenticated endpoint access rejection (401)

14. **`14 - Rate Limiting & Idempotency`**:
    - Burst rate limit test (`POST /api/v1/auth/otp/request` -> 429)
    - Idempotency test with `X-Idempotency-Key`

15. **`15 - Error Contracts & Validation`**:
    - Zod validation schema contract tests (400 Bad Request envelope)
    - 404 Not Found envelope tests
    - Parameter formatting error envelope tests

---

## Safety & Non-Destruction Notice

- **STAGING/LOCAL ONLY**: Do not execute destructive endpoints against production databases.
- All test payloads use disposable `@example.com` domains.
