# ADR-006: In-Process Cross-Module Communication via Public Module Ports

## Status
ACCEPTED

## Context
Directly importing persistence ORM models across modules (e.g. `jobs` controller importing `Company` model directly) breaks encapsulation and creates tight coupling.

## Decision
Cross-module communication must strictly use in-process public module ports (`src/modules/<module>/public.js`). Modules expose lightweight service interfaces returning immutable DTOs. Direct persistence model cross-imports are strictly forbidden.

## Consequences
- Eliminates circular dependencies across modules.
- Preserves module autonomy while avoiding distributed network overhead.
