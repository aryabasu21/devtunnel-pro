// Memorable subdomain generation inspired by tunnl.gg
// Format: adjective-noun-xxxxxxxx (e.g., happy-tiger-a1b2c3d4)

const adjectives = [
  "happy", "sunny", "swift", "calm", "bold", "bright", "cool", "warm",
  "quick", "clever", "brave", "gentle", "kind", "proud", "wise", "keen",
  "smart", "sharp", "clear", "clean", "fresh", "pure", "quiet", "loud",
  "soft", "hard", "light", "dark", "smooth", "rough", "deep", "shallow"
];

const nouns = [
  "tiger", "eagle", "wolf", "bear", "hawk", "fox", "deer", "owl",
  "river", "mountain", "forest", "ocean", "canyon", "river", "meadow", "summit",
  "valley", "storm", "cloud", "wave", "flame", "stone", "crystal", "shadow",
  "thunder", "lightning", "wind", "rain", "snow", "ice", "fire", "earth"
];

/**
 * Generate a memorable subdomain in the format: adjective-noun-xxxxxxxx
 * @param customName Optional custom prefix (will be validated)
 * @returns A memorable subdomain string
 */
export function generateSubdomain(customName?: string): string {
  if (customName) {
    // Validate custom name
    const sanitized = sanitizeSubdomain(customName);
    if (sanitized && isValidSubdomain(sanitized)) {
      return sanitized;
    }
    // If custom name is invalid, fall back to generated name
  }

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');

  return `${adjective}-${noun}-${suffix}`;
}

/**
 * Validate and sanitize a subdomain
 * @param subdomain The subdomain to validate
 * @returns Sanitized subdomain or null if invalid
 */
export function sanitizeSubdomain(subdomain: string): string | null {
  if (!subdomain) return null;

  // Convert to lowercase and replace invalid characters
  let sanitized = subdomain
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')  // Replace invalid chars with hyphens
    .replace(/-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens

  // Ensure it's not too long
  if (sanitized.length > 63) {
    sanitized = sanitized.substring(0, 63);
  }

  return sanitized;
}

/**
 * Check if a subdomain is valid according to DNS rules
 * @param subdomain The subdomain to validate
 * @returns True if valid
 */
export function isValidSubdomain(subdomain: string): boolean {
  if (!subdomain) return false;

  // Basic DNS subdomain validation
  const dnsRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

  return (
    subdomain.length >= 1 &&
    subdomain.length <= 63 &&
    dnsRegex.test(subdomain) &&
    !subdomain.startsWith('-') &&
    !subdomain.endsWith('-') &&
    !isReservedSubdomain(subdomain)
  );
}

/**
 * Check if a subdomain is reserved and cannot be used
 * @param subdomain The subdomain to check
 * @returns True if reserved
 */
function isReservedSubdomain(subdomain: string): boolean {
  const reserved = [
    'www', 'api', 'admin', 'mail', 'ftp', 'localhost', 'test', 'dev',
    'staging', 'prod', 'production', 'app', 'web', 'site', 'blog',
    'forum', 'shop', 'store', 'support', 'help', 'docs', 'cdn',
    'static', 'assets', 'media', 'images', 'js', 'css', 'fonts',
    'tunnel', 'proxy', 'gateway', 'server', 'client', 'dashboard',
    'panel', 'control', 'manage', 'config', 'settings'
  ];

  return reserved.includes(subdomain.toLowerCase());
}

/**
 * Get adjective and noun lists for UI purposes
 */
export function getWordLists() {
  return { adjectives: [...adjectives], nouns: [...nouns] };
}