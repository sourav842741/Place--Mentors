import express from "express";
import isAuth from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";
import { paymentLimiter } from "../middlewares/security.js";
import validate from "../middlewares/validate.js";
import { createOrder, verifyPayment } from "../validators/payment.validator.js";
import {
  createOrder as createOrderController,
  verifyPayment as verifyPaymentController,
  getMyPayments,
  getAllPaymentsForAdmin,
} from "../controllers/payment.controller.js";

import isAdmin from "../middlewares/admin.middleware.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/order",
  paymentLimiter,
  maintenanceCheck,
  isAuth,
  validate(createOrder),
  createOrderController
);

paymentRouter.post(
  "/verify",
  paymentLimiter,
  maintenanceCheck,
  isAuth,
  validate(verifyPayment),
  verifyPaymentController
);

// ================= READ-ONLY PAYMENT VISIBILITY =================
paymentRouter.get("/me", isAuth, getMyPayments);

paymentRouter.get("/admin/all", isAuth, isAdmin, getAllPaymentsForAdmin);

export default paymentRouter;
