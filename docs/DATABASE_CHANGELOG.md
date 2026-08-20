# Database Architecture & Indexing Changelog

Tracks all Mongoose model schema changes, collection indexes, migrations, data transformations, and compatibility concerns.

## DB-0001 — Initial Model Mapping Baseline
- **Date**: 2026-08-15
- **Target**: `User`, `Student`, `Company`, `Job`, `Application`, `CompanyInvite`, `VerificationApplication`
- **Summary**: Initial schema mapping and structure analysis.

---

## DB-0002 — Performance & Compound Unique Indexes Implementation

### Date
2026-08-15

### 1. Collection: `jobs`
- **Indexes**:
  - `{ company: 1, status: 1 }`
  - `{ createdBy: 1 }`
  - `{ status: 1, jobType: 1 }`
  - `{ applicationDeadline: 1 }`
- **Query Supported**: `Job.find({ company, status })`, `Job.find({ createdBy })`, `Job.aggregate([...])` filtering on deadline.
- **Reason**: Eliminates collection scans during job search, company dashboard listings, and deadline queries.

### 2. Collection: `applications`
- **Indexes**:
  - `{ job: 1, student: 1 }` (Unique Compound Index)
  - `{ student: 1, status: 1 }`
  - `{ company: 1, status: 1 }`
- **Query Supported**: `Application.findOne({ job, student })`, `GetUserApplications`, `GetJobApplications`.
- **Reason**: Strictly enforces single application per student at database level and accelerates user dashboard queries.

### 3. Collection: `companies`
- **Indexes**:
  - `{ "founders.userId": 1 }`
  - `{ status: 1 }`
- **Query Supported**: `GetMyCompanies` aggregation pipeline filtering by founder ID.
- **Reason**: Optimizes multi-founder membership queries.

### 4. Collection: `students`
- **Indexes**:
  - `{ userId: 1 }` (Unique)
  - `{ status: 1 }`
- **Query Supported**: `Student.findOne({ userId })`.
- **Reason**: Ensures 1:1 user-to-student profile mapping.
