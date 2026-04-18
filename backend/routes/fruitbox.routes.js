import express from "express";
import { getProgress, updateProgress, resetProgress } from "../controllers/fruitbox.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.get('/progress', isAuth, getProgress);
router.post('/progress', isAuth, updateProgress);
router.delete('/progress', isAuth, resetProgress);

export default router;

