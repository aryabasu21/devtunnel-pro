import chalk from 'chalk';
import ora from 'ora';
import { getTunnels, updateTunnel, saveTunnels } from '../utils/tunnels';

interface StopOptions {
  all?: boolean;
}

export async function stopTunnel(tunnelId: string | undefined, options: StopOptions): Promise<void> {
  const tunnels = getTunnels();
  const liveTunnels = tunnels.filter((t) => t.status === 'live');

  if (liveTunnels.length === 0) {
    console.log(chalk.yellow('No active tunnels to stop'));
    return;
  }

  if (options.all) {
    const spinner = ora('Stopping all tunnels...').start();

    // Mark all as stopped
    const updated = tunnels.map((t) => ({ ...t, status: 'stopped' as const }));
    saveTunnels(updated);

    await sleep(500);
    spinner.succeed(chalk.green(`Stopped ${liveTunnels.length} tunnel(s)`));
    return;
  }

  if (!tunnelId) {
    console.log(chalk.red('Please specify a tunnel ID or use --all'));
    console.log(chalk.gray('Usage: devportal stop <tunnel-id>'));
    console.log(chalk.gray('       devportal stop --all'));
    console.log();
    console.log(chalk.gray('Active tunnels:'));
    for (const t of liveTunnels) {
      console.log(chalk.gray(`  ${t.id} (${t.name})`));
    }
    return;
  }

  // Find tunnel by ID or name
  const tunnel = liveTunnels.find((t) => t.id === tunnelId || t.name === tunnelId);

  if (!tunnel) {
    console.log(chalk.red(`Tunnel not found: ${tunnelId}`));
    console.log(chalk.gray('Active tunnels:'));
    for (const t of liveTunnels) {
      console.log(chalk.gray(`  ${t.id} (${t.name})`));
    }
    return;
  }

  const spinner = ora(`Stopping tunnel ${tunnel.name}...`).start();

  updateTunnel(tunnel.id, { status: 'stopped' });

  await sleep(500);
  spinner.succeed(chalk.green(`Tunnel ${tunnel.name} stopped`));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
