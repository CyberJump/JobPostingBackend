# Architecture Decision Record — Company Founder Membership & Authorization Architecture

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Companies Module  

---

## 1. Context & Business Model
In the BusinessClinic domain model, a `Company` entity contains a list of founders: `founders: [{ userId }]`.
- **Initial Founder**: Upon registration (`POST /api/v1/companies/register`), the authenticated user's ID (`req.user._id`) is automatically assigned as the initial founder.
- **Co-Founders**: Additional founders can be associated under `founders` array.
- **Authorization**: Company mutation endpoints (`PATCH /update`, `DELETE /withdraw`) check founder authorization via `CompanyPolicy.isFounder(company, authenticatedUserId)` or `req.user.role === "ADMIN"`. Client-supplied user IDs in request bodies are ignored for authorization.

## 2. Cross-Module Boundaries
- **Users Boundary**: The `Company` entity stores user references by ID (`founders.userId`). Company domain/application layers DO NOT directly import the `User` Mongoose model. When populating user details, `MongoCompanyRepository` performs infrastructure-level Mongoose population or aggregation lookups (`$lookup` from `users` collection).
- **Invitations Boundary (CHG-0015)**: Co-founder invitation workflows will be managed by the Invitations module when CHG-0015 is reached.
