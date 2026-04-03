# DevPortal CLI

Expose your localhost to the internet with a single command.

## Installation

### From npm (after publishing)

```bash
npm install -g devportal
```

### From source

```bash
git clone <repo>
cd cli
npm install
npm run build
npm link
```

## Quick Start

```bash
# Expose port 3000
devportal 3000

# With custom subdomain
devportal 3000 --subdomain my-api

# Password protected
devportal 3000 --password secret123

# Temporary demo link (expires in 2 hours)
devportal 3000 --demo

# Run in local simulation mode (no server needed)
devportal 3000 --local
```

## Commands

### Start a tunnel

```bash
devportal <port> [options]

Options:
  -s, --subdomain <name>    Custom subdomain for your URL
  -p, --password <pass>     Password protect the tunnel
  --demo                    Create a temporary link (2 hours)
  --auth-header <header>    Add authorization header to forwarded requests
  --local                   Run in simulation mode (no server required)
```

### List active tunnels

```bash
devportal ls
```

### Stop a tunnel

```bash
# Stop specific tunnel
devportal stop <tunnel-id>

# Stop all tunnels
devportal stop --all
```

### Replay requests

```bash
# Replay a captured request
devportal replay <request-id>

# With modified headers
devportal replay <request-id> --header "X-Debug: true"

# With modified body
devportal replay <request-id> --body '{"test": true}'
```

### Stream logs

```bash
devportal logs <tunnel-id>
```

### Configuration

```bash
# View current config
devportal config

# Set server URL (for self-hosted)
devportal config server https://your-server.com

# Reset to defaults
devportal config reset
```

### Device info

```bash
devportal whoami
```

## Configuration

DevPortal stores configuration in `~/.devportal/`:

```
~/.devportal/
├── config.json     # Server URL, WebSocket URL
├── device.json     # Unique device ID
└── tunnels.json    # Active tunnel information
```

### Self-Hosted Server

To use your own DevPortal server:

```bash
# Set your server URL
devportal config server https://tunnel.your-domain.com

# Now tunnels will use your server
devportal 3000
```

## How It Works

1. **CLI connects** to the DevPortal server via WebSocket
2. **Server assigns** a public URL (e.g., `https://my-app.devportal.live`)
3. **Requests arrive** at the public URL
4. **Server forwards** requests through the WebSocket to CLI
5. **CLI proxies** requests to your local server
6. **Response travels** back through the tunnel

```
Internet Request
      │
      ▼
[DevPortal Server] ◄──WSS──► [CLI Client] ──► [localhost:3000]
      │                            │
      └──────── Response ◄─────────┘
```

## Publishing to npm

1. **Update package.json** with your details:

```json
{
  "name": "devportal",
  "author": "Your Name",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/devportal"
  }
}
```

2. **Login and publish**:

```bash
npm login
npm publish
```

3. **For scoped package** (if name is taken):

```json
{
  "name": "@yourusername/devportal"
}
```

```bash
npm publish --access public
```

## Development

```bash
# Install dependencies
npm install

# Run in development
npm run dev 3000

# Build
npm run build

# Link globally for testing
npm link
```

## License

MIT
