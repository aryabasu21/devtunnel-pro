import chalk from 'chalk';
import { getTunnels } from '../utils/tunnels';
import * as http from 'http';

interface PortInfo {
  port: number;
  status: 'available' | 'occupied' | 'tunneled';
  tunnelId?: string;
  tunnelName?: string;
}

export async function portCommand(action?: string, port?: number): Promise<void> {
  if (!action) {
    await showPortUsage();
    return;
  }

  switch (action.toLowerCase()) {
    case 'check':
      if (!port) {
        console.log(chalk.red('Please specify a port to check'));
        console.log(chalk.gray('Usage: devportal-tunnel port check <port>'));
        return;
      }
      await checkPort(port);
      break;

    case 'scan':
      const startPort = port || 3000;
      await scanPorts(startPort, startPort + 9);
      break;

    case 'list':
      await showPortUsage();
      break;

    default:
      console.log(chalk.red(`Unknown port action: ${action}`));
      console.log(chalk.gray('Available actions: check, scan, list'));
  }
}

async function showPortUsage(): Promise<void> {
  const tunnels = getTunnels().filter(t => t.status === 'live');

  console.log(chalk.bold('Port Usage'));
  console.log();

  if (tunnels.length === 0) {
    console.log(chalk.yellow('No ports currently tunneled'));
    console.log(chalk.gray('Start a tunnel to see port usage'));
    return;
  }

  // Header
  const header = [
    chalk.gray('Port'.padEnd(8)),
    chalk.gray('Status'.padEnd(12)),
    chalk.gray('Tunnel ID'.padEnd(15)),
    chalk.gray('Tunnel Name'),
  ].join(' ');
  console.log(header);
  console.log(chalk.gray('─'.repeat(70)));

  // Show tunneled ports
  for (const tunnel of tunnels) {
    const row = [
      chalk.white(tunnel.localPort.toString().padEnd(8)),
      chalk.green('TUNNELED'.padEnd(12)),
      chalk.cyan(tunnel.id.padEnd(15)),
      chalk.white(tunnel.name),
    ].join(' ');
    console.log(row);
  }

  console.log();
  console.log(chalk.gray(`${tunnels.length} port(s) currently tunneled`));
  console.log();
  console.log(chalk.gray('Commands:'));
  console.log(chalk.gray('  devportal-tunnel port check <port>  - Check if a port is available'));
  console.log(chalk.gray('  devportal-tunnel port scan [start]  - Scan for available ports'));
}

async function checkPort(port: number): Promise<void> {
  console.log(chalk.gray(`Checking port ${port}...`));

  // Check if port is tunneled
  const tunnels = getTunnels().filter(t => t.status === 'live' && t.localPort === port);

  if (tunnels.length > 0) {
    const tunnel = tunnels[0];
    console.log(chalk.yellow(`Port ${port} is currently tunneled`));
    console.log(chalk.gray(`  Tunnel ID: ${tunnel.id}`));
    console.log(chalk.gray(`  Tunnel Name: ${tunnel.name}`));
    console.log(chalk.gray(`  Public URL: ${tunnel.url}`));
    return;
  }

  // Check if port is occupied
  const isOccupied = await isPortOccupied(port);

  if (isOccupied) {
    console.log(chalk.green(`✓ Port ${port} is available (server running)`));
    console.log(chalk.gray('  Ready to be tunneled'));
  } else {
    console.log(chalk.red(`✗ Port ${port} is not available (no server running)`));
    console.log(chalk.gray('  Start your local server first'));
  }
}

async function scanPorts(startPort: number, endPort: number): Promise<void> {
  console.log(chalk.gray(`Scanning ports ${startPort}-${endPort}...`));
  console.log();

  const results: PortInfo[] = [];
  const tunnels = getTunnels().filter(t => t.status === 'live');

  for (let port = startPort; port <= endPort; port++) {
    const tunnel = tunnels.find(t => t.localPort === port);

    if (tunnel) {
      results.push({
        port,
        status: 'tunneled',
        tunnelId: tunnel.id,
        tunnelName: tunnel.name,
      });
    } else {
      const isOccupied = await isPortOccupied(port);
      results.push({
        port,
        status: isOccupied ? 'occupied' : 'available',
      });
    }
  }

  // Header
  const header = [
    chalk.gray('Port'.padEnd(8)),
    chalk.gray('Status'.padEnd(12)),
    chalk.gray('Details'),
  ].join(' ');
  console.log(header);
  console.log(chalk.gray('─'.repeat(60)));

  // Results
  for (const result of results) {
    const statusColor =
      result.status === 'available' ? chalk.red('AVAILABLE') :
      result.status === 'occupied' ? chalk.green('OCCUPIED') :
      chalk.yellow('TUNNELED');

    const details =
      result.status === 'tunneled' ? `Tunnel: ${result.tunnelName}` :
      result.status === 'occupied' ? 'Server running' :
      'No server';

    const row = [
      chalk.white(result.port.toString().padEnd(8)),
      statusColor.padEnd(12),
      chalk.gray(details),
    ].join(' ');
    console.log(row);
  }

  console.log();
  const availableCount = results.filter(r => r.status === 'occupied').length;
  const tunneledCount = results.filter(r => r.status === 'tunneled').length;

  console.log(chalk.gray('Summary:'));
  console.log(chalk.gray(`  ${availableCount} port(s) available for tunneling`));
  if (tunneledCount > 0) {
    console.log(chalk.gray(`  ${tunneledCount} port(s) already tunneled`));
  }
}

async function isPortOccupied(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request({ host: 'localhost', port, timeout: 1000 }, () => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
}