import { redisGetJson, redisSet } from "../utils/redisCache.js";

/**
 * Generic Redis cache wrapper (cache-aside).
 * - Never blocks requests if Redis is down.
 * - Uses keyBuilder to control key size/cardinality.
 */
export const redisCacheWrapper = ({
  keyBuilder,
  ttlSeconds = 60,
} = {}) => {
  if (!keyBuilder) {
    throw new Error("redisCacheWrapper requires keyBuilder");
  }

  return async (req, res, next) => {
    const key = keyBuilder(req);
    if (!key) return next();

    try {
      const cached = await redisGetJson(key);
      if (cached !== null && cached !== undefined) {
        res.json(cached);
        return;
      }
    } catch {
      // ignore redis failure
    }

    // Patch res.json to store cached response (only for successful payloads)
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        await redisSet(key, body, ttlSeconds);
      } catch {
        // ignore
      }
      return originalJson(body);
    };

    next();
  };
};

