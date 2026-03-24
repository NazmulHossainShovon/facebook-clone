import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Check connection on startup and log result
(async () => {
  try {
    await redis.ping();
    console.log("Successfully connected to Upstash Redis");
  } catch (error) {
    console.error("Failed to connect to Upstash Redis:", error);
  }
})();

export async function getJson(key: string) {
  const raw = await redis.get(key);
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error("JSON parse error in getJson:", err);
      return null;
    }
  }
  return raw as any;
}

export async function setJson(key: string, value: any, ttlSeconds?: number) {
  const serialized = JSON.stringify(value);
  await redis.set(key, serialized);
  if (ttlSeconds) {
    try {
      // set TTL using expire to avoid differing set() overloads across client versions
      await redis.expire(key, ttlSeconds);
    } catch (err) {
      console.error("Redis expire error in setJson:", err);
    }
  }
}

export async function delKey(key: string) {
  await redis.del(key);
}
