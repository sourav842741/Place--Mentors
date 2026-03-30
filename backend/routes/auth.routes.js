import express from "express";

import {
  signIn,
  signOut,
  googleAuth,
  sendSignupOtp,
  verifySignupOtp,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
  updateProfile,
  updateSkills,
  getCurrentUser,
} from "../controllers/auth.controllers.js";

import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const authRouter = express.Router();

// ================= AUTH =================
authRouter.post("/signin", signIn);
authRouter.get("/signout", signOut);
authRouter.post("/google", googleAuth);

// ================= SIGNUP WITH OTP =================
authRouter.post("/signup/send-otp", sendSignupOtp);
authRouter.post(
  "/signup/verify-otp",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  verifySignupOtp
);

// ================= RESET PASSWORD =================
authRouter.post("/password/send-otp", sendResetOtp);
authRouter.post("/password/verify-otp", verifyResetOtp);
authRouter.post("/password/reset", resetPassword);

// ================= USER PROFILE =================
authRouter.put(
  "/profile",
  isAuth,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateProfile
);

authRouter.put("/skills", isAuth, updateSkills);

// ================= CURRENT USER =================
authRouter.get("/me", isAuth, getCurrentUser);

export default authRouter;