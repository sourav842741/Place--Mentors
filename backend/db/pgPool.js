import pg from "pg";
import ENV from "../config/env.js";

const { Pool } = pg;

// NOTE: This project currently uses only MONGO env vars.
// Add these env vars when running Postgres mode:
//   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD

const requiredEnvVars = ["PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD"].filter(
  (k) => !process.env[k]
);

// Tests and local dev may run without Postgres.
// Fail fast only when explicitly enabled.
if (requiredEnvVars.length && process.env.PAYMENTS_PG_ENABLED === "true") {
  throw new Error(`[PG] Missing required environment variables: ${requiredEnvVars.join(", ")}`);
}

// If Postgres is not enabled, keep pool importable without crashing.
if (!requiredEnvVars.length) {
  // ok
}

const isProd = process.env.NODE_ENV === "production";

const sslEnabled =
  process.env.PGSSLMODE === "require" ||
  process.env.PGSSL === "true" ||
  process.env.PGSSL_ENABLED === "true";

// Render-style Postgres often requires SSL, and expects `rejectUnauthorized: false`
// in some setups where certs are not provided.
const ssl = sslEnabled
  ? {
      rejectUnauthorized: false,
    }
  : undefined;

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,

  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 5000),

  // Avoid long-running queries.
  statement_timeout: Number(process.env.PG_STATEMENT_TIMEOUT_MS || 5000),

  ...(ssl ? { ssl } : {}),

  // Keep pool from aggressively failing early; let app decide.
  // (pg Pool will still throw if connections cannot be established.)
  ...(isProd ? {} : {}),
});

export default pool;
