import { Router } from "express";
import { getDiscoverUsers } from "../controllers/user.controller.js";
import isAuth  from "../middlewares/isAuth.js";

const router = Router();

router.get("/discover", isAuth, getDiscoverUsers);

export default router;

