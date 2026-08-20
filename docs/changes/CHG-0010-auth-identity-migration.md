# CHG-0010 — Auth & Identity Module Migration

## Status
COMPLETED

## Date
2026-08-16

## Category
Architecture / Domain Migration / Authentication / Security

## Risk Level
MEDIUM (Auth Domain Migration — 100% Backward Compatible)

## Objective
Migrate legacy authentication and credential management logic into `src/modules/auth/` adhering to the Enterprise Modular Monolith architecture established in CHG-0008. Consume shared infrastructure created in CHG-0009 (`otpService`, `fixedWindowRateLimiter`, `idempotencyService`, `AppError`).

## Architecture & Layering Summary
```text
src/modules/auth/
├── application/use-cases/
│   ├── RegisterUserUseCase.js
│   ├── LoginUserUseCase.js
│   ├── LogoutUserUseCase.js
│   ├── RefreshTokenUseCase.js
│   ├── ChangePasswordUseCase.js
│   ├── RequestOtpUseCase.js
│   └── VerifyOtpUseCase.js
├── domain/
│   ├── ports/
│   │   ├── IIdentityRepository.js
│   │   └── ITokenProvider.js
│   └── policies/
│       └── AuthPolicy.js
├── infrastructure/
│   ├── repositories/
│   │   └── MongoIdentityRepository.js
│   └── token/
│       └── JwtTokenProvider.js
├── presentation/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── otp.controller.js
│   └── routes/
│       ├── auth.routes.js
│       └── otp.routes.js
└── schemas/
    └── auth.schemas.js
```

## Files Added
- `src/modules/auth/domain/ports/IIdentityRepository.js`
- `src/modules/auth/domain/ports/ITokenProvider.js`
- `src/modules/auth/domain/policies/AuthPolicy.js`
- `src/modules/auth/infrastructure/repositories/MongoIdentityRepository.js`
- `src/modules/auth/infrastructure/token/JwtTokenProvider.js`
- `src/modules/auth/application/use-cases/RegisterUserUseCase.js`
- `src/modules/auth/application/use-cases/LoginUserUseCase.js`
- `src/modules/auth/application/use-cases/LogoutUserUseCase.js`
- `src/modules/auth/application/use-cases/RefreshTokenUseCase.js`
- `src/modules/auth/application/use-cases/ChangePasswordUseCase.js`
- `src/modules/auth/application/use-cases/RequestOtpUseCase.js`
- `src/modules/auth/application/use-cases/VerifyOtpUseCase.js`
- `src/modules/auth/schemas/auth.schemas.js`
- `src/modules/auth/presentation/controllers/auth.controller.js`
- `src/modules/auth/presentation/controllers/otp.controller.js`
- `src/modules/auth/presentation/routes/otp.routes.js`
- `tests/unit/auth.module.test.js`
- `tests/api/otp.routes.test.js`
- `docs/changes/snapshots/chg-0010-pre-implementation.md`
- `docs/changes/snapshots/chg-0010-post-implementation.md`
- `docs/changes/CHG-0010-VERIFICATION.md`

## Files Modified
- `src/routes/user.routes.js` (Delegated authentication routes to `auth.controller.js` and attached fixed-window rate limiters)
- `src/app.js` (Mounted `/api/v1/auth` OTP routes)
- `src/infrastructure/storage/storage.port.js` (Fixed Cloudinary export method reference)
- `src/middlewares/validate.middleware.js` (Fixed Zod error issue array handling)
- `docs/openapi.yaml` (Documented OTP endpoints)
- `docs/CHANGELOG.md`
- `docs/CHANGE_INDEX.md`

## Files Deleted
None

## Testing & Regression Verification
```text
Test Suites: 12 passed, 12 total
Tests:       59 passed, 59 total
Passed:      59
Failed:      0
Skipped:     0
```

## Rollback Strategy
Revert CHG-0010 commit boundary. Legacy user controller functions remain active for non-auth profile updates (`UpdateAccountDetails`, `UpdateProfilePhoto`). Zero database schema modifications were performed.
