# Configuration & Environment Audit (`docs/CONFIGURATION_AUDIT.md`)

> **Audit Date**: 2026-08-15  
> **Status**: Refactored & Centralized via `src/config/env.js`  

---

## 1. Environment Variables Audit Matrix

| Variable | Config Property | Sensitive | Required | Default | Centralized Usage Location |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `PORT` | `config.port` | No | No | `8000` | [src/index.js](file:///d:/CS/JobPosting/JobPostingBackend/src/index.js) |
| `MONGODB_URL` | `config.db.url` | Yes | Yes | N/A | [src/db/index.js](file:///d:/CS/JobPosting/JobPostingBackend/src/db/index.js) |
| `ACCESS_TOKEN_SECRET` | `config.auth.accessTokenSecret` | Yes | Yes | N/A | [src/middlewares/auth.middleware.js](file:///d:/CS/JobPosting/JobPostingBackend/src/middlewares/auth.middleware.js) |
| `ACCESS_TOKEN_EXPIRY` | `config.auth.accessTokenExpiry` | No | No | `1d` | [src/models/user.models.js](file:///d:/CS/JobPosting/JobPostingBackend/src/models/user.models.js) |
| `REFRESH_TOKEN_SECRET` | `config.auth.refreshTokenSecret` | Yes | Yes | N/A | [src/models/user.models.js](file:///d:/CS/JobPosting/JobPostingBackend/src/models/user.models.js) |
| `REFRESH_TOKEN_EXPIRY` | `config.auth.refreshTokenExpiry` | No | No | `10d` | [src/models/user.models.js](file:///d:/CS/JobPosting/JobPostingBackend/src/models/user.models.js) |
| `CLOUDINARY_CLOUD_NAME` | `config.cloudinary.cloudName` | No | Yes | N/A | [src/utils/cloudinary.js](file:///d:/CS/JobPosting/JobPostingBackend/src/utils/cloudinary.js) |
| `CLOUDINARY_API_KEY` | `config.cloudinary.apiKey` | Yes | Yes | N/A | [src/utils/cloudinary.js](file:///d:/CS/JobPosting/JobPostingBackend/src/utils/cloudinary.js) |
| `CLOUDINARY_API_SECRET` | `config.cloudinary.apiSecret` | Yes | Yes | N/A | [src/utils/cloudinary.js](file:///d:/CS/JobPosting/JobPostingBackend/src/utils/cloudinary.js) |
| `ALLOWED_ORIGINS` | `config.cors.allowedOrigins` | No | No | `http://localhost:3000,http://localhost:5173` | [src/app.js](file:///d:/CS/JobPosting/JobPostingBackend/src/app.js) |
| `NODE_ENV` | `config.env` | No | No | `development` | Global configuration |

---

## 2. Refactoring Summary

Direct calls to `process.env.X` across application modules were refactored to import `config` from `src/config/env.js`.
Validation is strictly performed at application startup via Zod schema. If any required environment variable is missing, process exits with a clear error payload.
