import { createClient } from "redis";

let redisClient = null;
let redisStatus = {
  ready: false,
  lastError: null,
};

const logPrefix = "[REDIS]";

const getRedisUrl = () => {
  // Allow both REDIS_URL and individual host/port style env vars.
  // Example REDIS_URL: redis://:password@localhost:6379
  if (process.env.REDIS_URL) return process.env.REDIS_URL;

  const host = process.env.REDIS_HOST || "redis";
  const port = parseInt(process.env.REDIS_PORT, 10) || 6379;
  const username = process.env.REDIS_USERNAME || undefined;
  const password = process.env.REDIS_PASSWORD || undefined;

  // If password not provided, use plain redis://
  if (!password) {
    return `redis://${host}:${port}`;
  }

  // If using username+password, include it when provided.
  if (username) {
    return `redis://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}`;
  }

  return `redis://:${encodeURIComponent(password)}@${host}:${port}`;
};

const shouldEnableRedis = () => {
  // Default: enabled only if REDIS_URL or REDIS_HOST present.
  // This avoids breaking local dev/test.
  return Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
};

export const initRedisClient = async () => {
  if (!shouldEnableRedis()) {
    console.log(`${logPrefix} Redis disabled (missing REDIS_URL/REDIS_HOST).`);
    redisStatus = { ready: false, lastError: null };
    return null;
  }

  if (redisClient) return redisClient;

  const url = getRedisUrl();

  redisClient = createClient({
    url,

    // Keep connection stable in production.
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        // Exponential-ish backoff with a ceiling.
        const ms = Math.min(2000 * 2 ** retries, 30000);
        return ms;
      },

      // Fail fast for misconfig.
      keepAlive: 10000,
    },
  });

  redisClient.on("error", (err) => {
    redisStatus = { ready: false, lastError: err?.message || String(err) };
    console.error(`${logPrefix} client error:`, err);
  });

  redisClient.on("ready", () => {
    redisStatus.ready = true;
    redisStatus.lastError = null;
    console.log(`${logPrefix} connected and ready.`);
  });

  redisClient.on("end", () => {
    redisStatus.ready = false;
    console.warn(`${logPrefix} connection ended.`);
  });

  // Try connect but do not crash app if redis is down.
  try {
    await redisClient.connect();
  } catch (err) {
    redisStatus = { ready: false, lastError: err?.message || String(err) };
    console.warn(`${logPrefix} initial connect failed (fallback will apply):`, err?.message || err);
    // Keep redisClient created; middleware will handle failures by checking ready.
  }

  return redisClient;
};

export const getRedisClient = () => redisClient;

export const isRedisReady = () => redisStatus.ready;

export const getRedisStatus = () => redisStatus;

export const shutdownRedis = async () => {
  if (!redisClient) return;
  try {
    await redisClient.quit();
  } catch {
    // ignore
  }
  redisClient = null;
  redisStatus = { ready: false, lastError: null };
};
