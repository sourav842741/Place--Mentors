import express from "express";
import {
  askDoubt,
  getDoubts,
  addReply,
  getReplies,
  toggleUpvote,
} from "../controllers/doubt.controller.js";
import isAuth from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = express.Router();

router.post("/ask", maintenanceCheck, isAuth, askDoubt);
router.get("/", maintenanceCheck, isAuth, getDoubts);
router.post("/:id/reply", maintenanceCheck, isAuth, addReply);
router.get("/:id/replies", maintenanceCheck, isAuth, getReplies);

router.post("/reply/:id/upvote", maintenanceCheck, isAuth, toggleUpvote);

export default router;
