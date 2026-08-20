# FRONTEND USER FLOWS & WORKFLOW SPECIFICATIONS

> **Target Application**: `JobPostingFrontend`  
> **Source of Truth**: `JobPostingBackend` Use Cases, Domain State Machines & Repositories  
> **Status**: APPROVED WORKFLOW SPECIFICATION (`VERIFIED`)

---

## 1. AUTHENTICATION & EMAIL VERIFICATION FLOW

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend Client
    participant API as Express Auth API
    participant Redis as Redis Infrastructure
    participant DB as MongoDB

    User->>FE: Fills Registration Form (Name, Username, Email, Password, Role)
    FE->>API: POST /api/v1/users/register (Multipart form)
    API->>DB: User.create(status: "PENDING", isVerified: false)
    API-->>FE: HTTP 201 Created (UserDTO)
    FE->>FE: Navigate to /auth/verify-email (Pass email in state)
    
    User->>FE: Clicks "Send Verification Code"
    FE->>API: POST /api/v1/auth/email-verification/request { email }
    API->>Redis: Check Cooldown & Lockout
    API->>Redis: Store SHA-256 OTP hash (TTL: 600s, Cooldown: 60s)
    API-->>FE: HTTP 200 OK ("Verification code dispatched")
    FE->>FE: Start 60s Countdown Timer UI
    
    User->>FE: Enters 6-digit OTP code
    FE->>API: POST /api/v1/auth/email-verification/verify { email, otp }
    API->>Redis: Compare SHA-256 Hash
    API->>DB: User.findByIdAndUpdate(status: "ACTIVE", isVerified: true)
    API-->>FE: HTTP 200 OK (Success message)
    FE->>FE: Navigate to /auth/login with Success Toast
```

---

## 2. STUDENT ONBOARDING & JOB APPLICATION FLOW

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant FE as Frontend Client
    participant API as Express Applications API
    participant Redis as Redis Infrastructure
    participant DB as MongoDB

    Student->>FE: Completes Academic Profile (College, Branch, Year, ID File)
    FE->>API: POST /api/v1/students (Multipart)
    API->>DB: Student.create(status: "PENDING")
    API-->>FE: HTTP 201 Created (StudentDTO)

    Student->>FE: Submits Verification Request
    FE->>API: POST /api/v1/verifications { applicantType: "STUDENT", studentProfileId }
    API->>DB: VerificationApplication.create(status: "PENDING")
    API-->>FE: HTTP 201 Created

    Student->>FE: Discovers Job & Clicks "Apply with Resume"
    FE->>FE: Generate unique X-Idempotency-Key UUID
    FE->>API: POST /api/v1/applications/submit (Headers: X-Idempotency-Key, Form: jobId, resume)
    API->>Redis: Acquire Lock SETNX idempotency:application:submit:{user}:{job} (TTL 60s)
    API->>DB: Check Unique Index { job, student }
    API->>DB: Application.create(status: "APPLIED")
    API->>Redis: Cache Result Payload (TTL 86400s)
    API-->>FE: HTTP 201 Created (ApplicationDTO)
    FE->>FE: Show Application Confirmation & Timeline Badge
```

---

## 3. COMPANY APPLICANT REVIEW & OFFER ISSUANCE FLOW

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter
    participant FE as Frontend Client
    participant API as Express Applications API
    participant DB as MongoDB

    Recruiter->>FE: Opens Job Applicants Table (/company/jobs/:id/applicants)
    FE->>API: GET /api/v1/applications/job/:jobId
    API->>DB: Application.aggregatePaginate (Populating Student details)
    API-->>FE: HTTP 200 OK (Paginated applicants)

    Recruiter->>FE: Inspects Resume & Clicks "Shortlist"
    FE->>API: PATCH /api/v1/applications/:id/review { status: "SHORTLISTED" }
    API->>DB: Application.findByIdAndUpdate(status: "SHORTLISTED")
    API-->>FE: HTTP 200 OK (Updated ApplicationDTO)

    Recruiter->>FE: Uploads Official Offer Letter & Clicks "Send Offer"
    FE->>API: PATCH /api/v1/applications/:id/review { status: "OFFER", offerLetterUrl }
    API->>DB: Application.findByIdAndUpdate(status: "OFFER", offerLetterUrl)
    API-->>FE: HTTP 200 OK (Updated ApplicationDTO)
    FE->>FE: Update Badge to "Offer Extended"
```

---

## 4. ADMIN VERIFICATION & MODERATION FLOW

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant FE as Frontend Client
    participant API as Express Admin API
    participant DB as MongoDB

    Admin->>FE: Opens Verification Queue (/admin/verifications)
    FE->>API: GET /api/v1/verifications?status=PENDING
    API->>DB: VerificationApplication.find(status: "PENDING")
    API-->>FE: HTTP 200 OK (List of submissions)

    Admin->>FE: Inspects ID Document & Clicks "Approve"
    FE->>API: PATCH /api/v1/verifications/:id/approve { adminNotes: "Verified" }
    API->>DB: VerificationApplication.findByIdAndUpdate(status: "APPROVED")
    API->>DB: Student.findByIdAndUpdate(status: "VERIFIED")
    API-->>FE: HTTP 200 OK
    FE->>FE: Remove item from Pending Queue with Success Toast
```
