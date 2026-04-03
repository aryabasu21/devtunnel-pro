import chalk from "chalk";
import { getConfig, setServerUrl } from "../utils/config";

export async function configCommand(
  action?: string,
  value?: string,
): Promise<void> {
  if (!action) {
    // Show current config
    const config = getConfig();
    console.log(chalk.bold("Current Configuration"));
    console.log();
    console.log(chalk.gray("Server URL:    "), chalk.white(config.serverUrl));
    console.log(chalk.gray("WebSocket URL: "), chalk.white(config.wsUrl));
    console.log();
    console.log(chalk.gray("Config file: ~/.devportal/config.json"));
    return;
  }

  switch (action) {
    case "server":
      if (!value) {
        console.log(chalk.red("Please provide a server URL"));
        console.log(chalk.gray("Usage: devportal config server <url>"));
        return;
      }
      setServerUrl(value);
      console.log(chalk.green("Server URL updated"));
      console.log(chalk.gray("Server:    "), chalk.white(value));
      break;

    case "reset":
      setServerUrl("https://devportal.live");
      console.log(chalk.green("Config reset to defaults"));
      break;

    default:
      console.log(chalk.red(`Unknown config action: ${action}`));
      console.log(chalk.gray("Available actions: server, reset"));
  }
}
