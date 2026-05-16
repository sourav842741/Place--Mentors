import pool from "../db/pgPool.js";

const normalizeUserId = (userId) => {
  if (!userId) return null;
  return typeof userId === "string" ? userId : String(userId);
};

export const paymentRepository = {
  async createPayment({
    userId,

    planId,
    amount,
    credits,
    razorpayOrderId,
    status = "created",
  }) {
    const client = await pool.connect();
    try {
      const userIdStr = normalizeUserId(userId);
      const insertQuery = `
        INSERT INTO payments (
          user_id,
          plan_id,
          amount,
          credits,
          razorpay_order_id,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (razorpay_order_id)
        DO UPDATE SET
          updated_at = NOW()
        RETURNING *;
      `;


      const { rows } = await client.query(insertQuery, [
        userIdStr,
        planId,
        amount,
        credits,
        razorpayOrderId,
        status,
      ]);
      return rows[0];
    } finally {
      client.release();
    }
  },

  async getPaymentByRazorpayOrderId(razorpayOrderId) {
    const query = `
      SELECT *
      FROM payments
      WHERE razorpay_order_id = $1
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [razorpayOrderId]);
    return rows[0] || null;
  },


  async acquireForProcessing({ razorpayOrderId }) {
    const updateQuery = `
      UPDATE payments
      SET
        status = 'processing',
        updated_at = NOW()
      WHERE razorpay_order_id = $1
        AND credits_added = FALSE
        AND (
          status IN ('created','failed')
          OR (
            status = 'processing'
            AND updated_at < NOW() - INTERVAL '10 minutes'
          )
        )
        AND razorpay_payment_id IS NULL
      RETURNING *;
    `;


    const { rows } = await pool.query(updateQuery, [razorpayOrderId]);
    if (rows && rows.length) {
      return { acquired: true, payment: rows[0] };
    }

    const current = await this.getPaymentByRazorpayOrderId(razorpayOrderId);
    return { acquired: false, payment: current };
  },


  /**
   * Finalize a `processing` payment into `paid` atomically.
   * Idempotent: if already paid, it returns paidUpdated=false.
   */
  async finalizePaid({ razorpayOrderId, razorpayPaymentId }) {
    const updateQuery = `
      UPDATE payments
      SET
        status = 'paid',
        razorpay_payment_id = $2,
        credits_added = TRUE,
        updated_at = NOW()
      WHERE razorpay_order_id = $1
        AND status = 'processing'
        AND credits_added = FALSE
      RETURNING *;
    `;

    const { rows: updatedRows } = await pool.query(updateQuery, [
      razorpayOrderId,
      razorpayPaymentId,
    ]);

    if (updatedRows && updatedRows.length) {
      return { paidUpdated: true, payment: updatedRows[0] };
    }

    const current = await this.getPaymentByRazorpayOrderId(razorpayOrderId);
    return { paidUpdated: false, payment: current };
  },


  /**
   * Mark a processing payment as failed (recovery-safe when Mongo update fails).
   */
  async markFailed({ razorpayOrderId }) {
    const updateQuery = `
      UPDATE payments
      SET
        status = 'failed',
        updated_at = NOW()
      WHERE razorpay_order_id = $1
        AND status = 'processing'
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [razorpayOrderId]);
    if (rows && rows.length) return rows[0];
    const current = await this.getPaymentByRazorpayOrderId(razorpayOrderId);
    return current;
  },
};

export default paymentRepository;


