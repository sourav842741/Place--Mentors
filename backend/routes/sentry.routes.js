import express from "express";

const router = express.Router();

// Intentionally throws to verify Sentry error monitoring.
router.get("/sentry-test", (req, res, next) => {
  const err = new Error("Sentry integration test error");
  err.statusCode = 500;
  next(err);
});

export default router;

