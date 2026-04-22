import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import TempUser from "../models/tempUser.model.js";
import {
  sendSignupOtpMail,
  sendResetOtpMail,
  sendWelcomeMail,
} from "../config/mail.js";
import genToken from "../config/token.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { handleLoginStreak } from "../utils/streakManager.js";
import { checkAndAssignBadges } from "../utils/badgeManager.js";
import { addXP } from "../utils/xpManager.js";

// ================= HELPERS =================
const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 10 * 24 * 60 * 60 * 1000,
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password && password.length >= 6;
const validateSkills = (skills) =>
  Array.isArray(skills) &&
  skills.length > 0 &&
  skills.every((skill) => skill && skill.trim().length > 0);
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const handleImageUploads = async (req) => {
  let avatarUrl = "";
  let coverUrl = "";

  if (req.files?.avatar?.[0]?.path) {
    const avatar = await uploadOnCloudinary(req.files.avatar[0].path);

    console.log("Avatar response:", avatar);

    if (avatar?.secure_url || avatar?.url) {
      avatarUrl = avatar.secure_url || avatar.url;
    }
  }

  if (req.files?.coverImage?.[0]?.path) {
    const cover = await uploadOnCloudinary(req.files.coverImage[0].path);

    console.log("Cover response:", cover);

    if (cover?.secure_url || cover?.url) {
      coverUrl = cover.secure_url || cover.url;
    }
  }

  return { avatarUrl, coverUrl };
};

// ================= SEND SIGNUP OTP =================
export const sendSignupOtp = asyncHandler(async (req, res) => {
  const { fullName, email, password, skills } = req.body;

  if (!fullName?.trim() || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  if (!validateEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (!validatePassword(password)) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  if (!validateSkills(skills)) {
    throw new ApiError(
      400,
      "Skills must be non-empty array with valid entries",
    );
  }

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
  throw new ApiError(
    500,
    "Failed to send signup OTP"
  );
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

  const hashedPassword = await bcrypt.hash(tempUser.password, 12); // stronger salt

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

  //  Give signup reward
  addXP(user, 10); //

  //  check badges
  checkAndAssignBadges(user);

  await user.save();

 await sendWelcomeMail(
  user.email,
  user.fullName
);

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
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  if (!validateEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  await handleLoginStreak(user);
  checkAndAssignBadges(user);

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
      };

  return res.status(200).json(
    new ApiResponse(
      200,
      userData,
      "Login successful",
    ),
  );
});

// ================= UPDATE SKILLS =================
export const updateSkills = asyncHandler(async (req, res) => {
  const { skills } = req.body;

  if (!validateSkills(skills)) {
    throw new ApiError(
      400,
      "Skills must be non-empty array with valid entries",
    );
  }

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

  if (fullName) updateData.fullName = fullName.trim();

  if (skills) {
    let parsedSkills = skills;

    //  CASE 1: string → parse
    if (typeof skills === "string") {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (error) {
        throw new ApiError(400, "Skills must be valid JSON array");
      }
    }

    //  CASE 2: ensure array
    if (!Array.isArray(parsedSkills)) {
      parsedSkills = [parsedSkills];
    }

    if (!validateSkills(parsedSkills)) {
      throw new ApiError(400, "Skills must be valid");
    }

    updateData.skills = parsedSkills;
  }

  // ================= AVATAR =================
  if (req.files?.avatar?.[0]?.path) {
    const avatar = await uploadOnCloudinary(req.files.avatar[0].path);

    if (avatar?.secure_url) {
      //  delete old image
      await deleteFromCloudinary(user.avatar);

      updateData.avatar = avatar.secure_url;
    }
  }

  // ================= COVER IMAGE =================
  if (req.files?.coverImage?.[0]?.path) {
    const cover = await uploadOnCloudinary(req.files.coverImage[0].path);

    if (cover?.secure_url) {
      //  delete old image
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

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

// ================= GOOGLE AUTH =================
export const googleAuth = asyncHandler(async (req, res) => {
  const { fullName, email, avatar } = req.body;

  if (!email || !validateEmail(email)) {
    throw new ApiError(400, "Valid email is required");
  }

  let user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = await User.create({
      
      fullName: fullName?.trim() || "Google User",
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      avatar: avatar || "",
      skills: ["Beginner"],
      isEmailVerified: true,

      //  INIT STREAK
      streakCount: 1,
      lastLoginDate: new Date(),
      credits: 100,
    });

    await sendWelcomeMail(
  user.email,
  user.fullName
);
  }

  // ================= XP + STREAK =================

  if (isNewUser) {
    //  Signup bonus
    addXP(user, 10);
  } else {
    //  Normal login streak
    await handleLoginStreak(user);
  }

  //  Badge check
  checkAndAssignBadges(user);

  await user.save();

  // ================= TOKEN =================
  const token = genToken(user._id);
  res.cookie("token", token, cookieOptions);

  const userData = {
    ...sanitizeUser(user),
    xp: user.xp,
    level: user.level,
    streak: user.streakCount,
    badges: user.badges,
    isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL,
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

  if (!email || !validateEmail(email)) {
    throw new ApiError(400, "Valid email is required");
  }

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

  // ================= VALIDATION =================
  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (!validateEmail(email) || !validatePassword(newPassword)) {
    throw new ApiError(400, "Invalid email or password format");
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // ================= PASSWORD UPDATE =================
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  user.password = hashedPassword;

  // ================= OTP CLEANUP =================
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

  const userData = {
      ...user.toObject(),
      isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL
    };
  return res
    .status(200)
    .json(new ApiResponse(200, userData, "Current user fetched successfully"));

});
