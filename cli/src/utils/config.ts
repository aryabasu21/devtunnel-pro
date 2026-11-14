import * as fs from "fs";
import * as path from "path";
import { getConfigDir } from "./device";

export interface Config {
  serverUrl: string;
  wsUrl: string;
  frontendUrl: string;
}

const CONFIG_FILE = path.join(getConfigDir(), "config.json");

const DEFAULT_CONFIG: Config = {
  serverUrl: "https://tunnl.stylnode.in",
  wsUrl: "wss://tunnl.stylnode.in/ws",
  frontendUrl: "https://devportal.stylnode.in",
};

export function getConfig(): Config {
  if (!fs.existsSync(CONFIG_FILE)) {
    saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    return { ...DEFAULT_CONFIG, ...config };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Partial<Config>): void {
  const currentConfig = fs.existsSync(CONFIG_FILE)
    ? JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))
    : {};

  const newConfig = { ...currentConfig, ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
}

export function setServerUrl(url: string): void {
  const normalizedUrl = url.replace(/\/+$/, "");
  const parsedUrl = new URL(normalizedUrl);

  const wsProtocol = parsedUrl.protocol === "https:" ? "wss:" : "ws:";

  const wsUrl = `${wsProtocol}//${parsedUrl.host}/ws`;

  saveConfig({
    serverUrl: normalizedUrl,
    wsUrl,
  });
}
