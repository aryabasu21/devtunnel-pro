import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';

const CONFIG_DIR = path.join(os.homedir(), '.devportal');
const DEVICE_FILE = path.join(CONFIG_DIR, 'device.json');

interface DeviceConfig {
  deviceId: string;
  createdAt: string;
}

export function getDeviceId(): string {
  ensureConfigDir();

  if (fs.existsSync(DEVICE_FILE)) {
    try {
      const config: DeviceConfig = JSON.parse(fs.readFileSync(DEVICE_FILE, 'utf-8'));
      return config.deviceId;
    } catch {
      // Corrupted file, regenerate
    }
  }

  // Generate new device ID
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  const deviceId = `dev_${timestamp}_${random}`;

  const config: DeviceConfig = {
    deviceId,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(DEVICE_FILE, JSON.stringify(config, null, 2));
  return deviceId;
}

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfigDir(): string {
  ensureConfigDir();
  return CONFIG_DIR;
}
