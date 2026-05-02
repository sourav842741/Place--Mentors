import { Router } from "express";
import { getDiscoverUsers } from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = Router();

router.get("/discover", maintenanceCheck, isAuth, getDiscoverUsers);

export default router;
