import jwt from "jsonwebtoken";
import { getRedisClient, isRedisReady } from "./redisClient.js";

const logPrefix = "[JWT-BL]";

const enabled = () => Boolean(process.env.JWT_BLACKLIST_ENABLED === "true");

// Requires jwt payload to include `jti`.
// If your current JWT generator doesn't include `jti`, this module will no-op.
const getJti = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded?.jti;
  } catch {
    return null;
  }
};

export const isTokenBlacklisted = async (token) => {
  if (!enabled()) return false;
  if (!isRedisReady()) return false;

  const jti = getJti(token);
  if (!jti) return false;

  try {
    const client = getRedisClient();
    const key = `bl:jti:${jti}`;
    const val = await client.get(key);
    return val === "1";
  } catch (err) {
    console.warn(`${logPrefix} check failed (fallback allow):`, err?.message || err);
    return false;
  }
};

export const blacklistToken = async (token) => {
  if (!enabled()) return false;
  if (!isRedisReady()) return false;

  const jti = getJti(token);
  if (!jti) return false;

  try {
    const client = getRedisClient();

    const decoded = jwt.decode(token);
    const exp = decoded?.exp;
    if (!exp) return false;

    const ttl = Math.max(1, exp * 1000 - Date.now()) / 1000;

    await client.set(`bl:jti:${jti}`, "1", {
      EX: Math.floor(ttl),
    });

    return true;
  } catch (err) {
    console.warn(`${logPrefix} blacklist failed:`, err?.message || err);
    return false;
  }
};

