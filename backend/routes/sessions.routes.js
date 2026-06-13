import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getSessions, deleteSession, logoutAll } from "../controllers/sessions.controller.js";

const router = express.Router();

router.get("/sessions", isAuth, getSessions);
router.delete("/sessions/:sessionId", isAuth, deleteSession);
router.post("/sessions/logout-all", isAuth, logoutAll);

export default router;
