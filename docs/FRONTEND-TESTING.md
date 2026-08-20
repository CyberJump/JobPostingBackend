# Frontend Testing & Verification Guide

## 1. Automated Verification Checklist

### 1.1 Production Bundle Compilation
Run Vite production bundle build:
```bash
cd JobPostingFrontend
npm run build
```
Expected output:
- Dist output files generated with zero syntax errors, broken imports, or JSX parsing exceptions.

### 1.2 Development Server Startup
```bash
npm run dev
```
Accessible at `http://localhost:5173`.

---

## 2. End-to-End User Flow Verification Scenarios

### Flow 1: Student Registration & ID Verification
1. Navigate to `/register`.
2. Choose **Student Account**, supply `name`, `username`, `email`, `password`, and avatar photo.
3. Automatically redirected to `/auth/verify-email`.
4. Enter 6-digit OTP code received in email (or simulate).
5. Login at `/login`.
6. Redirected to `/student/onboarding`.
7. Fill in College, Branch, Year of Study, and attach College ID Proof PDF.
8. Redirected to `/student/pending` awaiting administrator audit.

### Flow 2: Admin Auditing & Verification Approval
1. Sign in as an Admin (`/login`).
2. Navigate to `/admin/verifications`.
3. Filter by **Students** or inspect pending verification card.
4. Click **Inspect College ID Proof** (opens document in new tab/modal).
5. Click **Approve**.
6. The student's account and profile status update to `ACTIVE` / `VERIFIED`.

### Flow 3: Recruiter Job Posting & Candidate Lifecycle
1. Sign in as a verified Company Recruiter (`/login`).
2. Navigate to `/company/jobs/create`.
3. Fill in Job Title, Description, Requirements (line-separated), Location, Salary, Employment Type, and Deadline.
4. Submit form -> Job appears in `/company/jobs` and on public board `/jobs`.
5. Switch to a verified Student account.
6. Browse to `/jobs/:id` or `/student/jobs/:id`.
7. Click **Apply for Role** -> Upload PDF Resume -> Submit.
8. Application transitions to `APPLIED` with 24-hour withdrawal window.
9. Return to Recruiter account -> Navigate to `/company/jobs/:id/applicants`.
10. Click **Shortlist Candidate** -> Status moves to `SHORTLISTED`.
11. Click **Issue Offer Letter** -> Input official PDF URL -> Candidate moves to `OFFER`.
12. Student views `/student/applications` -> Sees completed 3-step Timeline and downloads offer letter.

### Flow 4: Company Founder Invitations & Promotion
1. Recruiter opens `/company/team`.
2. Enters colleague's email address -> Dispatches 7-day TTL invitation.
3. Colleague signs in as a Student -> Opens `/student/invites`.
4. Clicks **Accept (Join as Founder)** -> Account role promoted to `COMPANY` with access to `/company/dashboard`.
