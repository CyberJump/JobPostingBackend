# BACKEND-TO-FRONTEND CONTRACT SPECIFICATION

> **Target Platform**: `JobPostingFrontend`  
> **Author**: Lead Frontend Architect, Product Designer, UX Engineer & Senior Full-Stack Engineer  
> **Source of Truth**: `JobPostingBackend` Repository, Mongoose Schemas, Repositories, Domain Policies, Routes, Redis Keyspace, and Tests.  
> **Status**: APPROVED CONTRACT (`VERIFIED`)

---

## 1. COMMUNICATION & PROTOCOL BASELINE

- **API Base URL**: `http://localhost:8000/api/v1` (Configured via `VITE_API_URL` / `NEXT_PUBLIC_API_URL`).
- **Transport Format**: JSON (`application/json`) for standard requests; `multipart/form-data` for file uploads.
- **Session Transport**: 
  - Access Token in HTTP `Authorization: Bearer <token>` header.
  - Refresh Token stored in HTTP-only Cookie (`refreshToken`) with client-side fallback in `localStorage` for cross-origin setups.
- **Cross-Origin Credentials**: `withCredentials: true` mandatory on all Axios / Fetch instances.

---

## 2. STANDARD API ENVELOPES

### 2.1 Success Response Envelope
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Operation completed successfully",
  "success": true
}
```

### 2.2 Paginated Data Envelope (`data` property)
```json
{
  "docs": [ ... ],
  "totalDocs": 48,
  "limit": 10,
  "page": 1,
  "totalPages": 5,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

### 2.3 Error Response Envelope (RFC 7807 Aligned)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Input validation failed",
    "details": [
      "Field 'email' must be a valid email address",
      "Password must be at least 8 characters long"
    ]
  },
  "requestId": "13f8eb03-710d-4204-b50b-506c94d6a130",
  "timestamp": "2026-08-20T04:59:12.666Z"
}
```

---

## 3. DOMAIN MODEL MAP & PROVEN ENUMS

### 3.1 Role & Status Enums
```typescript
export type UserRole = "STUDENT" | "COMPANY" | "ADMIN";
export type UserStatus = "ACTIVE" | "PENDING" | "BLOCKED";
export type CompanyStatus = "ACTIVE" | "PENDING" | "BLOCKED";
export type JobType = "FULLTIME" | "INTERNSHIP";
export type JobStatus = "ACTIVE" | "INACTIVE";
export type ApplicationStatus = "APPLIED" | "SHORTLISTED" | "OFFER" | "REJECTED";
export type StudentStatus = "PENDING" | "VERIFIED" | "REJECTED" | "BLOCKED";
export type VerificationType = "STUDENT" | "COMPANY";
export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type InviteStatus = "PENDING" | "ACCEPTED" | "REJECTED";
```

---

## 4. ENDPOINT CONTRACT INVENTORY

### 4.1 Authentication & User Identity (`/api/v1/users`, `/api/v1/auth`)

| Endpoint | Method | Auth | Role | Request Body / Params | Expected Response `data` |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `/users/register` | `POST` | None | Public | Form: `name`, `username`, `email`, `password`, `role?` ("STUDENT"/"COMPANY"), `profileImage?` (File) | `UserDTO` (omits password & refreshToken) |
| `/users/login` | `POST` | None | Public | `{ "email": string, "password": string }` | `{ user: UserDTO, accessToken: string, refreshToken: string }` |
| `/users/refresh-token` | `POST` | None | Public | `{ "refreshToken"?: string }` (or via cookie) | `{ accessToken: string, refreshToken: string }` |
| `/users/logout` | `POST` | Bearer | Any | None | `{}` |
| `/users/current-user` | `GET` | Bearer | Any | None | `UserDTO` |
| `/users/update-account` | `PATCH`| Bearer | Any | `{ "name"?: string, "email"?: string, "username"?: string }` | `UserDTO` |
| `/users/update-profile-photo` | `PATCH`| Bearer | Any | Multipart Form: `profileImage` (File) | `UserDTO` |
| `/users/change-password` | `POST` | Bearer | Any | `{ "oldPassword": string, "newPassword": string }` | `{}` |
| `/auth/email-verification/request` | `POST` | None | Public | `{ "email": string }` | `{ message: string }` |
| `/auth/email-verification/verify` | `POST` | None | Public | `{ "email": string, "otp": string }` | `{ success: boolean, message: string }` |
| `/auth/otp/request` | `POST` | None | Public | `{ "email": string, "purpose"?: string }` | `{ message: string }` |
| `/auth/otp/verify` | `POST` | None | Public | `{ "email": string, "otp": string, "purpose"?: string }` | `{ success: boolean, message: string }` |

---

### 4.2 Job Discovery & Management (`/api/v1/jobs`)

| Endpoint | Method | Auth | Role | Query / Body / Params | Expected Response `data` |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `/jobs` | `GET` | None | Public | Query: `page`, `limit`, `status`, `jobType`, `search`, `includeExpired` | `PaginatedResult<JobDTO>` |
| `/jobs/:jobId` | `GET` | None | Public | Param: `jobId` | `JobDTO` (Redis Cached) |
| `/jobs/create` | `POST` | Bearer + NotBlocked | `COMPANY` (Founder) | `{ "title": string, "company": string, "description": string, "requirements": string[], "location": string, "salary": string, "jobType": "FULLTIME"|"INTERNSHIP", "applicationDeadline"?: string }` | `JobDTO` |
| `/jobs/:jobId/update` | `PATCH`| Bearer + NotBlocked | Founder / Admin | Param: `jobId`, Body: updateable job fields | `JobDTO` |
| `/jobs/:jobId/close` | `PATCH`| Bearer + NotBlocked | Founder / Admin | Param: `jobId` | `JobDTO` (`status: "INACTIVE"`) |
| `/jobs/:jobId/delete` | `DELETE`| Bearer + NotBlocked | Founder / Admin | Param: `jobId` | `{}` |

---

### 4.3 Companies & Founder Invitations (`/api/v1/companies`, `/api/v1/invites`)

| Endpoint | Method | Auth | Role | Query / Body / Params | Expected Response `data` |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `/companies` | `GET` | None | Public | Query: `page`, `limit`, `search`, `myCompanies` | `PaginatedResult<CompanyDTO>` |
| `/companies/my` | `GET` | Bearer + NotBlocked | Any | Query: `page`, `limit` | `PaginatedResult<CompanyDTO>` |
| `/companies/:companyId` | `GET` | None | Public | Param: `companyId` | `CompanyDTO` (Redis Cached) |
| `/companies/register` | `POST` | Bearer + NotBlocked | `COMPANY` | Form: `name`, `email`, `description`, `website?`, `Logo?` (File) | `CompanyDTO` |
| `/companies/:companyId/update` | `PATCH`| Bearer + NotBlocked | Founder / Admin | Param: `companyId`, Body: updateable company fields | `CompanyDTO` |
| `/companies/:companyId/withdraw` | `DELETE`| Bearer + NotBlocked | Founder / Admin | Param: `companyId` | `{}` |
| `/invites/send` | `POST` | Bearer + NotBlocked | `COMPANY` (Founder) | `{ "companyId": string, "email": string }` | `CompanyInviteDTO` |
| `/invites/:inviteId/accept` | `POST` | Bearer + NotBlocked | Invitee User | Param: `inviteId` | `CompanyDTO` (Promotes user role to `COMPANY`) |
| `/invites/:inviteId/reject` | `POST` | Bearer + NotBlocked | Invitee User | Param: `inviteId` | `CompanyInviteDTO` (`status: "REJECTED"`) |
| `/invites/:inviteId/cancel` | `DELETE`| Bearer + NotBlocked | Inviter / Admin | Param: `inviteId` | `{}` |
| `/invites/my-invites` | `GET` | Bearer | Any | Query: `status` | `CompanyInviteDTO[]` |
| `/invites/company/:companyId` | `GET` | Bearer + NotBlocked | Founder / Admin | Param: `companyId`, Query: `status` | `CompanyInviteDTO[]` |

---

### 4.4 Job Applications (`/api/v1/applications`)

| Endpoint | Method | Auth | Role | Query / Body / Params | Expected Response `data` |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `/applications/submit` | `POST` | Bearer + NotBlocked | `STUDENT` | Header: `X-Idempotency-Key`<br>Multipart Form: `jobId`, `resume` (File), `additionalDocuments?` (Files) | `ApplicationDTO` |
| `/applications/my-applications` | `GET` | Bearer | `STUDENT` | Query: `page`, `limit`, `status` | `PaginatedResult<ApplicationDTO>` |
| `/applications/job/:jobId` | `GET` | Bearer + NotBlocked | Founder / Admin | Param: `jobId`, Query: `page`, `limit`, `status` | `PaginatedResult<ApplicationDTO>` |
| `/applications/:applicationId/status` | `GET` | Bearer | Owner Student | Param: `applicationId` | `ApplicationDTO` |
| `/applications/:applicationId/review` | `PATCH`| Bearer + NotBlocked | Founder / Admin | Param: `applicationId`<br>Body: `{ "status": "SHORTLISTED"|"OFFER"|"REJECTED", "offerLetterUrl"?: string }` | `ApplicationDTO` |
| `/applications/:applicationId` | `DELETE`| Bearer + NotBlocked | Owner Student | Param: `applicationId` (Allowed <= 24 hours of submission) | `{}` |

---

### 4.5 Student Profiles & Verification Workflows (`/api/v1/students`, `/api/v1/verifications`)

| Endpoint | Method | Auth | Role | Query / Body / Params | Expected Response `data` |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `/students` | `POST` | Bearer | `STUDENT` | Multipart Form: `branch`, `college`, `year`, `verificationDocument` (File) | `StudentDTO` |
| `/students/profile` | `GET` | Bearer | `STUDENT` | None | `StudentDTO` |
| `/students/profile` | `PATCH`| Bearer | `STUDENT` | Multipart Form: `branch?`, `college?`, `year?`, `verificationDocument?` (File) | `StudentDTO` |
| `/verifications` | `POST` | Bearer | Any | `{ "applicantType": "STUDENT"|"COMPANY", "studentProfileId"?: string, "companyId"?: string }` | `VerificationApplicationDTO` |
| `/verifications/my-request` | `GET` | Bearer | Any | None | `VerificationApplicationDTO` |
| `/verifications` | `GET` | Bearer | `ADMIN` | Query: `page`, `limit`, `status`, `applicantType` | `PaginatedResult<VerificationApplicationDTO>` |
| `/verifications/:requestId/approve` | `PATCH`| Bearer | `ADMIN` | Param: `requestId`, Body: `{ "adminNotes"?: string }` | `VerificationApplicationDTO` |
| `/verifications/:requestId/reject` | `PATCH`| Bearer | `ADMIN` | Param: `requestId`, Body: `{ "adminNotes"?: string }` | `VerificationApplicationDTO` |

---

### 4.6 Admin Moderation Operations (`/api/v1/admin`)

| Endpoint | Method | Auth | Role | Query / Body / Params | Expected Response `data` |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `/admin/users` | `GET` | Bearer | `ADMIN` | Query: `page`, `limit`, `role`, `status`, `search` | `PaginatedResult<UserDTO>` |
| `/admin/users/:userId/block` | `PATCH`| Bearer | `ADMIN` | Param: `userId` | `UserDTO` (`status: "BLOCKED"`) |
| `/admin/users/:userId/unblock` | `PATCH`| Bearer | `ADMIN` | Param: `userId` | `UserDTO` (`status: "ACTIVE"`) |
| `/admin/companies/:companyId/block` | `PATCH`| Bearer | `ADMIN` | Param: `companyId` | `CompanyDTO` (`status: "BLOCKED"`) |
| `/admin/companies/:companyId/unblock` | `PATCH`| Bearer | `ADMIN` | Param: `companyId` | `CompanyDTO` (`status: "ACTIVE"`) |
| `/admin/jobs` | `GET` | Bearer | `ADMIN` | Query: `page`, `limit`, `status`, `jobType`, `companyId` | `PaginatedResult<JobDTO>` |
| `/admin/jobs/:jobId` | `PATCH`| Bearer | `ADMIN` | Param: `jobId`, Body: updateable job fields | `JobDTO` |
| `/admin/jobs/:jobId` | `DELETE`| Bearer | `ADMIN` | Param: `jobId` | `{}` |
| `/admin/applications` | `GET` | Bearer | `ADMIN` | Query: `page`, `limit`, `status`, `jobId`, `companyId` | `PaginatedResult<ApplicationDTO>` |
| `/admin/applications/:applicationId` | `DELETE`| Bearer | `ADMIN` | Param: `applicationId` | `{}` |
| `/admin/create-admin` | `POST` | Bearer | `ADMIN` | `{ "name": string, "username": string, "email": string, "password": string }` | `UserDTO` |
| `/admin/remove-admin/:userId` | `DELETE`| Bearer | `ADMIN` | Param: `userId` | `UserDTO` (Demoted to `STUDENT`) |
