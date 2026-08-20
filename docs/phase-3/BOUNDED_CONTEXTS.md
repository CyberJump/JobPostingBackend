# Bounded Context Design (`docs/phase-3/BOUNDED_CONTEXTS.md`)

> **Architectural Pattern**: Domain-Driven Design (DDD) Bounded Contexts  
> **Status**: Stage A Architecture Specification  

---

## 1. Bounded Context Map

```text
 ┌──────────────────┐               ┌──────────────────┐
 │ Auth & Identity  │──────────────►│    User Domain   │
 └────────┬─────────┘               └────────┬─────────┘
          │                                  │
          ▼                                  ▼
 ┌──────────────────┐               ┌──────────────────┐
 │  Company Domain  │◄─────────────►│    Job Domain    │
 └────────┬─────────┘               └────────┬─────────┘
          │                                  │
          ▼                                  ▼
 ┌──────────────────┐               ┌──────────────────┐
 │Invitation Domain │               │Application Domain│
 └──────────────────┘               └────────┬─────────┘
                                             │
                                             ▼
 ┌──────────────────┐               ┌──────────────────┐
 │Verification Domain│               │Admin & Moderation│
 └──────────────────┘               └──────────────────┘
```

---

## 2. Bounded Context Specifications

### 1. Identity & Auth Context (`src/modules/auth/`)
- **Purpose**: Manages user registration, credential authentication, JWT token lifecycle, and secure OTP verification.
- **Entities**: `User`, `OtpRecord`
- **Use Cases**: `RegisterUserUseCase`, `LoginUserUseCase`, `RefreshAccessTokenUseCase`, `LogoutUserUseCase`, `RequestOtpUseCase`, `VerifyOtpUseCase`, `ChangePasswordUseCase`
- **Public API**: `/api/v1/users/register`, `/api/v1/users/login`, `/api/v1/users/refresh-token`, `/api/v1/users/logout`, `/api/v1/auth/otp/*`
- **Security Requirements**: Password hashing via `bcrypt`, HTTP-Only secure cookies, Redis-backed rate limiting, single-use hashed OTPs.

### 2. Company Context (`src/modules/companies/`)
- **Purpose**: Manages company entity profiles, founder membership arrays, logo assets, and company verification status.
- **Entities**: `Company`
- **Use Cases**: `RegisterCompanyUseCase`, `UpdateCompanyUseCase`, `GetCompanyDetailsUseCase`, `GetMyCompaniesUseCase`, `WithdrawCompanyUseCase`
- **Public API**: `/api/v1/companies/*`
- **Security Requirements**: Founder array membership authorization policy (`CompanyPolicy.isFounder()`), logo image validation.

### 3. Job Context (`src/modules/jobs/`)
- **Purpose**: Handles job posting creation, updates, closing, searching, filtering, and pagination.
- **Entities**: `Job`
- **Use Cases**: `CreateJobPostingUseCase`, `UpdateJobPostingUseCase`, `CloseJobPostingUseCase`, `DeleteJobPostingUseCase`, `GetJobDetailsUseCase`, `ListJobsUseCase`
- **Public API**: `/api/v1/jobs/*`
- **Security Requirements**: Only `COMPANY` role or company founder can post/edit jobs. Cache-aside pattern for job details and job search queries.

### 4. Application Context (`src/modules/applications/`)
- **Purpose**: Manages student job applications, resume attachments, application review workflow (`APPLIED` -> `SHORTLISTED` -> `OFFER`/`REJECTED`), and withdrawal.
- **Entities**: `Application`
- **Use Cases**: `SubmitApplicationUseCase`, `GetUserApplicationsUseCase`, `GetJobApplicationsUseCase`, `ReviewApplicationUseCase`, `WithdrawApplicationUseCase`
- **Public API**: `/api/v1/applications/*`
- **Security Requirements**: Enforces **Unique Compound Index `{ job: 1, student: 1 }`** to prevent duplicate applications. Document PDF raw upload validation.

### 5. Invitation Context (`src/modules/invitations/`)
- **Purpose**: Manages co-founder email invitation dispatches, invite status (`PENDING`, `ACCEPTED`, `REJECTED`), expiration TTL, and membership updates.
- **Entities**: `CompanyInvite`
- **Use Cases**: `SendFounderInviteUseCase`, `AcceptInviteUseCase`, `RejectInviteUseCase`, `CancelInviteUseCase`, `GetMyInvitesUseCase`
- **Public API**: `/api/v1/invites/*`
- **Security Requirements**: Dynamic expiration `() => new Date(Date.now() + 15*60*1000)`, invited recipient email verification.

### 6. Verification Context (`src/modules/verification/`)
- **Purpose**: Coordinates verification applications for students and companies, document upload inspection, and administrative approval queues.
- **Entities**: `VerificationApplication`, `Student`
- **Use Cases**: `CreateVerificationRequestUseCase`, `GetMyVerificationRequestUseCase`, `GetPendingVerificationsUseCase`, `ReviewVerificationUseCase`
- **Public API**: `/api/v1/verifications/*`, `/api/v1/students/*`
- **Security Requirements**: Raw document inspection, Admin-only review permissions (`verifyRole("ADMIN")`).

### 7. Moderation & Admin Context (`src/modules/admin/`)
- **Purpose**: Provides administrative governance, user blocking/unblocking, company moderation, content deletion, and system-wide statistics.
- **Entities**: Cross-domain entities (`User`, `Company`, `Job`, `Application`)
- **Use Cases**: `BlockUserUseCase`, `UnblockUserUseCase`, `BlockCompanyUseCase`, `UnblockCompanyUseCase`, `CreateAdminUseCase`, `GetAdminStatsUseCase`
- **Public API**: `/api/v1/admin/*`
- **Security Requirements**: Strict `verifyAdmin` middleware check, audit logging of administrative actions.
