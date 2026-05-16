import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";
import crypto from "crypto";
import { paymentRepository } from "../repositories/payment.repository.pg.js";

const PRICE_SHEET = {
  basic: { amount: 100, credits: 150 },
  pro: { amount: 500, credits: 650 },
};

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = PRICE_SHEET[planId];
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const options = {
      amount: plan.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await paymentRepository.createPayment({
      userId: req.user._id,
      planId,
      amount: plan.amount,
      credits: plan.credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json(order);
  } catch (error) {
    console.error("[Payment Order Error]", error);

    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("[Payment] Invalid Razorpay signature", {
        razorpay_order_id,
      });
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const existingPayment = await paymentRepository.getPaymentByRazorpayOrderId(razorpay_order_id);

    if (!existingPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Hybrid idempotency: if Mongo credits were already added, never add again.
    if (existingPayment.credits_added === true || existingPayment.status === "paid") {
      return res.json({ message: "Already processed" });
    }

    // Atomically acquire processing lock.
    const { acquired, payment } = await paymentRepository.acquireForProcessing({
      razorpayOrderId: razorpay_order_id,
    });

    // Another request is/was processing.
    if (!acquired) {
      console.warn("[Payment] Processing lock conflict", {
        razorpay_order_id,
        current_status: payment?.status,
      });
      // Preserve frontend compatibility: keep same existing response structure.
      return res.json({ message: "Already processed" });
    }

    // Safety: don't double-credit based on credits_added.
    if (payment.credits_added === true || payment.status === "paid") {
      return res.json({ message: "Already processed" });
    }

    // Hybrid consistency: ONLY finalize Postgres to paid after Mongo credits update succeeds.
    try {
      // Re-check just before crediting to prevent double credits under all retries.
      const latest = await paymentRepository.getPaymentByRazorpayOrderId(razorpay_order_id);
      if (latest?.credits_added === true) {
        return res.json({ message: "Already processed" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        payment.user_id,
        {
          $inc: { credits: payment.credits },
        },
        { new: true }
      );

      // If Mongo update didn't find the user, treat as failure (no credits).
      if (!updatedUser) {
        console.error("[Payment] Mongo credit update failed: user not found", {
          payment_id: payment.id,
          user_id: payment.user_id,
        });
        await paymentRepository.markFailed({ razorpayOrderId: razorpay_order_id });
        return res.status(500).json({ message: "Failed to verify Razorpay payment" });
      }

      const { paidUpdated } = await paymentRepository.finalizePaid({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });

      if (!paidUpdated) {
        // Biggest remaining edge: credits may already have been added but finalize didn't.
        // credits_added will prevent future retries from re-crediting.
        console.warn("[Payment] Postgres finalize conflict", {
          razorpay_order_id,
        });
      }

      return res.json({
        success: true,
        message: "Payment verified and credits added",
        user: updatedUser,
      });
    } catch (mongoErr) {
      console.error("[Payment] Mongo credit update failure", {
        razorpay_order_id,
        error: mongoErr?.message,
      });
      await paymentRepository.markFailed({ razorpayOrderId: razorpay_order_id });
      return res.status(500).json({ message: "Failed to verify Razorpay payment" });
    }
  } catch (error) {
    console.error("[Payment] Verify flow failure", {
      razorpay_order_id: req.body?.razorpay_order_id,
      error: error?.message,
    });
    return res.status(500).json({ message: "Failed to verify Razorpay payment" });
  }
};

// ================= READ-ONLY PAYMENT VISIBILITY =================

export const getMyPayments = async (req, res) => {
  const userId = req.user?._id;

  const { page = 1, limit = 20, status } = req.query;

  try {
    const result = await paymentRepository.getPaymentsByUser({
      userId,
      page: Number(page),
      limit: Number(limit),
      status,
    });

    const paymentsRaw = Array.isArray(result?.payments) ? result.payments : [];

    // Frontend user UI: minimal fields (no internal order/payment IDs)
    const payments = paymentsRaw.map((p) => ({
      id: p.id,
      planId: p.plan_id,
      amount: p.amount,
      credits: p.credits,
      status: p.status,
      creditsAdded: p.credits_added,
      createdAt: p.created_at,
    }));

    return res.json({
      success: true,
      message: "Payments fetched successfully",
      data: {
        payments,
        pagination: result?.pagination || {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to fetch payments",
    });
  }
};

export const getAllPaymentsForAdmin = async (req, res) => {
  const { page = 1, limit = 20, status, search, planId } = req.query;

  try {
    const result = await paymentRepository.getAllPaymentsForAdmin({
      page: Number(page),
      limit: Number(limit),
      status,
      search,
      planId,
    });

    return res.json({
      success: true,
      message: "Admin payments fetched successfully",
      data: {
        payments: result.payments,
        pagination: result.pagination,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to fetch admin payments",
    });
  }
};
