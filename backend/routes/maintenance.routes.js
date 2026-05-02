import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/admin.middleware.js";

import {
  getRandomByType,
  getDashboardData,
  getAllTypes,
  listQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/maintenance.controller.js";

const router = express.Router();

/* =====================================================
   PUBLIC ROUTES
   Anyone can access during maintenance mode
===================================================== */

router.get("/random/:type", getRandomByType);
router.get("/dashboard", getDashboardData);
router.get("/all-types", getAllTypes);

/* =====================================================
   ADMIN ROUTES
   Login required + Admin only
===================================================== */

router.get("/list", isAuth, isAdmin, listQuestions);

router.post("/add", isAuth, isAdmin, addQuestion);

router.put("/:id", isAuth, isAdmin, updateQuestion);

router.delete("/:id", isAuth, isAdmin, deleteQuestion);

export default router;
