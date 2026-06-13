import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";

const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

    // Production-safe debug (no token values)
    // console.log("[AUTH ME]", {
    //   ip: req.ip,
    //   origin: req.headers.origin,
    //   hasCookieToken: Boolean(req.cookies?.token),
    //   hasAuthHeader: Boolean(req.headers.authorization),
    //   path: req.originalUrl,
    // });

    if (!token) {
      throw new ApiError(401, "Unauthorized: Token not found");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId;
    const sessionId = decoded.sessionId;

    let user = await User.findById(userId).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!sessionId) {
      throw new ApiError(401, "Unauthorized: sessionId missing");
    }

    const session = await Session.findOne({ userId, sessionId });
    if (!session) {
      throw new ApiError(401, "Unauthorized: session not found");
    }

    // Update session activity (best-effort, throttled)
    try {
      const now = new Date();
      const last = session.lastActive;
      const shouldUpdate = !last || now.getTime() - new Date(last).getTime() > 60 * 1000; // 60s throttle
      if (shouldUpdate) {
        session.lastActive = now;
        await session.save();
      }
    } catch {
      // never block requests due to session tracking issues
    }

    //  DAILY POTD RESET LOGIC

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    if (user.lastPotdDate !== today) {
      user.potdCompleted = false;
      user.lastPotdDate = today;
    }

    if (user.lastCodingPotdDate !== today) {
      user.codingPotdCompleted = false;
      user.lastCodingPotdDate = today;
    }

    await user.save();

    // BAN CHECK - Block banned users from all requests
    if (user.isBanned) {
      throw new ApiError(
        403,
        user.banReason?.trim()
          ? user.banReason
          : "Your account has been suspended. Contact support."
      );
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized: Invalid token");
  }
};

export default isAuth;
