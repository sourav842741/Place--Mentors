import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import TempUser from "../models/tempUser.model.js";
import {
  sendSignupOtpMail,
  sendResetOtpMail,
  sendWelcomeMail,
} from "../config/mail.js";
import genToken, { genTempToken, verifyTempToken } from "../config/token.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { handleLoginStreak } from "../utils/streakManager.js";
import { checkAndAssignBadges } from "../utils/badgeManager.js";
import { addXP } from "../utils/xpManager.js";
import {
  isPrivilegedRole,
  generateSecret,
  generateQRCode,
  verifyTOTP,
  generateRecoveryCodes,
  hashRecoveryCodes,
  verifyRecoveryCode,
  generateDeviceId,
} from "../utils/twoFactor.js";
import {
  generateOTP,
  sanitizeUser,
} from "../utils/authValidators.js";

// ================= COOKIE OPTIONS =================
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 10 * 24 * 60 * 60 * 1000,
};

const handleImageUploads = async (req) => {
  let avatarUrl = "";
  let coverUrl = "";

  if (req.files?.avatar?.[0]?.path) {
    const avatar = await uploadOnCloudinary(req.files.avatar[0].path);
    if (avatar?.secure_url || avatar?.url) {
      avatarUrl = avatar.secure_url || avatar.url;
    }
  }

  if (req.files?.coverImage?.[0]?.path) {
    const cover = await uploadOnCloudinary(req.files.coverImage[0].path);
    if (cover?.secure_url || cover?.url) {
      coverUrl = cover.secure_url || cover.url;
    }
  }

  return { avatarUrl, coverUrl };
};

// ================= SEND SIGNUP OTP =================
export const sendSignupOtp = asyncHandler(async (req, res) => {
  const { fullName, email, password, skills } = req.body;

  const existingUser = await User.findOne({
    email: email.toLowerCase().trim(),
  });
  if (existingUser) {
    throw new ApiError(400, "Email already exists");
  }

  const otp = generateOTP();

  await TempUser.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      skills,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
    },
    { upsert: true, returnDocument: "after" },
  );

  try {
    await sendSignupOtpMail(email, otp);
  } catch (error) {
    throw new ApiError(500, "Failed to send signup OTP");
  }

  return res.status(200).json(new ApiResponse(200, null, "OTP sent to email"));
});

// ================= VERIFY SIGNUP OTP =================
export const verifySignupOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const tempUser = await TempUser.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!tempUser || tempUser.otp !== otp || tempUser.otpExpires < Date.now()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const hashedPassword = await bcrypt.hash(tempUser.password, 12);

  const { avatarUrl, coverUrl } = await handleImageUploads(req);

  const user = await User.create({
    fullName: tempUser.fullName.trim(),
    email: tempUser.email,
    password: hashedPassword,
    skills: tempUser.skills,
    avatar: avatarUrl,
    coverImage: coverUrl,
    isEmailVerified: true,
    streakCount: 1,
    lastLoginDate: new Date(),
    xp: 0,
    level: 1,
  });

  addXP(user, 10);
  checkAndAssignBadges(user);
  await user.save();

  if (user.isBanned) {
    throw new ApiError(403, "Account issue. Contact support.");
  }

  await sendWelcomeMail(user.email, user.fullName);
  await TempUser.deleteOne({ email: tempUser.email });

  user.streakCount = 1;
  user.lastLoginDate = new Date();
  await user.save();

  const token = await genToken(user._id);
  res.cookie("token", token, cookieOptions);

  const userData = {
    ...sanitizeUser(user),
    isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL
  };
  return res
    .status(201)
    .json(new ApiResponse(201, userData, "Signup successful"));
});

