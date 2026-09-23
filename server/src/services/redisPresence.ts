import Redis from "ioredis";
import { randomUUID } from "crypto";

const redisUrl = process.env.REDIS_URL;
const requireRedis = process.env.REQUIRE_REDIS === "true";
const presenceTtlSeconds = 45;
const tunnelLimit = 3;
const tunnelSlotTtlSeconds = 24 * 60 * 60;

export const instanceId = process.env.INSTANCE_ID || randomUUID();
export const redisEnabled = Boolean(redisUrl);

const redis = redisUrl ? new Redis(redisUrl, { lazyConnect: true }) : null;

if (redis) {
  redis.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });
}

function presenceKey(tunnelId: string): string {
  return `devportal:tunnel:${tunnelId}:presence`;
}

function tunnelSlotKey(ip: string): string {
  return `devportal:limits:tunnels:${ip}`;
}

export async function checkRedisReadiness(): Promise<boolean> {
  if (!redis) return !requireRedis;

  try {
    if (redis.status === "wait") await redis.connect();
    await redis.ping();
    return true;
  } catch (error) {
    console.error("Redis readiness check failed:", error);
    return false;
  }
}

export async function sendRedisCommand(...args: string[]): Promise<
  boolean | number | string | (boolean | number | string)[]
> {
  if (!redis) throw new Error("Redis is not configured");
  if (redis.status === "wait") await redis.connect();
  return redis.sendCommand(
    new Redis.Command(args[0], args.slice(1)),
  ) as Promise<boolean | number | string | (boolean | number | string)[]>;
}

export async function registerPresence(input: {
  tunnelId: string;
  deviceId: string;
  name: string;
}): Promise<void> {
  if (!redis) {
    if (requireRedis) throw new Error("Redis is required but REDIS_URL is not configured");
    return;
  }

  if (redis.status === "wait") await redis.connect();
  await redis
    .multi()
    .hset(presenceKey(input.tunnelId), {
      tunnelId: input.tunnelId,
      deviceId: input.deviceId,
      name: input.name,
      instanceId,
      lastSeenAt: new Date().toISOString(),
    })
    .expire(presenceKey(input.tunnelId), presenceTtlSeconds)
    .exec();
}

export async function refreshPresence(tunnelId: string): Promise<void> {
  if (!redis) return;
  if (redis.status === "wait") await redis.connect();

  await redis
    .multi()
    .hset(presenceKey(tunnelId), {
      instanceId,
      lastSeenAt: new Date().toISOString(),
    })
    .expire(presenceKey(tunnelId), presenceTtlSeconds)
    .exec();
}

export async function removePresence(tunnelId: string): Promise<void> {
  if (!redis) return;
  if (redis.status === "wait") await redis.connect();
  await redis.del(presenceKey(tunnelId));
}

export async function reserveTunnelSlot(ip: string): Promise<boolean> {
  if (!redis) {
    if (requireRedis) throw new Error("Redis is required but REDIS_URL is not configured");
    return true;
  }

  if (redis.status === "wait") await redis.connect();
  const key = tunnelSlotKey(ip);
  const count = Number(await redis.incr(key));
  if (count === 1) await redis.expire(key, tunnelSlotTtlSeconds);

  if (count > tunnelLimit) {
    await redis.decr(key);
    return false;
  }

  return true;
}

export async function releaseTunnelSlot(ip: string): Promise<void> {
  if (!redis) return;
  if (redis.status === "wait") await redis.connect();

  const key = tunnelSlotKey(ip);
  const count = Number(await redis.decr(key));
  if (count <= 0) await redis.del(key);
}

export function startPresenceHeartbeat(
  getTunnelIds: () => string[],
): NodeJS.Timeout {
  return setInterval(() => {
    void Promise.all(
      getTunnelIds().map((tunnelId) =>
        refreshPresence(tunnelId).catch((error) =>
          console.error(`Failed to refresh Redis presence for ${tunnelId}:`, error),
        ),
      ),
    );
  }, 15_000);
}

export async function closeRedis(): Promise<void> {
  if (redis && redis.status !== "end") await redis.quit();
}
