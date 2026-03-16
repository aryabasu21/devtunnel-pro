import chalk from 'chalk';
import ora from 'ora';

interface ReplayOptions {
  header?: string;
  body?: string;
}

export async function replayRequest(requestId: string, options: ReplayOptions): Promise<void> {
  const spinner = ora(`Replaying request ${requestId}...`).start();

  // Simulate replay delay
  await sleep(800);

  // Mock request data
  const mockRequest = {
    id: requestId,
    method: 'POST',
    path: '/api/webhook',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Event': 'payment.completed',
    },
    body: { event: 'payment.completed', amount: 99.99 },
  };

  spinner.succeed(chalk.green('Request replayed'));
  console.log();

  // Display request info
  console.log(chalk.gray('Request:'));
  console.log(chalk.blue(`  ${mockRequest.method}`), chalk.white(mockRequest.path));
  console.log();

  if (options.header) {
    console.log(chalk.gray('Modified headers:'));
    console.log(chalk.yellow(`  ${options.header}`));
    console.log();
  }

  if (options.body) {
    console.log(chalk.gray('Modified body:'));
    console.log(chalk.yellow(`  ${options.body}`));
    console.log();
  }

  // Simulate response
  const status = 200;
  const duration = Math.floor(Math.random() * 100) + 30;

  console.log(chalk.gray('Response:'));
  console.log(chalk.green(`  ${status} OK`), chalk.gray(`(${duration}ms)`));
  console.log();
  console.log(chalk.gray('Body:'));
  console.log(chalk.white('  { "success": true, "message": "Webhook processed" }'));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
