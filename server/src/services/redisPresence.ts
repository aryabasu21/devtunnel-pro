import Redis from "ioredis";
import { randomUUID } from "crypto";

const redisUrl = process.env.REDIS_URL;
const requireRedis = process.env.REQUIRE_REDIS === "true";
const presenceTtlSeconds = 45;

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
