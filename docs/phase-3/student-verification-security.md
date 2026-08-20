# Architecture Decision Record — Student Verification Security & IDOR Controls

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Student Verification Security  

---

## 1. Authorization & IDOR Protection
- **Authenticated Identity Context**: `userId` is extracted strictly from `req.user._id` (JWT context). Client-supplied `userId`, `approvedBy`, `reviewedBy`, or `status` in payload bodies are strictly ignored.
- **Reviewer Authorization**: Verification review actions (`approve` / `reject`) require `ADMIN` role (`verifyRole(["ADMIN"])`).
- **Student Document Security**: Verification documents uploaded via `storagePort` enforce mime validation and safe path handling.

## 2. Mass Assignment Prevention
- Field allowlists in `StudentVerificationPolicy` prevent clients from overwriting internal review fields or student status.
