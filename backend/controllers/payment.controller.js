import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";
import crypto from "crypto";

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

    await Payment.create({
      userId: req.user._id,
      planId,
      amount: plan.amount,
      credits: plan.credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create Razorpay order" });
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
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "paid") {
      return res.json({ message: "Already processed" });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      { $inc: { credits: payment.credits } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify Razorpay payment" });
  }
};
