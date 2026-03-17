import chalk from 'chalk';
import ora from 'ora';
import * as http from 'http';
import { TunnelClient, TunnelInfo } from '../utils/tunnelClient';
import { addTunnel, TunnelInfo as StoredTunnel } from '../utils/tunnels';
import { getDeviceId } from '../utils/device';
import { getConfig } from '../utils/config';

// @ts-ignore - qrcode-terminal doesn't have types
import * as qrcode from 'qrcode-terminal';

interface StartOptions {
  subdomain?: string;
  password?: string;
  demo?: boolean;
  qr?: boolean;
  authHeader?: string;
  local?: boolean; // Use local simulation mode
}

export async function startTunnel(port: number, options: StartOptions): Promise<void> {
  const spinner = ora('Connecting to DevPortal...').start();

  // Check if local server is running
  const isPortOpen = await checkPort(port);
  if (!isPortOpen) {
    spinner.warn(chalk.yellow(`No server detected on port ${port}`));
    console.log(chalk.gray(`  Make sure your local server is running first`));
    console.log(chalk.gray(`  Example: npm run dev`));
    console.log();
  }

  const config = getConfig();
  const deviceId = getDeviceId();

  // Use local simulation if no server configured or --local flag
  if (options.local || !config.serverUrl) {
    spinner.text = 'Starting local simulation mode...';
    await startSimulatedTunnel(port, options, spinner);
    return;
  }

  // Connect to real server
  try {
    const client = new TunnelClient({
      serverUrl: config.serverUrl,
      wsUrl: config.wsUrl,
      deviceId,
      localPort: port,
      subdomain: options.subdomain,
      password: options.password,
      demo: options.demo,
      authHeader: options.authHeader,
    });

    // Handle events
    client.on('request', ({ method, path }) => {
      const methodColor = getMethodColor(method);
      const timestamp = new Date().toLocaleTimeString();
      process.stdout.write(chalk.gray(timestamp) + ' ');
      process.stdout.write(methodColor(method.padEnd(7)));
      process.stdout.write(chalk.white(path) + ' ');
    });

    client.on('response', ({ status }) => {
      const statusColor = status < 300 ? chalk.green : status < 400 ? chalk.yellow : chalk.red;
      console.log(statusColor(status.toString()));
    });

    client.on('error', (error) => {
      console.error(chalk.red('Error:'), error.message);
    });

    client.on('disconnected', () => {
      console.log(chalk.yellow('\nConnection lost. Reconnecting...'));
    });

    spinner.text = 'Establishing tunnel...';

    const tunnelInfo = await client.connect();

    spinner.succeed(chalk.green('Tunnel established'));
    console.log();

    // Display tunnel info
    console.log(chalk.gray('  Local server: '), chalk.white(`http://localhost:${port}`));
    console.log(chalk.gray('  Public URL:   '), chalk.cyan.underline(tunnelInfo.url));
    console.log(chalk.gray('  Tunnel ID:    '), chalk.white(tunnelInfo.id));

    if (options.password) {
      console.log(chalk.gray('  Password:     '), chalk.yellow('Protected'));
    }

    if (tunnelInfo.expiresAt) {
      const expiresIn = Math.round((new Date(tunnelInfo.expiresAt).getTime() - Date.now()) / 60000);
      console.log(chalk.gray('  Expires in:   '), chalk.yellow(`${expiresIn} minutes`));
    }

    console.log();
    console.log(chalk.gray('  Dashboard:    '), chalk.underline(`${config.frontendUrl}/dashboard/${deviceId}`));
    console.log();

    // Show QR code if requested
    if (options.qr) {
      console.log(chalk.gray('  Scan to open on mobile:'));
      console.log();
      qrcode.generate(tunnelInfo.url, { small: true });
      console.log();
    }

    // Save tunnel info locally
    const storedTunnel: StoredTunnel = {
      id: tunnelInfo.id,
      name: tunnelInfo.name,
      url: tunnelInfo.url,
      localPort: port,
      status: 'live',
      createdAt: new Date().toISOString(),
      pid: process.pid,
    };
    addTunnel(storedTunnel);

    console.log(chalk.gray('  Forwarding requests... (Press Ctrl+C to stop)'));
    console.log();

    // Handle shutdown
    process.on('SIGINT', () => {
      console.log();
      console.log(chalk.yellow('Stopping tunnel...'));
      client.stop();
      process.exit(0);
    });

    // Keep process alive
    await new Promise(() => {});

  } catch (error: any) {
    spinner.fail(chalk.red('Failed to connect'));
    console.log();
    console.log(chalk.red('Error:'), error.message);
    console.log();
    console.log(chalk.gray('Troubleshooting:'));
    console.log(chalk.gray('  1. Check your internet connection'));
    console.log(chalk.gray('  2. Verify the server URL in ~/.devportal/config.json'));
    console.log(chalk.gray('  3. Try running with --local for simulation mode'));
    process.exit(1);
  }
}

