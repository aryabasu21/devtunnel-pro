import * as fs from 'fs';
import * as path from 'path';
import { getConfigDir } from './device';

export interface TunnelInfo {
  id: string;
  name: string;
  url: string;
  localPort: number;
  status: 'live' | 'stopped';
  createdAt: string;
  pid?: number;
}

const TUNNELS_FILE = path.join(getConfigDir(), 'tunnels.json');

export function getTunnels(): TunnelInfo[] {
  if (!fs.existsSync(TUNNELS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(TUNNELS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveTunnels(tunnels: TunnelInfo[]): void {
  fs.writeFileSync(TUNNELS_FILE, JSON.stringify(tunnels, null, 2));
}

export function addTunnel(tunnel: TunnelInfo): void {
  const tunnels = getTunnels();
  tunnels.push(tunnel);
  saveTunnels(tunnels);
}

export function removeTunnel(id: string): void {
  const tunnels = getTunnels().filter((t) => t.id !== id);
  saveTunnels(tunnels);
}

export function updateTunnel(id: string, updates: Partial<TunnelInfo>): void {
  const tunnels = getTunnels().map((t) =>
    t.id === id ? { ...t, ...updates } : t
  );
  saveTunnels(tunnels);
}

export function getTunnel(id: string): TunnelInfo | undefined {
  return getTunnels().find((t) => t.id === id || t.name === id);
}

// Generate random tunnel name
const adjectives = ['purple', 'cosmic', 'hidden', 'crystal', 'silent', 'golden', 'frozen', 'blazing', 'lunar', 'neon'];
const nouns = ['horizon', 'lake', 'forest', 'ocean', 'canyon', 'river', 'meadow', 'summit', 'valley', 'storm'];

export function generateTunnelName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}-${noun}-${num}`;
}
