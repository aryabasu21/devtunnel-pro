# DevPortal Server

The backend server for DevPortal tunnels. Handles WebSocket connections from CLI clients and forwards HTTP requests.

## Architecture

```
                    ┌─────────────────────────────────────────────────────┐
                    │                   DevPortal Server                  │
                    │                                                     │
Internet ──────────►│  ┌─────────────┐     ┌──────────────────────────┐  │
    HTTPS           │  │   Nginx     │────►│     Express Server       │  │
                    │  │  (SSL/TLS)  │     │     (Port 3001)          │  │
                    │  └─────────────┘     │                          │  │
                    │                       │  - HTTP request handling │  │
                    │                       │  - Subdomain routing     │  │
                    │                       │  - Tunnel management     │  │
                    │                       └──────────────────────────┘  │
                    │                                   ▲                 │
                    │                                   │ Forward         │
                    │                                   ▼                 │
                    │                       ┌──────────────────────────┐  │
CLI Client ◄───────┼───────────────────────│   WebSocket Server       │  │
    WSS             │                       │     (Port 3002)          │  │
                    │                       │                          │  │
                    │                       │  - CLI connections       │  │
                    │                       │  - Request forwarding    │  │
                    │                       │  - Response handling     │  │
                    │                       └──────────────────────────┘  │
                    └─────────────────────────────────────────────────────┘
```

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Build
npm run build

# Start server
npm start

# Or development mode
npm run dev
```

Server will start on:
- HTTP: http://localhost:3001
- WebSocket: ws://localhost:3002

## Production Deployment

### Option 1: Docker

```bash
# Build image
docker build -t devportal-server .

# Run container
docker run -d \
  -p 3001:3001 \
  -p 3002:3002 \
  -e DOMAIN=your-domain.com \
  --name devportal \
  devportal-server
```

### Option 2: Docker Compose (Recommended)

```bash
# Create .env file
echo "DOMAIN=your-domain.com" > .env

# Start services
docker-compose up -d
```

### Option 3: Manual Deployment

1. **Server Setup (Ubuntu/Debian)**

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and build
git clone <your-repo>
cd server
npm ci
npm run build
```

2. **Systemd Service**

```bash
sudo cat > /etc/systemd/system/devportal.service << EOF
[Unit]
Description=DevPortal Tunnel Server
After=network.target

[Service]
Type=simple
User=devportal
WorkingDirectory=/opt/devportal/server
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=PORT=3001
Environment=WS_PORT=3002
Environment=DOMAIN=your-domain.com

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable devportal
sudo systemctl start devportal
```

3. **SSL Certificates (Let's Encrypt)**

```bash
# Install certbot
sudo apt install certbot

# Get wildcard certificate
sudo certbot certonly --manual \
  -d "*.your-domain.com" \
  -d "your-domain.com" \
  --preferred-challenges dns
```

## DNS Configuration

Set up the following DNS records for your domain:

| Type  | Name                | Value              |
|-------|---------------------|--------------------|
| A     | devportal.live      | <server-ip>        |
| A     | *.devportal.live    | <server-ip>        |
| A     | ws.devportal.live   | <server-ip>        |

## Environment Variables

| Variable  | Default           | Description                    |
|-----------|-------------------|--------------------------------|
| PORT      | 3001              | HTTP server port               |
| WS_PORT   | 3002              | WebSocket server port          |
| DOMAIN    | localhost:3001    | Base domain for tunnel URLs    |

## API Endpoints

### Health Check
```
GET /health
Response: { "status": "ok", "tunnels": <count> }
```

### Get Tunnel Info
```
GET /api/tunnels/:tunnelId
Response: { "id", "name", "url", "status", "createdAt" }
```

### List Device Tunnels
```
GET /api/devices/:deviceId/tunnels
Response: [{ "id", "name", "url", "status", "createdAt" }]
```

## WebSocket Protocol

### Client → Server

**Register Tunnel**
```json
{
  "type": "register",
  "deviceId": "dev_xxx",
  "localPort": 3000,
  "subdomain": "my-app",
  "password": "secret",
  "demo": false
}
```

**Response (from local server)**
```json
{
  "type": "response",
  "requestId": "uuid",
  "status": 200,
  "headers": {},
  "body": "..."
}
```

### Server → Client

**Registration Success**
```json
{
  "type": "registered",
  "tunnel": {
    "id": "t-xxx",
    "name": "my-app",
    "url": "https://my-app.devportal.live",
    "expiresAt": null
  }
}
```

**Forward Request**
```json
{
  "type": "request",
  "requestId": "uuid",
  "method": "POST",
  "path": "/api/data",
  "headers": {},
  "query": {},
  "body": "..."
}
```

## Cloud Deployment Options

### Railway
```bash
railway init
railway up
```

### Render
Create a new Web Service pointing to the `server` directory.

### DigitalOcean App Platform
Use the included `Dockerfile`.

### AWS EC2 / GCP Compute Engine
Follow the manual deployment instructions above.

## Monitoring

The server logs all tunnel activity to stdout. For production, consider:

- **PM2** for process management and log rotation
- **Prometheus** + **Grafana** for metrics
- **ELK Stack** for log aggregation

## License

MIT
