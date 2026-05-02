import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "MONGOURL",
  "JWT_SECRET",
  "CLIENT_URL",
  "RESEND_API_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("[FATAL] Missing required environment variables:", missingVars.join(", "));
  process.exit(1);
}

const ENV = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || "production",

  MONGO_URL: process.env.MONGOURL,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  CLIENT_URL: process.env.CLIENT_URL,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
};

export default ENV;
