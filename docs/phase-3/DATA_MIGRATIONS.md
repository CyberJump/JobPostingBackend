# Data Migrations & Schema Compatibility Plan (`docs/phase-3/DATA_MIGRATIONS.md`)

> **Database Policy**: Zero Breaking Structural Changes to Existing Collections; Index Additions Only  
> **Status**: Stage A Data Migration Specification  

---

## 1. Schema Compatibility Guarantee

Phase 3 modularization will preserve existing MongoDB collection schemas (`users`, `students`, `companies`, `jobs`, `applications`, `companyinvites`, `verificationapplications`). No fields will be deleted or renamed in a breaking manner.

---

## 2. Model Relocation Map

During domain modularization, existing model files will be relocated into their respective domain modules while maintaining backward-compatible exports from `src/infrastructure/database/models/`:

| Current Model File | Target Infrastructure Location | Module Owner |
| :--- | :--- | :--- |
| `src/models/user.models.js` | `src/modules/auth/infrastructure/user.model.js` | `auth` / `users` |
| `src/models/student.models.js` | `src/modules/verification/infrastructure/student.model.js` | `verification` |
| `src/models/company.models.js` | `src/modules/companies/infrastructure/company.model.js` | `companies` |
| `src/models/job.models.js` | `src/modules/jobs/infrastructure/job.model.js` | `jobs` |
| `src/models/application.models.js` | `src/modules/applications/infrastructure/application.model.js` | `applications` |
| `src/models/companyinvite.models.js` | `src/modules/invitations/infrastructure/companyinvite.model.js` | `invitations` |
| `src/models/verificationApplication.models.js` | `src/modules/verification/infrastructure/verification.model.js` | `verification` |

---

## 3. Data Consistency & Transaction Review

- **Single Document Writes**: Operations modifying a single document (e.g. `UpdateJobPosting`, `ChangePassword`) are natively atomic in MongoDB.
- **Multi-Document Writes**: Operations modifying multiple collections (e.g. `AcceptFounderInvite` which updates `CompanyInvite` status AND pushes a new founder object to `Company.founders`) utilize Mongoose Sessions / Transactions (`session.startTransaction()`) when connected to a MongoDB replica set / Atlas cluster.
