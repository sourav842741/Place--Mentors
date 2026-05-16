import dotenv from "dotenv";

dotenv.config();

// Base required env vars
const requiredEnvVars = [
  "MONGOURL",
  "JWT_SECRET",
  "CLIENT_URL",
  "RESEND_API_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

// Enable PostgreSQL validation only when payments PG mode is enabled
const isPaymentsPgEnabled = process.env.PAYMENTS_PG_ENABLED === "true";

if (isPaymentsPgEnabled) {
  requiredEnvVars.push("PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD");
}

// Find missing vars
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

// Fail fast
if (missingVars.length > 0) {
  console.error("[FATAL] Missing required environment variables:", missingVars.join(", "));

  process.exit(1);
}

const ENV = {
  PORT: parseInt(process.env.PORT, 10) || 5000,

  NODE_ENV: process.env.NODE_ENV || "production",

  // Mongo
  MONGO_URL: process.env.MONGOURL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Frontend
  CLIENT_URL: process.env.CLIENT_URL,

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,

  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY,

  // PostgreSQL Payments
  PAYMENTS_PG_ENABLED: isPaymentsPgEnabled,

  PGHOST: process.env.PGHOST,
  PGPORT: parseInt(process.env.PGPORT, 10) || 5432,
  PGDATABASE: process.env.PGDATABASE,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
};

export default ENV;
