# FRONTEND INFORMATION ARCHITECTURE & SITEMAP

> **Target Application**: `JobPostingFrontend`  
> **Source of Truth**: `JobPostingBackend` API Routing, Modular Monolith Endpoints & Mongoose Models  
> **Status**: APPROVED IA SPECIFICATION (`VERIFIED`)

---

## 1. GLOBAL NAVIGATION & SITEMAP

```text
/ (Root)
│
├── Public Routes (Unauthenticated)
│   ├── /                          Landing Page & Featured Opportunities
│   ├── /jobs                      Public Job Search & Filters (Regex, JobType, Location)
│   ├── /jobs/:id                  Public Job Detail & Company Preview
│   ├── /companies                 Public Company Directory
│   ├── /companies/:id             Public Company Profile & Active Openings
│   ├── /auth/login                Account Login (Email + Password)
│   ├── /auth/register             Account Registration (Student / Company Role)
│   ├── /auth/verify-email         Email OTP Verification (6-Digit Code + 60s Resend)
│   └── /blocked                   Account Suspension Notice Page
│
├── Student Workspace (Role: STUDENT)
│   ├── /student/onboarding        Initial Profile Setup (College, Branch, Year, ID Proof)
│   ├── /student/pending           Verification In-Review Status & Progress Indicator
│   ├── /student/dashboard         Student Hub (Active Applications, Recommended Jobs)
│   ├── /student/jobs              Job Search & 1-Click Application Drawer
│   ├── /student/jobs/:id          Job View with Real-time Deadline Countdown
│   ├── /student/applications      Application Pipeline Tracker (APPLIED -> SHORTLISTED -> OFFER)
│   ├── /student/applications/:id  Application Timeline Detail & Offer Letter Download
│   ├── /student/invites           Founder Co-Founder Invitations Received
│   └── /student/profile           Academic & Account Settings (Profile Photo Update)
│
├── Company Workspace (Role: COMPANY)
│   ├── /company/onboarding        Corporate Entity Registration (Name, Logo, Website, Bio)
│   ├── /company/pending           Corporate Verification Review Queue Status
│   ├── /company/dashboard         Recruiter Command Center (KPIs: Jobs, Applicants, Pipeline)
│   ├── /company/jobs              Job Management Table (Active/Inactive, Applicant Counts)
│   ├── /company/jobs/create       Create Job Posting (Requirements, Salary, Deadline)
│   ├── /company/jobs/:id/edit     Edit Job Details & Requirements
│   ├── /company/jobs/:id/applicants Applicant Review Pipeline & Resume Inspection
│   ├── /company/team              Founder Management & Co-Founder Email Invites (7-Day TTL)
│   ├── /company/profile           Corporate Branding Profile Editor
│   └── /company/settings          Founder Security & Password Management
│
└── System Admin Console (Role: ADMIN)
    ├── /admin/dashboard           Operational Overview & Platform Statistics
    ├── /admin/verifications       Verification Queue (Student ID Cards & Company Audits)
    ├── /admin/users               User Directory & Moderation (Block/Unblock/Demote Admin)
    ├── /admin/companies           Company Directory & Moderation (Block/Unblock Company)
    ├── /admin/jobs                Job Opening Audits & Direct Administrative Deletion
    ├── /admin/applications        System Application Audit Table & Deletion
    ├── /admin/create-admin        Provision New System Administrator
    └── /admin/settings            Admin Security Settings
```

---

## 2. NAVIGATION BAR MATRIX BY ROLE

| Navigation Item | Public / Anonymous | Student (`STUDENT`) | Employer (`COMPANY`) | Admin (`ADMIN`) |
| :--- | :---: | :---: | :---: | :---: |
| **Explore Jobs** | Top Nav Link | Top Nav Link | Top Nav Link | Admin Job Audit |
| **Companies** | Top Nav Link | Top Nav Link | Top Nav Link | Admin Company Audit |
| **My Applications** | Hidden | Primary Nav | Hidden | Admin App Audit |
| **Post a Job** | CTA -> Register | Hidden | Primary Action Button | Hidden |
| **Verification Queue** | Hidden | Status Badge | Status Badge | Primary Nav Queue |
| **User Moderation** | Hidden | Hidden | Hidden | Primary Nav Table |
| **User Profile / Avatar** | Hidden | Header Dropdown | Header Dropdown | Header Dropdown |
| **Login / Register** | Primary CTAs | Hidden | Hidden | Hidden |
| **Logout** | Hidden | Dropdown Action | Dropdown Action | Dropdown Action |
