import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const isAuth = async (req, res, next) => {
  try {
let token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, "Unauthorized: Token not found");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // 🔥 DAILY POTD RESET LOGIC
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (user.lastPotdDate !== today) {
      user.potdCompleted = false;
      user.lastPotdDate = today;
    }

    if (user.lastCodingPotdDate !== today) {
      user.codingPotdCompleted = false;
      user.lastCodingPotdDate = today;
    }

    await user.save();
    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized: Invalid token");
  }
};

export default isAuth;