// ================= SIGNIN =================
export const signIn = asyncHandler(async (req, res) => {
  const { email, password, deviceId } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isBanned) {
    throw new ApiError(
      403,
      user.banReason && user.banReason.trim() !== ""
        ? user.banReason
        : "Your account has been suspended. Contact support."
    );
  }

  const isPrivileged = isPrivilegedRole(user.role) || user.email === process.env.SUPER_ADMIN_EMAIL;

  if (isPrivileged && user.twoFactorEnabled) {
    const now = new Date();
    const trusted = user.trustedDevices?.find(
      (d) => d.deviceId === deviceId && d.expiresAt > now
    );

    if (!trusted) {
      const tempAuthToken = genTempToken(user._id);
      return res.status(200).json(
        new ApiResponse(200, {
          requiresTwoFactor: true,
          role: user.role,
          isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL,
          tempAuthToken,
        }, "Two-factor authentication required")
      );
    }
  }

  const twoFactorWarning = isPrivileged && !user.twoFactorEnabled;

  await handleLoginStreak(user);
  checkAndAssignBadges(user);

  if (isPrivileged) {
    user.lastPrivilegedLoginAt = new Date();
  }

  await user.save();

  const token = genToken(user._id);
  res.cookie("token", token, cookieOptions);

  const userData = {
    ...sanitizeUser(user),
    xp: user.xp,
    level: user.level,
    streak: user.streakCount,
    badges: user.badges,
    isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorWarning,
  };

  return res.status(200).json(
    new ApiResponse(200, userData, "Login successful"),
  );
});

// ================= UPDATE SKILLS =================
export const updateSkills = asyncHandler(async (req, res) => {
  const { skills } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { skills } },
    { returnDocument: "after" },
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, user, "Skills updated"));
});

// ================= UPDATE PROFILE =================
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, skills } = req.body;

  const user = await User.findById(req.user._id);

  const updateData = {};

  if (fullName) {
    updateData.fullName = fullName.trim();
  }

  if (skills) {
    let parsedSkills = skills;

    if (typeof skills === "string") {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (error) {
        throw new ApiError(400, "Skills must be valid JSON array");
      }
    }

    if (!Array.isArray(parsedSkills)) {
      parsedSkills = [parsedSkills];
    }

    updateData.skills = parsedSkills;
  }

  if (req.files?.avatar?.[0]?.path) {
    const avatar = await uploadOnCloudinary(req.files.avatar[0].path);
    if (avatar?.secure_url) {
      await deleteFromCloudinary(user.avatar);
      updateData.avatar = avatar.secure_url;
    }
  }

  if (req.files?.coverImage?.[0]?.path) {
    const cover = await uploadOnCloudinary(req.files.coverImage[0].path);
    if (cover?.secure_url) {
      await deleteFromCloudinary(user.coverImage);
      updateData.coverImage = cover.secure_url;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { returnDocument: "after" },
  ).select("-password");

  const userData = {
    ...updatedUser.toObject(),
    isSuperAdmin: updatedUser.email === process.env.SUPER_ADMIN_EMAIL
  };
  return res
    .status(200)
    .json(new ApiResponse(200, userData, "Profile updated"));
});

