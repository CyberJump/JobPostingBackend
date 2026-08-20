# ADR-008: Liveness/Readiness Probes & Graceful Shutdown Lifecycle

## Status
ACCEPTED

## Context
Production container orchestrators (Kubernetes, AWS ECS) require separate probes for process liveness vs readiness, and signal handling (`SIGTERM`/`SIGINT`) for zero-downtime deployments.

## Decision
1. **Health Probes**:
   - `GET /api/v1/health/live`: Liveness probe. Returns HTTP 200 if Node process is listening.
   - `GET /api/v1/health/ready`: Readiness probe. Returns HTTP 200 if MongoDB connection state is active (`readyState === 1`) and Redis is connected.
2. **Graceful Shutdown**: Upon receiving `SIGTERM` or `SIGINT`, the application stops accepting new HTTP connections, waits for active in-flight requests to drain, closes Redis client connections, closes MongoDB connection, and exits cleanly.

## Consequences
- Prevents container orchestrators from routing traffic to unready or shutting-down instances.
- Prevents broken database operations during rolling deployments.
