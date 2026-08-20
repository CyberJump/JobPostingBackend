# Architecture Decision Record — Email Verification Security Controls

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Email Verification Security  

---

## 1. Cryptographic OTP Storage & Lifecycle
- **OTP Generation**: Cryptographically secure 6-digit numeric generation (`100000–999999`) via `crypto.randomInt()`.
- **SHA-256 Hashing**: Plaintext OTP is NEVER stored in Redis or database. Only `SHA-256(OTP)` is stored.
- **TTL**: 10 minutes (600 seconds).
- **Cooldown**: 60 seconds between resend requests (`otp:cooldown:*`).
- **Lockout**: 5 failed verification attempts trigger immediate key deletion and 15-minute lockout flag (`otp:lockout:*`).
- **Single-Use Invalidation**: OTP key is deleted immediately upon successful verification.

## 2. Fail-Closed & Enumeration Controls
- **Redis Fail-Closed**: If Redis connection is down (`!isRedisReady()`), requests fail-closed immediately with `HTTP 503 Service Unavailable`.
- **Account Enumeration Protection**: `/request` returns `{ message: "If an account exists, a verification code has been dispatched" }` regardless of email presence.
- **Rate Limiting**: `fixedWindowRateLimiter` applied to `/request` and `/verify`.