// ================= SIGNOUT =================
export const signOut = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.clearCookie("device_id", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

// ================= GOOGLE AUTH =================
export const googleAuth = asyncHandler(async (req, res) => {
  const { fullName, email, avatar, deviceId } = req.body;

  let user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  let isNewUser = false;

  if (user && user.isBanned) {
    throw new ApiError(
      403,
      user.banReason?.trim()
        ? user.banReason
        : "Your account has been suspended. Contact support."
    );
  }

  if (!user) {
    isNewUser = true;

    const randomPassword = Math.random()
      .toString(36)
      .slice(-8);

    const hashedPassword = await bcrypt.hash(
      randomPassword,
      10
    );

    user = await User.create({
      fullName: fullName?.trim() || "Google User",
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      avatar: avatar || "",
      skills: ["Beginner"],
      isEmailVerified: true,
      streakCount: 1,
      lastLoginDate: new Date(),
      credits: 100,
    });

    await sendWelcomeMail(
      user.email,
      user.fullName
    );
  }

  if (user.isBanned) {
    throw new ApiError(
      403,
      user.banReason?.trim()
        ? user.banReason
        : "Your account has been suspended. Contact support."
    );
  }

  const isPrivileged = isPrivilegedRole(user.role) || user.email === process.env.SUPER_ADMIN_EMAIL;

  if (!isNewUser && isPrivileged && user.twoFactorEnabled) {
    const now = new Date();
    const trusted = user.trustedDevices?.find(
      (d) => d.deviceId === deviceId && d.expiresAt > now
    );

    if (!trusted) {
      const tempAuthToken = genTempToken(user._id);
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        role: user.role,
        isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL,
        tempAuthToken,
      });
    }
  }

  if (isNewUser) {
    addXP(user, 10);
  } else {
    await handleLoginStreak(user);
  }

  checkAndAssignBadges(user);

  if (isPrivileged) {
    user.lastPrivilegedLoginAt = new Date();
  }

  await user.save();

  const token = genToken(user._id);

  res.cookie("token", token, cookieOptions);

  const twoFactorWarning = isPrivileged && !user.twoFactorEnabled;

  const userData = {
    ...sanitizeUser(user),
    xp: user.xp,
    level: user.level,
    streak: user.streakCount,
    badges: user.badges,
    isSuperAdmin:
      user.email ===
      process.env.SUPER_ADMIN_EMAIL,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorWarning,
  };

  return res.status(200).json({
    success: true,
    user: userData,
    xp: user.xp,
    level: user.level,
    streak: user.streakCount,
    badges: user.badges,
  });
});

// ================= PASSWORD RESET OTP =================
export const sendResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otp = generateOTP();

  user.resetOtp = otp;
  user.resetOtpExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

 try {
  await sendResetOtpMail(email, otp);
} catch (error) {
  throw new ApiError(
    500,
    "Failed to send reset OTP"
  );
}

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Reset OTP sent to email"));
});

// ================= RESET PASSWORD =================
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  user.password = hashedPassword;

  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;

  user.isOtpVerified = false;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successful"));
});

// ================= VERIFY RESET OTP =================
export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isOtpVerified = true;
  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP verified successfully"));
});

// ================= GET CURRENT USER =================
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPrivileged = isPrivilegedRole(user.role) || user.email === process.env.SUPER_ADMIN_EMAIL;

  const userData = {
    ...sanitizeUser(user),
    isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorWarning: isPrivileged && !user.twoFactorEnabled,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, userData, "Current user fetched successfully"));
});

// ================= 2FA SETUP =================
export const setupTwoFactor = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!isPrivilegedRole(user.role) && user.email !== process.env.SUPER_ADMIN_EMAIL) {
    throw new ApiError(403, "2FA is only available for privileged accounts");
  }

  const secret = generateSecret();

  user.twoFactorTempSecret = secret.base32;
  await user.save();

  const qrCode = await generateQRCode(secret.otpauth_url);

  return res.status(200).json(
    new ApiResponse(200, {
      qrCode,
      manualKey: secret.base32,
    }, "Scan QR code with your authenticator app")
  );
});

// ================= 2FA ENABLE =================
export const enableTwoFactor = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = req.user;

  if (!isPrivilegedRole(user.role) && user.email !== process.env.SUPER_ADMIN_EMAIL) {
    throw new ApiError(403, "2FA is only available for privileged accounts");
  }

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  if (!user.twoFactorTempSecret) {
    throw new ApiError(400, "Please setup 2FA first");
  }

  const isValid = verifyTOTP(user.twoFactorTempSecret, token);

  if (!isValid) {
    throw new ApiError(400, "Invalid OTP code");
  }

  const recoveryCodes = generateRecoveryCodes(8);
  const hashedCodes = hashRecoveryCodes(recoveryCodes);

  user.twoFactorSecret = user.twoFactorTempSecret;
  user.twoFactorTempSecret = "";
  user.twoFactorEnabled = true;
  user.twoFactorRecoveryCodes = hashedCodes;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {
      recoveryCodes,
    }, "Two-factor authentication enabled successfully")
  );
});

