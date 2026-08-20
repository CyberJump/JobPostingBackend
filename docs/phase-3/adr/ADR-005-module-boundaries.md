# ADR-005: Domain Module Boundaries and Capabilities

## Status
ACCEPTED

## Context
The legacy application organized code by layer (`controllers/`, `models/`, `routes/`), scattering domain rules and capabilities across generic directory structures.

## Decision
We organize code into domain modules matching business capabilities (`auth`, `users`, `companies`, `jobs`, `applications`, `invitations`, `verification`, `admin`). Modules encapsulate their presentation, application use cases, domain policies, and infrastructure persistence repositories.

## Consequences
- Domain capabilities are cohesive and localized within `src/modules/<module>/`.
- Enables independent unit testing per module.
- Prepares the application for potential future microservice extraction if required.
