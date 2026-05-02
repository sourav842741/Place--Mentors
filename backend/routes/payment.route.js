import express from "express";
import isAuth from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";
import { paymentLimiter } from "../middlewares/security.js";
import validate from "../middlewares/validate.js";
import { createOrder, verifyPayment } from "../validators/payment.validator.js";
import {
  createOrder as createOrderController,
  verifyPayment as verifyPaymentController,
} from "../controllers/payment.controller.js";

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

export default paymentRouter;
