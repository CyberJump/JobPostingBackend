# OTP Purpose Matrix (`docs/phase-3/OTP_PURPOSE_MATRIX.md`)

> **OTP Scenarios**: Approved Product Use Cases & Security Boundaries  
> **Status**: Stage A Purpose Matrix Specification  

---

## 1. Approved OTP Use Cases Matrix

| Purpose | Workflow | Identifier | Code Format | TTL | Attempts | Cooldown | Lockout | Endpoint |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Email Verification** | Account Onboarding | Email | 6-Digit Numeric | 10 Mins (`600s`) | 5 Attempts | 60 Secs | 15 Mins | `POST /api/v1/auth/otp/verify` |
| **Password Reset** | Forgotten Password | Email | 6-Digit Numeric | 10 Mins (`600s`) | 5 Attempts | 60 Secs | 15 Mins | `POST /api/v1/auth/otp/verify` |
| **Co-Founder Verification** | Invite Acceptance | Email | 6-Digit Numeric | 15 Mins (`900s`) | 5 Attempts | 60 Secs | 15 Mins | `POST /api/v1/invites/accept` |

---

## 2. Excluded / Un-supported Scenarios

The following scenarios are **EXPLICITLY NOT SUPPORTED** as OTP workflows:
- **Routine Login**: Routine user authentication uses HTTP-Only JWT tokens, not mandatory OTPs on every login.
- **Phone SMS Verification**: Carrier SMS delivery is excluded (Email delivery provider standard).
- **Public API Access**: API integrations use Bearer JWT / API keys, not OTPs.
