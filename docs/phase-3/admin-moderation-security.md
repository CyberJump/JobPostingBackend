# Architecture Decision Record — Admin Security & Moderation Controls

> **Status**: APPROVED  
> **Date**: 2026-08-16  
> **Context**: Phase 3 Modular Monolith Architecture — Admin Security  

---

## 1. Security Controls
- **Authenticated Identity Context**: `req.user._id` and `req.user.role` are derived strictly from JWT authentication.
- **Self-Operation Restrictions**: Admins CANNOT remove their own admin privileges (`user._id === req.user._id`) or block themselves.
- **Admin Immunity**: Admins CANNOT block other admins via `BlockUserUseCase`. Admin privileges must be demoted first.
- **Privilege Escalation Protection**: Field allowlists prevent client-supplied `role`, `status`, or `approvedBy` overrides.
