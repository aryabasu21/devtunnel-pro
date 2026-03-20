import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Rate limiting inspired by tunnl.gg's approach

// API rate limits
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many API requests",
    message:
      "Please slow down. You can make up to 100 requests per 15 minutes.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Tunnel creation rate limits
export const tunnelLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Allow 10 tunnel creations per 10 minutes per IP
  message: {
    error: "Too many tunnel requests",
    message:
      "You can create up to 10 tunnels per 10 minutes. Please wait before creating more.",
    retryAfter: "10 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use IP address for rate limiting
    return req.ip || req.socket.remoteAddress || "unknown";
  },
});

// Support form rate limits
export const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 support tickets per hour per IP
  message: {
    error: "Too many support requests",
    message:
      "You can submit up to 5 support tickets per hour. Please wait before submitting more.",
    retryAfter: "1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for abuse protection
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    error: "Rate limit exceeded",
    message: "Too many requests. Please slow down.",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory store for tracking tunnel counts per IP
class TunnelTracker {
  private tunnelCounts = new Map<
    string,
    { count: number; lastUpdate: number }
  >();
  private readonly maxTunnelsPerIP = 3;
  private readonly cleanupInterval = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Clean up old entries periodically
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  canCreateTunnel(ip: string): boolean {
    const now = Date.now();
    const entry = this.tunnelCounts.get(ip);

    if (!entry) {
      return true; // First tunnel for this IP
    }

    return entry.count < this.maxTunnelsPerIP;
  }

  addTunnel(ip: string): void {
    const now = Date.now();
    const entry = this.tunnelCounts.get(ip) || { count: 0, lastUpdate: now };

    entry.count++;
    entry.lastUpdate = now;

    this.tunnelCounts.set(ip, entry);
  }

  removeTunnel(ip: string): void {
    const entry = this.tunnelCounts.get(ip);
    if (entry && entry.count > 0) {
      entry.count--;
      entry.lastUpdate = Date.now();

      if (entry.count === 0) {
        this.tunnelCounts.delete(ip);
      } else {
        this.tunnelCounts.set(ip, entry);
      }
    }
  }

  getTunnelCount(ip: string): number {
    return this.tunnelCounts.get(ip)?.count || 0;
  }

  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000; // 24 hours

    for (const [ip, entry] of this.tunnelCounts.entries()) {
      if (entry.lastUpdate < cutoff) {
        this.tunnelCounts.delete(ip);
      }
    }
  }

  getStats() {
    return {
      totalIPs: this.tunnelCounts.size,
      tunnelCounts: Object.fromEntries(this.tunnelCounts),
    };
  }
}

// Global tunnel tracker instance
export const tunnelTracker = new TunnelTracker();

// Middleware to check tunnel limits
export const checkTunnelLimit = (req: Request, res: Response, next: any) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";

  if (!tunnelTracker.canCreateTunnel(ip)) {
    return res.status(429).json({
      error: "Tunnel limit exceeded",
      message: `You can only have ${3} active tunnels per IP address. Please close some tunnels before creating new ones.`,
      currentCount: tunnelTracker.getTunnelCount(ip),
      maxCount: 3,
    });
  }

  next();
};
