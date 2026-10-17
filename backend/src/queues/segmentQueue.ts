import { Queue, QueueScheduler } from 'bullmq';

// Reuse Redis URL from environment so we don't duplicate connection logic.
// The app already connects to Redis via `backend/src/utils/redis.ts` using
// `REDIS_URL` (or default). BullMQ will create its own ioredis connection
// using the same URL.
const redisUrl = process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;

// Parse the URL into host/port/password/tls options for ioredis-compatible connection
let connection: any = {};
try {
  const u = new URL(redisUrl);
  connection.host = u.hostname;
  connection.port = Number(u.port || 6379);
  if (u.username) connection.username = decodeURIComponent(u.username);
  if (u.password) connection.password = decodeURIComponent(u.password.replace(/^:/, ''));
  if (u.protocol === 'rediss:') connection.tls = {};
} catch (err) {
  // fallback to host/port env
  connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
  };
}

export const segmentQueue = new Queue('segment-forward', { connection });
// QueueScheduler is required for delayed jobs and retries
new QueueScheduler('segment-forward', { connection });
