import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

/* ==================================================
   RATE LIMIT CONFIGURATIONS
================================================== */

export const strictLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many attempts. Please try again after 15 minutes.",
      },
    });

export const mediumLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests. Please try again after 10 minutes.",
      },
    });

export const paymentLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many payment requests. Please try again after 5 minutes.",
      },
    });

export const generalLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });

const skipSocketIo = (middleware) => (req, res, next) => {
  if (req.path.startsWith("/socket.io/")) {
    return next();
  }
  middleware(req, res, next);
};

/* ==================================================
   SECURITY MIDDLEWARE SETUP
================================================== */
const setupSecurity = (app) => {
  // Apply general rate limit globally, but skip Socket.IO paths
  app.use(skipSocketIo(generalLimiter));
  // Additional per-route limiters applied in route files
};

export default setupSecurity;

