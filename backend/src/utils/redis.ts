import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => console.error("Redis client error:", err));

// Check connection on startup and log result
(async () => {
  try {
    await redis.connect();
    console.log("Connected to local Redis");
  } catch (error) {
    console.error("Failed to connect to local Redis:", error);
  }
})();

export async function getJson(key: string) {
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("JSON parse error in getJson:", err);
    return null;
  }
}

export async function setJson(key: string, value: any, ttlSeconds?: number) {
  const serialized = JSON.stringify(value);
  await redis.set(key, serialized);
  if (ttlSeconds) {
    try {
      await redis.expire(key, ttlSeconds);
    } catch (err) {
      console.error("Redis expire error in setJson:", err);
    }
  }
}

export async function delKey(key: string) {
  await redis.del(key);
}
