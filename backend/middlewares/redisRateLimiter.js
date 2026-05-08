import { getRedisClient, isRedisReady } from "../utils/redisClient.js";

const logPrefix = "[REDIS-RL]";

const safeGetIp = (req) => {
  // express-rate-limit used ipKeyGenerator, here we keep it simple.
  return req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
};

/**
 * Redis fixed-window rate limiting.
 * Multi-instance safe because it uses a shared counter in Redis.
 */
export const redisRateLimiter = ({
  prefix = "rl",
  windowSeconds = 900, // 15m
  max = 20,
  // keyBuilder can be used to keep cardinality controlled
  keyBuilder,
  statusCode = 429,
  message = "Too many attempts. Please try again later.",
} = {}) => {
  return async (req, res, next) => {
    // If Redis not ready, do not block the request.
    if (!isRedisReady()) return next();

    const client = getRedisClient();
    if (!client) return next();

    try {
      const ip = safeGetIp(req);
      const keyPart = keyBuilder ? keyBuilder(req, ip) : ip;
      const redisKey = `${prefix}:${String(keyPart)}`;

      // atomic increment
      const tx = client.multi();
      tx.incr(redisKey);
      tx.ttl(redisKey);
      const results = await tx.exec();

      // results: [[err,res], [err,res]]-like; redis v4 returns raw results array.
      // However tx.exec() returns array of results directly.
      // We can just run separate calls for clarity.
    } catch {
      // fallback to next
    }

    // Use simpler approach with separate calls for readability.
    try {
      const ip = safeGetIp(req);
      const keyPart = keyBuilder ? keyBuilder(req, ip) : ip;
      const redisKey = `${prefix}:${String(keyPart)}`;

      const current = await client.incr(redisKey);

      if (current === 1) {
        await client.expire(redisKey, windowSeconds);
      }

      if (current > max) {
        return res.status(statusCode).json({
          success: false,
          message,
        });
      }

      return next();
    } catch (err) {
      // Graceful fallback on Redis failures.
      console.warn(`${logPrefix} Redis down/failure; fallback to Mongo:`, err?.message || err);
      return next();
    }
  };
};

