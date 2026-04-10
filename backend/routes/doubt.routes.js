import express from "express";
import {
  askDoubt,
  getDoubts,
  addReply,
  getReplies,
  toggleUpvote,
} from "../controllers/doubt.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/ask", isAuth, askDoubt);
router.get("/", isAuth, getDoubts);
router.post("/:id/reply", isAuth, addReply);
router.get("/:id/replies", isAuth, getReplies);

router.post("/reply/:id/upvote", isAuth, toggleUpvote);

export default router;
