-- PostgreSQL schema for payments table (minimal, matches existing Payment model fields)

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,

  user_id TEXT NOT NULL,
  plan_id TEXT,

  amount INTEGER,
  credits INTEGER,

  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,

  -- Lifecycle: created -> processing -> paid/failed
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'processing', 'paid', 'failed')),

  -- Hybrid idempotency source of truth.
  -- If Mongo credits were already added, we must never add again.
  credits_added BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Indexes for recovery + idempotency lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_credits_added ON payments(credits_added);





