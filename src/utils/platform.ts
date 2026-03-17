// Platform detection utility
export const detectPlatform = (): 'windows' | 'mac' | 'linux' => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';

  if (platform.includes('win') || userAgent.includes('windows')) {
    return 'windows';
  }

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac';
  }

  return 'linux'; // Default to linux for unix-like systems
};

// Platform-specific install commands
export const getInstallCommand = (platform: 'windows' | 'mac' | 'linux'): string => {
  switch (platform) {
    case 'windows':
      return 'npm install -g devportal-tunnel';
    case 'mac':
      return 'npm install -g devportal-tunnel';
    case 'linux':
      return 'npm install -g devportal-tunnel';
    default:
      return 'npm install -g devportal-tunnel';
  }
};

// Platform-specific start command
export const getStartCommand = (platform: 'windows' | 'mac' | 'linux'): string => {
  switch (platform) {
    case 'windows':
      return 'npx devportal-tunnel start 3000';
    case 'mac':
      return 'npx devportal-tunnel start 3000';
    case 'linux':
      return 'npx devportal-tunnel start 3000';
    default:
      return 'npx devportal-tunnel start 3000';
  }
};

// Platform display names
export const getPlatformName = (platform: 'windows' | 'mac' | 'linux'): string => {
  switch (platform) {
    case 'windows':
      return 'Windows';
    case 'mac':
      return 'macOS';
    case 'linux':
      return 'Linux';
    default:
      return 'Unix';
  }
};