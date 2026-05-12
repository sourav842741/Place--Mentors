import { isRedisReady } from "../utils/redisClient.js";

/**
 * Middleware that attaches a flag for downstream handlers.
 * It MUST NOT block requests.
 */
export const redisGuard = (req, _res, next) => {
  req.redisAvailable = isRedisReady();
  next();
};
