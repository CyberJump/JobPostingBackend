# Architecture Decision Record — Application Authorization Architecture & Cross-Module Boundaries

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Applications Module  

---

## 1. Context & Ownership Rules
- **Student Ownership**: Applications are owned by the submitting student (`student` ObjectId reference). Students can view their own application statuses (`GET /my-applications`, `GET /:applicationId/status`) and withdraw within 24 hours (`DELETE /:applicationId`).
- **Company Review Ownership**: Company founders (`isFounder`) or `ADMIN` users can view applicants for their company's jobs (`GET /job/:jobId`) and review application statuses (`PATCH /:applicationId/review`).
- **Cross-Module Boundary Rules**: The Applications domain/application layers MUST NOT directly query Mongoose models of `Job`, `Company`, `User`, or `Student`. Mongoose-level population (`$lookup` / `.populate()`) occurs exclusively inside `MongoApplicationRepository` at the infrastructure boundary.

## 2. Invariant & Concurrency Protection
- Compound unique index `{ job: 1, student: 1 }` guarantees database-level duplicate application prevention.
- `idempotencyService` protects against duplicate concurrent HTTP requests during submission.
