# ADR-007: Repository Pattern & Infrastructure Boundary Isolation

## Status
ACCEPTED

## Context
Controllers in the legacy application executed raw Mongoose queries (`Job.aggregate()`, `Application.findOne()`), tying business logic directly to the Mongoose ORM.

## Decision
We introduce Repository Interfaces in the Application/Domain layers (`IJobRepository`, `IApplicationRepository`). Mongoose data access is isolated within Infrastructure implementations (`MongoJobRepository`, `MongoApplicationRepository`). Controllers never import or call Mongoose models directly.

## Consequences
- Business logic can be unit-tested without connecting to a live MongoDB instance or mocking Mongoose chained methods.
- Mongoose queries are localized inside repository infrastructure classes.
