import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const env = process.env.NODE_ENV || "development";
const isTest = env === "test";
const isDev = env === "development";

/* ==================================================
   COMMON CONFIG
================================================== */

const createLimiter = ({ windowMs, max, message }) =>
  isTest
    ? (req, res, next) => next()
    : rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,

        message: {
          success: false,
          message,
        },

        // Logged user => userId
        // Guest => safe IP key (IPv4 + IPv6)
        keyGenerator: (req) => {
          return req.user?.id || req.user?._id || ipKeyGenerator(req);
        },

        // Skip localhost during development
        skip: (req) => {
          if (!isDev) return false;

          const ip = req.ip || "";

          return (
            ip === "::1" ||
            ip === "127.0.0.1" ||
            ip.includes("::ffff:127.0.0.1")
          );
        },
      });

/* ==================================================
   LIMITERS
================================================== */

// Login / Register / OTP
export const strictLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 20,
  message: "Too many attempts. Please try again after 15 minutes.",
});

// Logged-in user routes
export const mediumLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: isDev ? 500 : 100,
  message: "Too many requests. Please try again after 10 minutes.",
});

// Payment routes
export const paymentLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: isDev ? 100 : 10,
  message: "Too many payment requests. Please try again after 5 minutes.",
});

// Public routes
export const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 2000 : 300,
  message: "Too many requests. Please try again later.",
});

// Admin routes
export const adminLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: isDev ? 1000 : 150,
  message: "Too many admin requests. Please try again later.",
});

/* ==================================================
   SOCKET.IO SKIP
================================================== */

const skipSocketIo = (middleware) => (req, res, next) => {
  if (req.path.startsWith("/socket.io/")) {
    return next();
  }

  return middleware(req, res, next);
};

/* ==================================================
   GLOBAL SECURITY SETUP
================================================== */

const setupSecurity = (app) => {
  // Apply light global limiter to API only
  app.use("/api", skipSocketIo(generalLimiter));
};

export default setupSecurity;