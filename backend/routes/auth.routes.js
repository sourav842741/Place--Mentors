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
  setupTwoFactor,
  enableTwoFactor,
  verifyTwoFactorLogin,
  disableTwoFactor,
  getTwoFactorStatus,
} from "../controllers/auth.controllers.js";

import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { strictLimiter } from "../middlewares/security.js";
import validate from "../middlewares/validate.js";
import {
  sendSignupOtp as sendSignupOtpSchema,
  signIn as signInSchema,
  googleAuth as googleAuthSchema,
  sendResetOtp as sendResetOtpSchema,
  verifyResetOtp as verifyResetOtpSchema,
  resetPassword as resetPasswordSchema,
  updateProfile as updateProfileSchema,
} from "../validators/auth.validator.js";

const authRouter = express.Router();

// ================= AUTH =================
authRouter.post("/signin", strictLimiter, validate(signInSchema), signIn);
authRouter.get("/signout", signOut);
authRouter.post("/google", strictLimiter, validate(googleAuthSchema), googleAuth);

// ================= SIGNUP WITH OTP =================
authRouter.post("/signup/send-otp", strictLimiter, validate(sendSignupOtpSchema), sendSignupOtp);
authRouter.post(
  "/signup/verify-otp",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  verifySignupOtp
);

// ================= RESET PASSWORD =================
authRouter.post("/password/send-otp", strictLimiter, validate(sendResetOtpSchema), sendResetOtp);
authRouter.post("/password/verify-otp", strictLimiter, validate(verifyResetOtpSchema), verifyResetOtp);
authRouter.post("/password/reset", strictLimiter, validate(resetPasswordSchema), resetPassword);

// ================= USER PROFILE =================
authRouter.put(
  "/profile",
  isAuth,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  validate(updateProfileSchema),
  updateProfile
);

authRouter.put("/skills", isAuth, updateSkills);

// ================= CURRENT USER =================
authRouter.get("/me", isAuth, getCurrentUser);

// ================= 2FA =================
authRouter.get("/2fa/status", isAuth, getTwoFactorStatus);
authRouter.post("/2fa/setup", isAuth, setupTwoFactor);
authRouter.post("/2fa/enable", isAuth, enableTwoFactor);
authRouter.post("/2fa/login", strictLimiter, verifyTwoFactorLogin);
authRouter.post("/2fa/disable", isAuth, disableTwoFactor);

export default authRouter;
