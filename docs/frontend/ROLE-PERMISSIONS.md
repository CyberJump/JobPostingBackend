# FRONTEND ROLE & PERMISSION MATRIX

> **Target Application**: `JobPostingFrontend`  
> **Source of Truth**: `JobPostingBackend` Middleware (`verifyJWT`, `verifyRole`, `checkNotBlocked`) & Domain Policies  
> **Status**: APPROVED PERMISSION SPECIFICATION (`VERIFIED`)

---

## 1. ROLE MATRIX & ROUTE GUARDS

| Capability / Route | Anonymous / Public | Student (`STUDENT`) | Employer (`COMPANY`) | Admin (`ADMIN`) | Guard Middleware |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **View Public Jobs & Companies** | Permitted | Permitted | Permitted | Permitted | Public (No Auth) |
| **Account Registration & Login** | Permitted | Permitted | Permitted | Permitted | Public (No Auth) |
| **Email Verification & OTP Requests** | Permitted | Permitted | Permitted | Permitted | Public (Rate Limited) |
| **Manage Student Academic Profile** | Forbidden | Permitted | Forbidden | Forbidden | `verifyRole("STUDENT")` |
| **Submit Job Application** | Forbidden | Permitted | Forbidden | Forbidden | `verifyRole("STUDENT")`, `checkNotBlocked` |
| **Withdraw Own Application (<=24h)**| Forbidden | Permitted | Forbidden | Forbidden | `verifyRole("STUDENT")`, Owner Policy |
| **Register / Edit Company Profile** | Forbidden | Forbidden | Permitted | Permitted | `verifyRole("COMPANY")`, Founder Policy |
| **Post / Edit / Close Job Openings** | Forbidden | Forbidden | Permitted | Permitted | `verifyRole("COMPANY")`, Founder Policy |
| **Review Candidate Applications** | Forbidden | Forbidden | Permitted | Permitted | `verifyRole("COMPANY")`, Founder Policy |
| **Send Co-Founder Invitations** | Forbidden | Forbidden | Permitted | Permitted | `verifyRole("COMPANY")`, Founder Policy |
| **Accept / Reject Founder Invite** | Forbidden | Permitted | Permitted | Permitted | `verifyJWT`, `checkNotBlocked` |
| **Review Verification Applications**| Forbidden | Forbidden | Forbidden | Permitted | `verifyRole("ADMIN")` |
| **Block / Unblock Users & Companies**| Forbidden | Forbidden | Forbidden | Permitted | `verifyRole("ADMIN")` |
| **Direct Delete Jobs / Applications**| Forbidden | Forbidden | Forbidden | Permitted | `verifyRole("ADMIN")` |
| **Provision New System Admins** | Forbidden | Forbidden | Forbidden | Permitted | `verifyRole("ADMIN")` |

---

## 2. CLIENT-SIDE ACTION-LEVEL GUARDS

The frontend uses contextual permission hooks (`usePermissions()`) to safely adjust UI controls:
- **`canApplyToJob(job, studentProfile, hasApplied)`**: Returns `true` only if user has `role === "STUDENT"`, `isVerified === true`, `job.status === "ACTIVE"`, deadline not passed, and `hasApplied === false`.
- **`canManageJob(job, user, company)`**: Returns `true` if user has `role === "ADMIN"` or is an authorized founder in `company.founders`.
- **`canWithdrawApplication(app)`**: Returns `true` if application age is `< 24 hours` and `status === "APPLIED"`.
