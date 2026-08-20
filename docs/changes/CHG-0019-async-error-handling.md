# CHG-0019 — Async Error Handling & HTTP Status Code Sanitization Hardening

> **Change ID**: `CHG-0019`  
> **Date**: 2026-08-16  
> **Author**: Chief Security Reliability Engineer  
> **Status**: **COMPLETED & VERIFIED**  
> **Impacted Files**: `src/utils/asynchandler.js`, `tests/unit/asynchandler.test.js`  

---

## 1. Problem Statement & Root Cause (CRIT-001)

During the black-box Postman/Newman audit, a critical runtime defect was discovered in `src/utils/asynchandler.js`:

```javascript
// PRE-FIX IMPLEMENTATION
let statusCode = error.code || error.statusCode || 500;
if (statusCode < 100 || statusCode >= 1000) {
    statusCode = 500;
}
res.status(statusCode).json({...});
```

When an exception occurred where `error.code = "INTERNAL_ERROR"` (a string):
- `error.code` evaluated to `"INTERNAL_ERROR"`.
- `"INTERNAL_ERROR" < 100` evaluated to `false` in JavaScript.
- Express `res.status("INTERNAL_ERROR")` threw `TypeError: Invalid status code: "INTERNAL_ERROR"`.
- Node.js process crashed or hung up sockets.

---

## 2. Hardened Architecture & Design Choice

To fix CRIT-001 deterministically:

1. **Express Middleware Delegation**:
   When `next` function is supplied to `asynchandler(req, res, next)`, caught errors are delegated immediately to Express `next(error)`, allowing `globalErrorHandler` (`src/middlewares/error.middleware.js`) to handle standard logging, correlation ID mapping, and `ApiResponse` formatting.

2. **Inline Sanitization Fallback**:
   If `asynchandler` handles the error directly inline (when `next` is not provided), `statusCode` is strictly sanitized:
   - Must be of JavaScript `typeof === "number"`.
   - Must be an integer (`Number.isInteger(statusCode)`).
   - Must fall within valid HTTP status bounds ($100 \le \text{statusCode} < 600$).
   - Any value failing these constraints defaults safely to `500 Internal Server Error`.

---

## 3. Scope Controls & Preservation

- **Zero Domain Business Logic Touched**: 0 changes to `auth`, `users`, `companies`, `jobs`, `applications`, `verification`, or `admin` modules.
- **Zero API Envelope Regressions**: Express `globalErrorHandler` formats error envelopes identically.
- **Zero Test Removals**: All 108 pre-existing tests preserved, 42 new unit tests added. Total 150 tests passed.

---

## 4. Verification Evidence
- Unit Tests: `npm test` $\rightarrow$ 27/27 test suites passed, 150/150 tests passed.
- Docker Runtime: Container rebuilt and running healthy.
- Process Survival: `docker compose ps` shows `Up` status throughout Newman black-box collection execution.
