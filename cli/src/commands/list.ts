import chalk from 'chalk';
import { getTunnels } from '../utils/tunnels';

export async function listTunnels(): Promise<void> {
  const tunnels = getTunnels().filter((t) => t.status === 'live');

  if (tunnels.length === 0) {
    console.log(chalk.yellow('No active tunnels'));
    console.log(chalk.gray('Start one with: devportal <port>'));
    return;
  }

  console.log(chalk.bold('Active Tunnels'));
  console.log();

  // Table header
  const header = [
    chalk.gray('ID'.padEnd(15)),
    chalk.gray('Name'.padEnd(22)),
    chalk.gray('Local Port'.padEnd(12)),
    chalk.gray('URL'),
  ].join(' ');
  console.log(header);
  console.log(chalk.gray('─'.repeat(85)));

  // Table rows
  for (const tunnel of tunnels) {
    const row = [
      chalk.white(tunnel.id.padEnd(15)),
      chalk.cyan(tunnel.name.padEnd(22)),
      chalk.white(tunnel.localPort.toString().padEnd(12)),
      chalk.underline(tunnel.url),
    ].join(' ');
    console.log(row);
  }

  console.log();
  console.log(chalk.gray(`${tunnels.length} tunnel(s) active`));
}