async function startSimulatedTunnel(port: number, options: StartOptions, spinner: ora.Ora): Promise<void> {
  // Simulate connection delay
  await sleep(1000);

  const name = options.subdomain || generateTunnelName();
  const tunnelId = `t-${Date.now().toString(36)}`;
  const url = `https://${name}.devportal.local`;

  spinner.succeed(chalk.green('Tunnel established (simulation mode)'));
  console.log();

  console.log(chalk.gray('  Local server: '), chalk.white(`http://localhost:${port}`));
  console.log(chalk.gray('  Public URL:   '), chalk.cyan.underline(url));
  console.log(chalk.gray('  Tunnel ID:    '), chalk.white(tunnelId));
  console.log();
  console.log(chalk.yellow('  ⚠ Running in simulation mode'));
  console.log(chalk.gray('  Configure server URL to enable real tunneling'));
  console.log();

  if (options.qr) {
    qrcode.generate(url, { small: true });
    console.log();
  }

  console.log(chalk.gray('  Simulating requests... (Press Ctrl+C to stop)'));
  console.log();

  simulateRequests(port);

  process.on('SIGINT', () => {
    console.log();
    console.log(chalk.yellow('Tunnel stopped'));
    process.exit(0);
  });

  await new Promise(() => {});
}

function simulateRequests(port: number): void {
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const paths = ['/api/users', '/api/auth', '/api/data', '/webhook', '/health'];
  const statuses = [200, 200, 200, 201, 400, 401, 404];

  const logRequest = () => {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const duration = Math.floor(Math.random() * 200) + 20;

    const timestamp = new Date().toLocaleTimeString();
    const methodColor = getMethodColor(method);
    const statusColor = status < 300 ? chalk.green : status < 400 ? chalk.yellow : chalk.red;

    console.log(
      chalk.gray(timestamp),
      methodColor(method.padEnd(7)),
      chalk.white(path.padEnd(20)),
      statusColor(status.toString()),
      chalk.gray(`${duration}ms`)
    );

    const nextInterval = Math.floor(Math.random() * 6000) + 2000;
    setTimeout(logRequest, nextInterval);
  };

  setTimeout(logRequest, 2000);
}

function getMethodColor(method: string): chalk.Chalk {
  const colors: Record<string, chalk.Chalk> = {
    GET: chalk.green,
    POST: chalk.blue,
    PUT: chalk.yellow,
    DELETE: chalk.red,
    PATCH: chalk.magenta,
  };
  return colors[method] || chalk.white;
}

async function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request({ host: 'localhost', port, timeout: 1000 }, () => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const adjectives = ['purple', 'cosmic', 'hidden', 'crystal', 'silent', 'golden', 'frozen', 'blazing', 'lunar', 'neon'];
const nouns = ['horizon', 'lake', 'forest', 'ocean', 'canyon', 'river', 'meadow', 'summit', 'valley', 'storm'];

function generateTunnelName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}-${noun}-${num}`;
}
