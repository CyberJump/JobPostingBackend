# Frontend API Integration Specification

## 1. Integration Principles & Contract Enforcement

The frontend integrates directly with the existing **JobPostingBackend** REST API (`http://localhost:8000/api/v1`). The backend serves as the authoritative source of truth. All endpoints, HTTP methods, headers, request envelopes, query parameters, multipart boundaries, and response structures map 1:1 with backend specifications.

---

## 2. API Endpoint Matrix

### 2.1 Authentication & User Endpoints (`authService.js`)
| Method | Endpoint | Description | Payload / Query | Auth / Headers |
|---|---|---|---|---|
| `POST` | `/users/register` | Register new user | `FormData(name, username, email, password, role, profileImage)` | Public |
| `POST` | `/users/login` | Authenticate user | `{ email, password }` | Public |
| `POST` | `/users/logout` | Terminate session | None | Bearer Token |
| `POST` | `/users/refresh-token` | Silent token refresh | None | Cookie / Bearer |
| `POST` | `/users/change-password` | Update password | `{ oldPassword, newPassword }` | Bearer Token |
| `GET` | `/users/current-user` | Fetch active user | None | Bearer Token |
| `PATCH` | `/users/update-account` | Update name/username | `{ name, username }` | Bearer Token |
| `PATCH` | `/users/update-profile-photo` | Update avatar | `FormData(profileImage)` | Bearer Token |
| `POST` | `/auth/email-verification/request` | Request verification OTP | `{ email }` | Public |
| `POST` | `/auth/email-verification/verify` | Verify email OTP | `{ email, otp }` | Public |
| `POST` | `/auth/request-otp` | Request generic OTP | `{ email }` | Public |
| `POST` | `/auth/verify-otp` | Verify generic OTP | `{ email, otp }` | Public |

### 2.2 Job Management Endpoints (`jobService.js`)
| Method | Endpoint | Description | Payload / Query | Auth / Headers |
|---|---|---|---|---|
| `GET` | `/jobs` | Paginated job discovery | `page, limit, search, jobType, location, company, includeExpired` | Public / Bearer |
| `GET` | `/jobs/:id` | Job details by ID | None | Public / Bearer |
| `POST` | `/jobs` | Post new vacancy | `{ title, description, requirements, company, location, salary, jobType, applicationDeadline }` | Company / Admin |
| `PUT` | `/jobs/:id` | Edit vacancy | `{ title, description, requirements, location, salary, jobType, applicationDeadline }` | Owner Company / Admin |
| `PATCH` | `/jobs/:id/close` | Close job vacancy | None | Owner Company / Admin |
| `DELETE` | `/jobs/:id` | Delete job vacancy | None | Owner Company / Admin |

### 2.3 Application Endpoints (`applicationService.js`)
| Method | Endpoint | Description | Payload / Query | Auth / Headers |
|---|---|---|---|---|
| `POST` | `/applications/submit` | Submit application | `FormData(jobId, resume, additionalDocuments)` | `X-Idempotency-Key`, Student |
| `GET` | `/applications/my-applications` | Student applications | `page, limit, status` | Verified Student |
| `GET` | `/applications/job/:jobId` | Recruiter applicants | `page, limit, status` | Company Owner / Admin |
| `GET` | `/applications/status/:jobId` | Application check | None | Student |
| `PATCH` | `/applications/:id/review` | Review applicant | `{ status, offerLetterUrl }` | Company Owner / Admin |
| `DELETE` | `/applications/:id` | Withdraw application | None | Student (within 24h) |

### 2.4 Student Profile Endpoints (`studentService.js`)
| Method | Endpoint | Description | Payload / Query | Auth / Headers |
|---|---|---|---|---|
| `POST` | `/students` | Create student profile | `FormData(college, branch, year, verificationDocument)` | Student |
| `GET` | `/students/profile` | Get current student | None | Student |
| `PUT` | `/students/profile` | Update student profile | `FormData(college, branch, year, verificationDocument)` | Student |
| `GET` | `/students/pending` | List unverified students | `page, limit` | Admin |
| `PATCH` | `/students/:id/verify` | Approve student profile | None | Admin |
| `PATCH` | `/students/:id/reject` | Reject student profile | `{ reason }` | Admin |

### 2.5 Company & Invite Endpoints (`companyService.js`)
| Method | Endpoint | Description | Payload / Query | Auth / Headers |
|---|---|---|---|---|
| `POST` | `/companies/register` | Register company entity | `FormData(name, email, description, website, Logo)` | User / Company |
| `GET` | `/companies` | Directory of companies | `page, limit, search, status` | Public / Bearer |
| `GET` | `/companies/my-companies` | User managed companies | `page, limit` | Company Founder |
| `GET` | `/companies/:id` | Company profile by ID | None | Public / Bearer |
| `PUT` | `/companies/:id` | Update company profile | `FormData(name, email, description, website, Logo)` | Company Founder / Admin |
| `DELETE` | `/companies/:id` | Delete company entity | None | Company Founder / Admin |
| `POST` | `/companies/:companyId/invites` | Dispatch founder invite | `{ email }` | Company Founder |
| `POST` | `/companies/invites/:inviteId/accept` | Accept founder invite | None | User (Promotes to COMPANY) |
| `POST` | `/companies/invites/:inviteId/reject` | Decline founder invite | None | User |
| `DELETE` | `/companies/invites/:inviteId` | Cancel founder invite | None | Company Founder |
| `GET` | `/companies/invites/my-invites` | User's received invites | `status` | User |
| `GET` | `/companies/:companyId/invites` | Company sent invites | None | Company Founder |

### 2.6 Verification Queue Endpoints (`verificationService.js`)
| Method | Endpoint | Description | Payload / Query | Auth / Headers |
|---|---|---|---|---|
| `POST` | `/verifications` | Submit verification | `{ applicantType, companyId, studentProfileId }` | Student / Company |
| `GET` | `/verifications/my-request` | Get user's request | None | Student / Company |
| `GET` | `/verifications` | List audit queue | `status, applicantType, page, limit` | Admin |
| `PATCH` | `/verifications/:id/approve` | Approve verification | `{ adminNotes }` | Admin |
| `PATCH` | `/verifications/:id/reject` | Reject verification | `{ adminNotes }` | Admin |

### 2.7 Admin Operations Endpoints (`adminService.js`)
| Method | Endpoint | Description | Payload / Query | Auth / Headers |
|---|---|---|---|---|
| `GET` | `/admin/users` | List platform users | `page, limit, search, role, status` | Admin |
| `PATCH` | `/admin/users/:id/block` | Block user account | None | Admin |
| `PATCH` | `/admin/users/:id/unblock` | Unblock user account | None | Admin |
| `POST` | `/admin/create-admin` | Provision administrator | `{ name, username, email, password }` | Admin |
| `GET` | `/admin/companies` | List all companies | `page, limit, search, status` | Admin |
| `PATCH` | `/admin/companies/:id/block` | Block company entity | None | Admin |
| `PATCH` | `/admin/companies/:id/unblock` | Unblock company entity | None | Admin |
| `GET` | `/admin/jobs` | List all jobs | `page, limit, search, status, jobType` | Admin |
| `DELETE` | `/admin/jobs/:id` | Cascade delete job | None | Admin |
| `GET` | `/admin/applications` | List all applications | `page, limit, search, status` | Admin |
| `DELETE` | `/admin/applications/:id` | Delete application | None | Admin |
