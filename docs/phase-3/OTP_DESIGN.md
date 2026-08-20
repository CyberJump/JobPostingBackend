# OTP Infrastructure & Security Architecture (`docs/phase-3/OTP_DESIGN.md`)

> **OTP Architecture**: Cryptographically Secure, SHA-256 Hashed, Redis-Backed, Fail-Closed  
> **Status**: Stage A Security Specification  

---

## 1. Executive Summary

This document specifies the target OTP (One-Time Password) infrastructure for email verification, password reset, and account recovery operations. The design enforces strict cryptographic security, Redis-backed rate limiting, brute-force mitigation, account enumeration protection, and zero plaintext OTP logging.

---

## 2. Core Security Requirements

1. **Cryptographic Generation**: OTPs are generated using Node.js native `crypto.randomInt(100000, 999999)`, producing a uniform 6-digit numeric string.
2. **SHA-256 Hashed Storage**: The raw OTP is **NEVER** stored in Redis or database collections. Before persisting to Redis, the OTP is hashed via `SHA-256`. Only the hash is stored in Redis.
3. **One-Time Consumption**: Upon successful verification, the OTP key is deleted immediately from Redis (`DEL otp:{purpose}:{identifier}`).
4. **Account Enumeration Protection**: Public endpoints (`/api/v1/auth/otp/request`) return generic HTTP 200 responses (`"If an account is associated with this email, a verification code has been dispatched"`), preventing attackers from harvesting valid user emails.
5. **Zero Plaintext Logging**: Plaintext OTP values are explicitly redacted from all Pino log outputs and debug statements.

---

## 3. Redis Keys & TTL Scheme

```text
otp:{purpose}:{identifier}           -> SHA-256 Hash payload (TTL: 600s / 10 Mins)
otp:attempts:{purpose}:{identifier}  -> Integer failed attempt counter (TTL: 600s)
otp:cooldown:{purpose}:{identifier}  -> Resend cooldown timestamp (TTL: 60s)
otp:lockout:{purpose}:{identifier}   -> Brute-force lockout flag (TTL: 900s / 15 Mins)
```

---

## 4. Rate Limiting & Brute-Force Safeguards

- **Resend Cooldown**: 60 seconds mandatory delay between resend requests per identifier.
- **Hourly Request Cap**: Maximum 3 OTP requests per identifier per hour; maximum 10 requests per IP address per hour.
- **Attempt Limit**: Maximum 5 failed verification attempts per OTP code. Upon reaching 5 failed attempts, the OTP is invalidated immediately, and a 15-minute lockout flag (`otp:lockout:*`) is enforced.

---

## 5. Endpoints & Error Responses

### API Contracts
- `POST /api/v1/auth/otp/request`: Requests OTP dispatch for email verification or password reset.
- `POST /api/v1/auth/otp/verify`: Submits 6-digit OTP code for verification.

### Error Codes
- `RATE_LIMIT_EXCEEDED` (HTTP 429): "Please wait 60 seconds before requesting another code."
- `INVALID_OTP` (HTTP 400): "Invalid or expired verification code."
- `OTP_LOCKED_OUT` (HTTP 429): "Too many failed attempts. Account locked for 15 minutes."
- `INFRASTRUCTURE_ERROR` (HTTP 503): "Security infrastructure temporarily unavailable." (Fail-Closed when Redis is unreachable).
