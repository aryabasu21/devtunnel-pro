# DevPortal Server

## Railway Deployment

### Service Setup
The production server is deployed from the `server` directory on Railway. Configure
the service with `npm install && npm run build` as the build command and `npm start`
as the start command. Keep WebSocket support enabled and use `/ready` for the
service health check. `/health` is a liveness endpoint and does not claim that the
database is available.

Copy `.env.example` when setting up a local environment. Production secrets must be
provided through Railway environment variables or a secret manager.

### Custom Domain Setup

After deployment:

1. Go to your service → **Settings** → **Custom Domains**
2. Add `tunnel.stylnode.in`
3. Add `*.tunnel.stylnode.in` (for wildcard subdomains)
4. Railway will show you the DNS records to add

### DNS Records

Add these to your domain registrar:

| Type  | Name      | Value                         |
| ----- | --------- | ----------------------------- |
| CNAME | tunnel    | `<your-service>.up.railway.app` |
| CNAME | \*.tunnel | `<your-service>.up.railway.app` |

## Local Development

```bash
npm install
npm run dev
```

## Authentication configuration

The server uses OIDC bearer tokens. Set all three OIDC variables before mounting
authenticated routes:

- `OIDC_ISSUER` - the issuer URL from the identity provider
- `OIDC_AUDIENCE` - the API audience configured for this server
- `OIDC_JWKS_URL` - optional JWKS URL; defaults to the issuer's standard JWKS path

The authentication middleware is in `src/middleware/auth.ts`. It validates the
signature, issuer, audience, expiry, and subject before attaching an identity to the
Express request.

## API Endpoints

- `GET /health` - Liveness check
- `GET /ready` - Readiness check (includes MongoDB connectivity)
- `GET /api/tunnels/:id` - Get tunnel info
- `GET /api/devices/:deviceId/tunnels` - List device tunnels
- `WS /ws` - WebSocket endpoint for CLI connections