// ================= 2FA VERIFY LOGIN =================
export const verifyTwoFactorLogin = asyncHandler(async (req, res) => {
  const { tempAuthToken, token, rememberDevice } = req.body;

  if (!tempAuthToken || !token) {
    throw new ApiError(400, "Temp token and OTP are required");
  }

  let decoded;
  try {
    decoded = verifyTempToken(tempAuthToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired temp token");
  }

  if (decoded.type !== "2fa_temp") {
    throw new ApiError(401, "Invalid token type");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let isValid = verifyTOTP(user.twoFactorSecret, token);

  let usedRecoveryCode = false;
  if (!isValid && user.twoFactorRecoveryCodes?.length > 0) {
    const codeIndex = verifyRecoveryCode(token, user.twoFactorRecoveryCodes);
    if (codeIndex !== -1) {
      isValid = true;
      usedRecoveryCode = true;
      user.twoFactorRecoveryCodes.splice(codeIndex, 1);
    }
  }

  if (!isValid) {
    throw new ApiError(401, "Invalid OTP or recovery code");
  }

  let deviceId = null;
  if (rememberDevice) {
    deviceId = generateDeviceId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.trustedDevices = user.trustedDevices?.filter((d) => d.expiresAt > new Date()) || [];

    user.trustedDevices.push({
      deviceId,
      expiresAt,
      ipAddress: req.ip || req.connection?.remoteAddress || "",
      userAgent: req.headers["user-agent"] || "",
    });
  }

  await handleLoginStreak(user);
  checkAndAssignBadges(user);

  const isPrivileged = isPrivilegedRole(user.role) || user.email === process.env.SUPER_ADMIN_EMAIL;
  if (isPrivileged) {
    user.lastPrivilegedLoginAt = new Date();
  }

  await user.save();

  const jwtToken = genToken(user._id);

  res.cookie("token", jwtToken, cookieOptions);

  if (deviceId) {
    res.cookie("device_id", deviceId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  const userData = {
    ...sanitizeUser(user),
    xp: user.xp,
    level: user.level,
    streak: user.streakCount,
    badges: user.badges,
    isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL,
    twoFactorEnabled: user.twoFactorEnabled,
    usedRecoveryCode,
    deviceId,
  };

  return res.status(200).json(
    new ApiResponse(200, userData, "Login successful"),
  );
});

// ================= 2FA DISABLE =================
export const disableTwoFactor = asyncHandler(async (req, res) => {
  const { password, token } = req.body;

  const currentUser = req.user;

  if (
    !isPrivilegedRole(currentUser.role) &&
    currentUser.email !== process.env.SUPER_ADMIN_EMAIL
  ) {
    throw new ApiError(403, "2FA is only available for privileged accounts");
  }

  if (!password || !token) {
    throw new ApiError(400, "Password and OTP are required");
  }

  const user = await User.findById(currentUser._id);

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }

  const isValid = verifyTOTP(user.twoFactorSecret, token);

  if (!isValid) {
    throw new ApiError(401, "Invalid OTP code");
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = "";
  user.twoFactorTempSecret = "";
  user.twoFactorRecoveryCodes = [];
  user.trustedDevices = [];

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Two-factor authentication disabled successfully"
    )
  );
});

// ================= 2FA STATUS =================
export const getTwoFactorStatus = asyncHandler(async (req, res) => {
  const user = req.user;

  if (
    !isPrivilegedRole(user.role) &&
    user.email !== process.env.SUPER_ADMIN_EMAIL
  ) {
    throw new ApiError(403, "2FA is only available for privileged accounts");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        enabled: user.twoFactorEnabled,
        hasTempSecret: !!user.twoFactorTempSecret,
        trustedDevicesCount: user.trustedDevices?.length || 0,
        lastPrivilegedLoginAt: user.lastPrivilegedLoginAt || null,
        role:
          user.email === process.env.SUPER_ADMIN_EMAIL
            ? "superadmin"
            : user.role,
        recoveryCodesLeft: user.twoFactorRecoveryCodes?.length || 0,
        isEmailVerified: user.isEmailVerified,
      },
      "2FA status fetched"
    )
  );
});
