# Environment Variable Matrix (`docs/phase-3/ENVIRONMENT_MATRIX.md`)

> **Configuration Governance**: Zod Startup Validation; Zero Secret Logging  
> **Status**: Stage A Environment Specification  

---

## 1. Environment Variable Matrix

| Variable | Required | Development | Test | Production | Secret | Sensitive Log Redaction | Purpose |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `PORT` | No | `8000` | `8000` | Env / `8000` | No | No | Node HTTP server port |
| `NODE_ENV` | No | `development` | `test` | `production` | No | No | Application environment flag |
| `MONGODB_URL` | **Yes** | `mongodb://localhost:27017` | `mongodb://localhost:27017` | Secret URL | **Yes** | **Yes** | MongoDB Atlas connection string |
| `REDIS_URL` | Depends | `redis://localhost:6379` | `redis://localhost:6379` | Secret URL | **Yes** | **Yes** | Redis cache/OTP connection string |
| `REDIS_ENABLED` | No | `true` | `false` | `true` | No | No | Master Redis toggle flag |
| `REDIS_KEY_PREFIX` | No | `bc_api` | `bc_api_test` | `bc_api` | No | No | Key namespace prefix |
| `ACCESS_TOKEN_SECRET` | **Yes** | Dev Secret | Test Secret | 256-bit Secret | **Yes** | **Yes** | JWT Access Token signing key |
| `ACCESS_TOKEN_EXPIRY` | No | `1d` | `1d` | `1d` | No | No | Access Token expiration duration |
| `REFRESH_TOKEN_SECRET` | **Yes** | Dev Secret | Test Secret | 256-bit Secret | **Yes** | **Yes** | JWT Refresh Token signing key |
| `REFRESH_TOKEN_EXPIRY` | No | `10d` | `10d` | `10d` | No | No | Refresh Token expiration duration |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | String | String | String | No | No | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | **Yes** | Key | Key | Key | **Yes** | **Yes** | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | **Yes** | Secret | Secret | Secret | **Yes** | **Yes** | Cloudinary API Secret |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000` | `http://localhost:3000` | Production URLs | No | No | Comma-delimited allowed CORS origins |

---

## 2. Fast-Fail Startup Enforcement

Application startup via `src/config/env.js` validates all environment variables against the Zod schema before connecting to MongoDB or binding the HTTP server. If any required variable (`MONGODB_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `CLOUDINARY_*`) is missing or invalid, process exits immediately with code `1`.
