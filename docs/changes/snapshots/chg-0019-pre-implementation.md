# CHG-0019 — Pre-Implementation Snapshot

> **Date**: 2026-08-16  
> **Target**: Async Error Handling & HTTP Status Code Sanitization (`src/utils/asynchandler.js`)  
> **Branch**: `main`  
> **Commit**: `afede20`  

---

## 1. Initial State Assessment
- **Git Status**: Clean
- **Jest Test Suite Baseline**: 26 passed, 26 total (108 tests passing)
- **Container Status**: `jobpostingbackend-app` (Up - healthy), `jobpostingbackend-redis` (Up)

---

## 2. CRIT-001 Reproduction Evidence (Before Fix)

### Defect Code Snippet (`src/utils/asynchandler.js` baseline)
```javascript
const asynchandler = (requesthandler) => {
    return (req, res, next) => {
        Promise.resolve(requesthandler(req, res, next)).catch((error) => {
            let statusCode = error.code || error.statusCode || 500;
            if (statusCode < 100 || statusCode >= 1000) {
                statusCode = 500;
            }
            res.status(statusCode).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        });
    }   
}
```

### Observed Runtime Failure
When an unhandled exception occurs where `error.code = "INTERNAL_ERROR"` (string):
1. `error.code || error.statusCode` assigns `"INTERNAL_ERROR"` to `statusCode`.
2. `statusCode < 100` evaluates `"INTERNAL_ERROR" < 100` $\rightarrow$ `false`.
3. `res.status("INTERNAL_ERROR")` is executed.
4. Express throws `TypeError: Invalid status code: "INTERNAL_ERROR". Status code must be an integer.`
5. The Node.js process crashes or experiences socket hangups.

---

## 3. Pre-Fix Newman Execution Summary
- **Requests Executed**: 20
- **Failed Assertions**: 4 (caused by socket hangup when container process crashed on string error code)

---

## 4. Planned Remediation
1. Update `src/utils/asynchandler.js` to delegate caught errors to `next(error)` when `next` function is available, allowing `globalErrorHandler` (`src/middlewares/error.middleware.js`) to process the error envelope.
2. In `asynchandler.js` inline fallback, sanitize `statusCode` strictly:
   ```javascript
   let statusCode = error.statusCode || error.code || 500;
   if (typeof statusCode !== "number" || !Number.isInteger(statusCode) || statusCode < 100 || statusCode >= 600) {
       statusCode = 500;
   }
   ```
3. Add comprehensive unit tests in `tests/unit/asynchandler.test.js` to test all valid and malformed error inputs (`"INTERNAL_ERROR"`, `null`, `undefined`, `NaN`, `Symbol`, objects, out-of-range numbers).
4. Run full Jest unit tests and Newman container black-box tests to confirm 100% pass rate and zero process restarts.
