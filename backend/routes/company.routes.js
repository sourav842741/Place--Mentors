import express from "express";
import {
  getCompany,
  getCompanies
} from "../controllers/company.controller.js";

const router = express.Router();

import isAuth from "../middlewares/isAuth.js";
router.post("/company", isAuth, getCompany);
router.get("/all", getCompanies);

export default router;