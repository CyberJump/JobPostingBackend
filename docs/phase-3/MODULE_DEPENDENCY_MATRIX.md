# Module Dependency Matrix (`docs/phase-3/MODULE_DEPENDENCY_MATRIX.md`)

> **Architectural Boundary Rules**: Zero Circular Dependencies; Explicit Public Module Ports  
> **Status**: Stage A Architectural Specification  

---

## 1. Cross-Module Dependency Matrix

| Invoking Module | Auth | Users | Companies | Jobs | Applications | Invitations | Verification | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Auth** | — | Read Port | No | No | No | No | No | No |
| **Users** | Policy | — | Read Port | No | Read Port | Read Port | Read Port | Admin |
| **Companies** | Policy | Read Port | — | Owns | Read Port | Owns | Read Port | Admin |
| **Jobs** | Policy | Read Port | Read Port | — | Read Port | No | No | Admin |
| **Applications** | Policy | Read Port | Read Port | Read Port | — | No | No | Admin |
| **Invitations** | Policy | Read Port | Read Port | No | No | — | No | Admin |
| **Verification** | Policy | Read Port | Read Port | No | No | No | — | Admin |
| **Admin** | Policy | Admin Port | Admin Port | Admin Port | Admin Port | Admin Port | Admin Port | — |

---

## 2. Direct Cross-Module Import Restrictions

1. **Forbidden Import Pattern**: Direct persistence ORM model cross-imports are strictly forbidden. For example, `jobs` module must NEVER import `import CompanyModel from "../../companies/models/company.model.js"`.
2. **Permitted Cross-Module Communication**:
   - **In-Process Module Public Ports**: Each module exposes an explicit public API service interface in `src/modules/<module>/public.js` (e.g. `CompanyPublicService.getCompanySummaryById(companyId)`).
   - **Shared Kernel DTOs**: Transfer objects passed between module boundaries use immutable JavaScript DTOs.
   - **Domain Events**: Internal asynchronous decoupling (e.g. `CompanyVerifiedEvent`) handled via shared EventEmitter.

---

## 3. Circular Dependency Prevention

The dependency DAG (Directed Acyclic Graph) is enforced as follows:

```text
               ┌──────────────┐
               │ Shared / Auth│
               └──────┬───────┘
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
     ┌───────────┐         ┌───────────┐
     │   Users   │         │ Companies │
     └─────┬─────┘         └─────┬─────┘
           │                     │
           ├──────────┬──────────┤
           ▼          ▼          ▼
       ┌───────┐  ┌───────┐  ┌───────┐
       │ Jobs  │  │Invites│  │Verif. │
       └───┬───┘  └───────┘  └───────┘
           │
           ▼
    ┌─────────────┐
    │Applications │
    └─────────────┘
```

Circular calls such as `Jobs -> Applications -> Companies -> Jobs` are architecturally impossible under this DAG structure.
