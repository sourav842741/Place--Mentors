import { Router } from "express";
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  getFriends 
} from "../controllers/friend.controller.js";
import  isAuth  from "../middlewares/isAuth.js";

const router = Router();

router.post("/send/:id", isAuth, sendFriendRequest);
router.post("/accept/:id", isAuth, acceptFriendRequest);
router.post("/reject/:id", isAuth, rejectFriendRequest);
router.get("/", isAuth, getFriends);

export default router;

