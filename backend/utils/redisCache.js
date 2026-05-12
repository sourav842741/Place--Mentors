import crypto from "crypto";
import { getRedisClient, isRedisReady } from "./redisClient.js";

const safeJsonParse = (value) => {
  if (value === null || value === undefined) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// Email/IP can be used in cache keys. Hash it to control key size.
export const hashKey = (value) => {
  const str = String(value ?? "");
  return crypto.createHash("sha256").update(str).digest("hex");
};

export const redisGet = async (key) => {
  if (!isRedisReady()) return null;
  const client = getRedisClient();
  if (!client) return null;
  try {
    const val = await client.get(key);
    return val;
  } catch {
    return null;
  }
};

export const redisGetJson = async (key) => {
  const val = await redisGet(key);
  if (val === null) return null;
  return safeJsonParse(val);
};

export const redisSet = async (key, value, ttlSeconds) => {
  if (!isRedisReady()) return false;
  const client = getRedisClient();
  if (!client) return false;
  try {
    const str = typeof value === "string" ? value : JSON.stringify(value);
    if (ttlSeconds && Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
      await client.set(key, str, {
        EX: ttlSeconds,
      });
    } else {
      await client.set(key, str);
    }
    return true;
  } catch {
    return false;
  }
};

export const redisDel = async (key) => {
  if (!isRedisReady()) return 0;
  const client = getRedisClient();
  if (!client) return 0;
  try {
    return await client.del(key);
  } catch {
    return 0;
  }
};
