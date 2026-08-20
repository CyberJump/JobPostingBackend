# Architecture Decision Record — Application Lifecycle & State Machine

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Applications Module  

---

## 1. Application Lifecycle States
- **APPLIED**: Default status upon student submission (`POST /api/v1/applications/submit`).
- **SHORTLISTED**: Set by company founder during review (`PATCH /api/v1/applications/:applicationId/review`).
- **OFFER**: Set by company founder during review; requires `offerLetterUrl`.
- **REJECTED**: Set by company founder during review.
- **WITHDRAWN / DELETED**: Student withdrawal allowed within 24 hours of submission (`DELETE /api/v1/applications/:applicationId`).

## 2. State Transitions
```text
[ Submit ] ---> APPLIED ---> [ Review ] ---> SHORTLISTED ---> OFFER
                   |                             |
                   +---> [ Student Delete ]      +---> REJECTED
                           (Within 24h)
```
