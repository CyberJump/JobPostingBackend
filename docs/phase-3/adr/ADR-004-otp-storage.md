# ADR-004: SHA-256 Hashed OTP Storage & Redis Attempt Lifecycle

## Status
ACCEPTED

## Context
Email verification and password reset require short-lived one-time passwords. Storing raw OTPs in plaintext in database collections or Redis creates severe security vulnerabilities if cache stores or database logs are compromised.

## Decision
1. **Generation**: Cryptographically secure 6-digit integer generation via `crypto.randomInt(100000, 999999)`.
2. **Hashed Storage**: The raw OTP is hashed via SHA-256 (`crypto.createHash('sha256').update(otp).digest('hex')`) before storing in Redis key `otp:{purpose}:{identifier}` with a 10-minute TTL.
3. **Consumption**: Single-use invalidation upon successful verification.
4. **Brute-Force Protection**: 5 failed verification attempts trigger immediate OTP deletion and set a 15-minute lockout flag. 60-second resend cooldown enforced via Redis `otp:cooldown:*`.

## Consequences
- Guarantees zero plaintext OTP exposure in Redis or application log files.
- Prevents brute-force enumeration attacks via fail-closed lockout policies.
