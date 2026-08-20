# Architecture Decision Record — Job Lifecycle & State Machine

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Jobs Module  

---

## 1. Job Lifecycle States
- **ACTIVE**: Default status upon creation (`POST /api/v1/jobs/create`). Visible to users in job searches.
- **INACTIVE**: Set when a job is closed (`PATCH /api/v1/jobs/:jobId/close`) or when application deadline expires. Excluded from student search results unless `includeExpired=true` is provided by authorized roles.

## 2. State Transitions
```text
[ Creation ] ---> ACTIVE ---> [ CloseJob / Expire ] ---> INACTIVE
                     |
                     +---> [ DeleteJob ] ---> [ Deleted ]
```

## 3. Authorization Rules
- **Creation**: Allowed for users with `COMPANY` role.
- **Update / Close / Delete**: Allowed only if user is an `ADMIN` or a confirmed founder of the associated company.
