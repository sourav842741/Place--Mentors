import { Router } from "express";
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  sendChallenge,
  rejectChallenge,
  getFriends 
} from "../controllers/friend.controller.js";
import  isAuth  from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = Router();

router.post("/send/:id", maintenanceCheck, isAuth, sendFriendRequest);
router.post("/accept/:id", maintenanceCheck, isAuth, acceptFriendRequest);
router.post("/reject/:id", maintenanceCheck, isAuth, rejectFriendRequest);
router.get("/", maintenanceCheck, isAuth, getFriends);
router.post("/challenge/:id", maintenanceCheck, isAuth, sendChallenge);
router.post("/challenge/reject/:id", maintenanceCheck, isAuth, rejectChallenge);

export default router;

