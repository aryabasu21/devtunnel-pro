import chalk from 'chalk';
import { getTunnel } from '../utils/tunnels';

export async function showLogs(tunnelId: string): Promise<void> {
  const tunnel = getTunnel(tunnelId);

  if (!tunnel) {
    console.log(chalk.red(`Tunnel not found: ${tunnelId}`));
    return;
  }

  if (tunnel.status !== 'live') {
    console.log(chalk.yellow(`Tunnel ${tunnel.name} is not active`));
    return;
  }

  console.log(chalk.gray(`Streaming logs for ${tunnel.name}...`));
  console.log(chalk.gray(`URL: ${tunnel.url}`));
  console.log(chalk.gray('Press Ctrl+C to stop'));
  console.log();
  console.log(chalk.gray('─'.repeat(70)));
  console.log();

  // Simulate log streaming
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const paths = ['/api/users', '/api/auth', '/api/data', '/webhook', '/health'];
  const statuses = [200, 200, 200, 201, 400, 401, 404];

  const logEntry = () => {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const duration = Math.floor(Math.random() * 200) + 20;
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    const methodColor = {
      GET: chalk.green,
      POST: chalk.blue,
      PUT: chalk.yellow,
      DELETE: chalk.red,
    }[method] || chalk.white;

    const statusColor = status < 300 ? chalk.green : status < 400 ? chalk.yellow : chalk.red;

    const timestamp = new Date().toISOString();
    console.log(
      chalk.gray(timestamp),
      chalk.gray(ip.padEnd(15)),
      methodColor(method.padEnd(6)),
      chalk.white(path.padEnd(20)),
      statusColor(status.toString()),
      chalk.gray(`${duration}ms`)
    );

    const nextInterval = Math.floor(Math.random() * 5000) + 1000;
    setTimeout(logEntry, nextInterval);
  };

  // Handle shutdown
  process.on('SIGINT', () => {
    console.log();
    console.log(chalk.gray('Log streaming stopped'));
    process.exit(0);
  });

  // Start logging
  logEntry();

  // Keep process alive
  await new Promise(() => {});
}
