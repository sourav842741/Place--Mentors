import Joi from "joi";
import { planId, amount, credits } from "./common.validator.js";

export const createOrder = Joi.object({
  planId: Joi.string().valid("basic", "pro").required(),
});

export const verifyPayment = Joi.object({
  razorpay_order_id: Joi.string().trim().required(),
  razorpay_payment_id: Joi.string().trim().required(),
  razorpay_signature: Joi.string().trim().required(),
});

