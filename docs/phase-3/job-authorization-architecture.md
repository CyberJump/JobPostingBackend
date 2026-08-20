# Architecture Decision Record — Job Authorization Architecture & Cross-Module Boundaries

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Jobs Module  

---

## 1. Context & Ownership Rules
- **Job Ownership**: A `Job` entity belongs to a `Company` (`company` ObjectId reference) and is created by a user (`createdBy` ObjectId reference).
- **Founder Verification**: Job modification operations (update, close, delete) verify whether the authenticated user is authorized to modify the associated company using `JobPolicy.canModifyJob(user, job)`.
- **Cross-Module Boundary Rule**: The Jobs domain/application layers MUST NOT directly query the `Company` Mongoose model. Mongoose-level population (`$lookup` from `companies`) occurs exclusively inside `MongoJobRepository` at the infrastructure boundary.

## 2. Mass Assignment Protection
- Client-supplied payload fields are sanitized by `JobPolicy.sanitizeUpdateFields`.
- Sensitive fields (`_id`, `company`, `createdBy`, `status`) cannot be overwritten through generic update payloads.
