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

const router = Router();

router.post("/send/:id", isAuth, sendFriendRequest);
router.post("/accept/:id", isAuth, acceptFriendRequest);
router.post("/reject/:id", isAuth, rejectFriendRequest);
router.get("/", isAuth, getFriends);
router.post("/challenge/:id", isAuth, sendChallenge);
router.post("/challenge/reject/:id", isAuth, rejectChallenge);

export default router;

