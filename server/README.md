# DevPortal Server

## Render Deployment

### Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Setup

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `devportal-server`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variable:
   - `DOMAIN` = `tunnel.stylnode.in`
6. Click **Create Web Service**

### Custom Domain Setup

After deployment:
1. Go to your service → **Settings** → **Custom Domains**
2. Add `tunnel.stylnode.in`
3. Add `*.tunnel.stylnode.in` (for wildcard subdomains)
4. Render will show you the DNS records to add

### DNS Records

Add these to your domain registrar:

| Type  | Name     | Value                              |
|-------|----------|------------------------------------|
| CNAME | tunnel   | `<your-service>.onrender.com`      |
| CNAME | *.tunnel | `<your-service>.onrender.com`      |

## Local Development

```bash
npm install
npm run dev
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/tunnels/:id` - Get tunnel info
- `GET /api/devices/:deviceId/tunnels` - List device tunnels
- `WS /ws` - WebSocket endpoint for CLI connections
