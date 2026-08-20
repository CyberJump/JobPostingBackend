# System Architecture Changelog

Tracks all architectural patterns, design decisions, layer refactoring, and structural evolutions.

## ARCH-0001 — Express 5.x & Mongoose 9.x Baseline Architecture

### Date
2026-08-15

### Problem
Legacy codebase lacked formal structural documentation and layer boundaries.

### Decision
Document current architecture baseline:
- Express 5.x HTTP Routing Layer (`src/routes/`)
- Controller Request Handlers (`src/controllers/`) wrapped by `asynchandler`
- Mongoose 9.x ODM Data Layer (`src/models/`) with MongoDB
- Storage Provider Interface (`src/utils/cloudinary.js`) for Cloudinary image and document uploads
- JWT Middleware Pipeline (`src/middlewares/auth.middleware.js`)

### Alternatives Considered
None (Baseline audit).

### Trade-offs & Consequences
Identified lack of global Express error handling middleware, missing service layer separation, and missing schema validation library (Zod/Joi).
