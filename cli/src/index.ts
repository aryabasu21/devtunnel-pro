#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { startTunnel } from './commands/start';
import { listTunnels } from './commands/list';
import { stopTunnel } from './commands/stop';
import { replayRequest } from './commands/replay';
import { showLogs } from './commands/logs';
import { configCommand } from './commands/config';
import { portCommand } from './commands/port';
import { getDeviceId } from './utils/device';
import { getConfig } from './utils/config';

const program = new Command();

// ASCII art logo
const logo = `
${chalk.cyan('╔═══════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('DevPortal')} - Share localhost instantly  ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════╝')}
`;

program
  .name('devportal')
  .description('Expose your localhost to the internet with a single command')
  .version('1.0.0')
  .hook('preAction', () => {
    console.log(logo);
  });

// Main command: devportal <port>
program
  .argument('[port]', 'Local port to expose', '3000')
  .option('-s, --subdomain <name>', 'Custom subdomain for your URL')
  .option('-p, --password <pass>', 'Password protect the tunnel')
  .option('--demo', 'Create a temporary link that expires in 2 hours')
  .option('--auth-header <header>', 'Add authorization header to requests')
  .option('--local', 'Run in local simulation mode (no server required)')
  .option('--forward <ports>', 'Port forwarding (format: remote:local, e.g., 8080:3000)')
  .action(async (port, options) => {
    if (port && !isNaN(parseInt(port))) {
      await startTunnel(parseInt(port), options);
    } else {
      program.help();
    }
  });

// Start command: devportal start <port> (alias for default)
program
  .command('start [port]')
  .description('Start a tunnel to expose your local port')
  .option('-s, --subdomain <name>', 'Custom subdomain for your URL')
  .option('-p, --password <pass>', 'Password protect the tunnel')
  .option('--demo', 'Create a temporary link that expires in 2 hours')
  .option('--auth-header <header>', 'Add authorization header to requests')
  .option('--local', 'Run in local simulation mode (no server required)')
  .option('--forward <ports>', 'Port forwarding (format: remote:local, e.g., 8080:3000)')
  .action(async (port = '3000', options) => {
    await startTunnel(parseInt(port), options);
  });

// List tunnels: devportal ls
program
  .command('ls')
  .alias('list')
  .description('List all active tunnels')
  .action(async () => {
    await listTunnels();
  });

// Stop tunnel: devportal stop <id>
program
  .command('stop [tunnelId]')
  .description('Stop a tunnel by ID')
  .option('-a, --all', 'Stop all active tunnels')
  .action(async (tunnelId, options) => {
    await stopTunnel(tunnelId, options);
  });

// Stop all tunnels: devportal stop-all (convenient alias)
program
  .command('stop-all')
  .description('Stop all active tunnels')
  .action(async () => {
    await stopTunnel(undefined, { all: true });
  });

// Replay request: devportal replay <requestId>
program
  .command('replay <requestId>')
  .description('Replay a captured request')
  .option('-H, --header <header>', 'Add or override a header')
  .option('-b, --body <body>', 'Override request body')
  .action(async (requestId, options) => {
    await replayRequest(requestId, options);
  });

// Stream logs: devportal logs <tunnelId>
program
  .command('logs <tunnelId>')
  .description('Stream live request logs from a tunnel')
  .action(async (tunnelId) => {
    await showLogs(tunnelId);
  });

// Config command
program
  .command('config [action] [value]')
  .description('View or update configuration')
  .action(async (action, value) => {
    await configCommand(action, value);
  });

// Port management command
program
  .command('port [action] [port]')
  .description('Manage ports (actions: check, scan, list)')
  .action(async (action, port) => {
    await portCommand(action, port ? parseInt(port) : undefined);
  });

// Device info command
program
  .command('whoami')
  .description('Show current device ID and dashboard URL')
  .action(() => {
    const deviceId = getDeviceId();
    const config = getConfig();
    console.log(chalk.gray('Device ID:'), chalk.cyan(deviceId));
    console.log(chalk.gray('Dashboard:'), chalk.underline(`${config.frontendUrl}/dashboard/${deviceId}`));
  });

program.parse();
