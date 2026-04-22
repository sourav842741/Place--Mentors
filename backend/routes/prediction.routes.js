import express from "express";
import {
  predictPlacement,
  getPredictionHistory,
} from "../controllers/prediction.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// POST /api/prediction/predict-placement
router.post(
  "/predict-placement",
  isAuth,
  predictPlacement
);

// GET /api/prediction/history
router.get(
  "/history",
  isAuth,
  getPredictionHistory
);

export default router;