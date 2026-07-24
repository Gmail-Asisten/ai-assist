// ============================================================
// Redis Client Configuration
// ============================================================

import Redis from "ioredis";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return "redis://localhost:6379";
};

// Singleton instance to prevent multiple connections during hot-reloads in dev
declare global {
  var redisGlobal: Redis | undefined;
}

export const redis = globalThis.redisGlobal ?? new Redis(getRedisUrl(), {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

if (process.env.NODE_ENV !== "production") {
  globalThis.redisGlobal = redis;
}

// Error handling
redis.on("error", (err) => {
  console.warn("Redis Connection Error:", err.message);
});
