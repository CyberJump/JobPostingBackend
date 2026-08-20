# System Configuration & Environment Changelog

Tracks configuration schema changes, environment variables, default updates, and security setting modifications.

## Environment Variables Configuration Baseline

| Environment Variable | Required | Default Value | Purpose | Sensitive |
| :--- | :---: | :--- | :--- | :---: |
| `PORT` | No | `8000` | Server listen port | No |
| `MONGODB_URL` | Yes | `<REDACTED>` | MongoDB connection URI | Yes |
| `ACCESS_TOKEN_SECRET` | Yes | `<REDACTED>` | Signing key for Access JWTs | Yes |
| `ACCESS_TOKEN_EXPIRY` | Yes | `1d` | Lifetime for Access JWTs | No |
| `REFRESH_TOKEN_SECRET` | Yes | `<REDACTED>` | Signing key for Refresh JWTs | Yes |
| `REFRESH_TOKEN_EXPIRY` | Yes | `10d` | Lifetime for Refresh JWTs | No |
| `CLOUDINARY_CLOUD_NAME` | Yes | `<REDACTED>` | Cloudinary account name | No |
| `CLOUDINARY_API_KEY` | Yes | `<REDACTED>` | Cloudinary API Key | Yes |
| `CLOUDINARY_API_SECRET` | Yes | `<REDACTED>` | Cloudinary API Secret | Yes |
| `NODE_ENV` | No | `development` | Environment mode (`development` / `production`) | No |
