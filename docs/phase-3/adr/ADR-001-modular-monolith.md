# ADR-001: Modular Monolith Architecture Pattern

## Status
ACCEPTED

## Context
The legacy `JobPostingBackend` codebase operated as an Express MVP with direct database calls in controllers. The system needs enterprise scalability, clear domain boundaries, and high maintainability, but converting to microservices would introduce excessive operational overhead, network latency, distributed transaction complexity (Saga patterns), and infrastructure cost.

## Decision
We adopt an **Enterprise Modular Monolith** architecture pattern. All domain modules (`auth`, `users`, `companies`, `jobs`, `applications`, `invitations`, `verification`, `moderation`, `admin`) will reside in a single deployable Node.js application under `src/modules/`. Boundaries will be strictly enforced using Clean Layering (Presentation -> Application -> Domain <- Infrastructure).

## Consequences
### Positive
- Single deployment pipeline and simple local development via Docker Compose.
- Zero network latency for inter-domain function calls.
- High domain isolation that permits extracting modules into independent microservices in the future if traffic demands.

### Negative
- Requires strict enforcement of dependency rules to prevent monolithic spaghetti coupling.
