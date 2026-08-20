# Security Change & Vulnerability Log

Tracks all security findings, vulnerability remediation, security header additions, authorization hardening, and audit results.

| Security ID | Date | Category | Finding / Threat | Severity | Fix Status | Verification |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `SEC-0001` | 2026-08-15 | Authorization | Broken Founder Array Check in `job.controller.js` | Critical | **REMEDIATED (CHG-0002)** | Verified with `.some()` |
| `SEC-0002` | 2026-08-15 | Network Security | Insecure CORS Wildcard with Credentials in `src/app.js` | High | **REMEDIATED (CHG-0006)** | Whitelist Restricted in Dev & Prod |
| `SEC-0003` | 2026-08-15 | Cloud Storage | Cloudinary Document Deletion Failure (Folder Path Truncation) | High | **REMEDIATED (CHG-0006)** | Path-preserving `extractPublicId` |
| `SEC-0004` | 2026-08-15 | Logic / Schema | Static `Date.now()` Default Evaluation in `companyinvite.models.js` | Medium | **REMEDIATED (CHG-0002)** | Dynamic Function Default |
| `SEC-0005` | 2026-08-15 | Data Integrity | Schema Property Mismapping (`verifiedBy` vs `approvedBy` in `student.routes.js`) | Medium | **REMEDIATED (CHG-0002)** | Schema Property Fixed |
| `SEC-0006` | 2026-08-15 | Input Validation | Unvalidated HTTP Request Bodies / Parameters across 57 Endpoints | High | **REMEDIATED (CHG-0006)** | Zod Middleware Attached to Routes |
