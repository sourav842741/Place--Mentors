import pool from "../db/pgPool.js";

const normalizeUserId = (userId) => {
  if (!userId) return null;
  return typeof userId === "string" ? userId : String(userId);
};

export const paymentRepository = {
  async createPayment({ userId, planId, amount, credits, razorpayOrderId, status = "created" }) {
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

  // ================= READ API QUERIES =================

  async getPaymentsByUser({ userId, page = 1, limit = 20, status }) {
    const userIdStr = normalizeUserId(userId);

    const where = [];
    const params = [];

    where.push(`user_id = $${params.length + 1}`);
    params.push(userIdStr);

    const allowedStatuses = ["created", "processing", "paid", "failed"];

    if (status && allowedStatuses.includes(status)) {
      where.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    const offset = (Number(page) - 1) * Number(limit);

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM payments
      ${whereSql}
    `;

    const listQuery = `
      SELECT
        id,
        user_id,
        plan_id,
        amount,
        credits,
        status,
        credits_added,
        created_at,
        updated_at
      FROM payments
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    const countParams = [...params];
    const listParams = [...params, Number(limit), offset];

    // ✅ FIXED
    const [countRes, listRes] = await Promise.all([
      pool.query(countQuery, countParams),
      pool.query(listQuery, listParams),
    ]);

    const total = countRes?.rows?.[0]?.total || 0;

    return {
      payments: listRes.rows || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
  },

  async getAllPaymentsForAdmin({ page = 1, limit = 20, status, search, planId }) {
    const where = [];
    const params = [];

    const allowedStatuses = ["created", "processing", "paid", "failed"];

    if (status && allowedStatuses.includes(status)) {
      where.push(`p.status = $${params.length + 1}`);
      params.push(status);
    }

    if (planId && typeof planId === "string" && planId.trim()) {
      where.push(`p.plan_id = $${params.length + 1}`);
      params.push(planId.trim());
    }

    if (search && typeof search === "string" && search.trim()) {
      const q = `%${search.trim()}%`;

      where.push(
        `(p.user_id ILIKE $${params.length + 1} 
          OR p.razorpay_order_id ILIKE $${params.length + 2} 
          OR p.razorpay_payment_id ILIKE $${params.length + 3})`
      );

      params.push(q, q, q);
    }

    const offset = (Number(page) - 1) * Number(limit);

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM payments p
      ${whereSql}
    `;

    const listQuery = `
      SELECT
        p.id,
        p.user_id,
        p.plan_id,
        p.amount,
        p.credits,
        p.status,
        p.credits_added,
        p.razorpay_order_id,
        p.razorpay_payment_id,
        p.created_at,
        p.updated_at
      FROM payments p
      ${whereSql}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    // ✅ FIXED
    const [countRes, listRes] = await Promise.all([
      pool.query(countQuery, [...params]),
      pool.query(listQuery, [...params, Number(limit), offset]),
    ]);

    const total = countRes?.rows?.[0]?.total || 0;

    return {
      payments: listRes.rows || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    };
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
