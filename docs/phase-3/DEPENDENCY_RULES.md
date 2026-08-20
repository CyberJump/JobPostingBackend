# Architecture & Layer Dependency Rules (`docs/phase-3/DEPENDENCY_RULES.md`)

> **Architectural Boundary Enforcement**: Inward Dependency Rule; Clean Architecture Constraints  
> **Status**: Stage A Boundary Rule Specification  

---

## 1. The Inward Dependency Rule

Code dependencies must strictly point **inward** toward the Domain Layer. Inner layers must know **nothing** about outer layers, HTTP frameworks, database ORMs, or cloud storage SDKs.

```text
Outer Layer (Presentation / Infrastructure) ──► Middle Layer (Application) ──► Inner Layer (Domain)
```

---

## 2. Layer-by-Layer Permitted & Forbidden Imports

### 1. Domain Layer (`src/modules/<module>/domain/`)
- **Permitted Imports**: Pure JavaScript utilities, native Node.js modules (`crypto`, `path`).
- **Forbidden Imports**: **Express**, **Mongoose**, **ioredis**, **Cloudinary**, **Pino**, **Multer**.
- **Enforcement**: Jest Architecture lint tests verify zero framework imports inside `domain/` files.

### 2. Application Layer (`src/modules/<module>/application/`)
- **Permitted Imports**: Domain Entities, Domain Policies, Repository Interfaces, DTOs, Shared Error Classes (`AppError`).
- **Forbidden Imports**: Express `req`/`res` objects, Mongoose models directly, Cloudinary SDK directly.

### 3. Presentation Layer (`src/modules/<module>/presentation/`)
- **Permitted Imports**: Application Use Cases, Zod Schemas, Express Router/Request/Response objects, DTOs.
- **Forbidden Imports**: Direct Mongoose model queries (`User.find()`), direct database mutations, direct Cloudinary calls.

### 4. Infrastructure Layer (`src/infrastructure/` & `src/modules/<module>/infrastructure/`)
- **Permitted Imports**: Mongoose, ioredis, Cloudinary SDK, Nodemailer, Pino.
- **Implements**: Repository Interfaces defined in Application/Domain layers (`IJobRepository`, `IStorageProvider`, `IOtpStore`).
