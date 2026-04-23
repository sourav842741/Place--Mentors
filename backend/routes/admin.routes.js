import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import User from "../models/user.model.js";
import Potd from "../models/Potd.js";
import CodingPotd from "../models/CodingPotd.js";

import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/admin.middleware.js";
import isSuperAdmin from "../middlewares/superAdmin.middleware.js";

import { generatePotd } from "../controllers/potd.controller.js";
import { generateCpotd } from "../controllers/cpotd.controller.js";
import { getAdminDashboardAnalytics } from "../controllers/adminAnalytics.controller.js";

import {
  getEmailStats,
  sendSingleEmail,
  sendBulkEmails,
  sendToSegment,
  testTemplate,
  getEmailLogs,
} from "../controllers/adminEmail.controller.js";

import {
  getSettings,
  updateSettings,
  getPublicSettings,
} from "../controllers/settings.controller.js";


const router = express.Router();



router.get(
  "/public-settings",
  getPublicSettings
);


// GET ALL USERS
router.get(
  "/users",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");
    const usersWithFlag = users.map(user => ({
      ...user.toObject(),
      isSuperAdmin: user.email === process.env.SUPER_ADMIN_EMAIL
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        usersWithFlag,
        "Users fetched successfully"
      )
    );
  })

);

// PROMOTE USER TO ADMIN
router.patch(
  "/promote/:id",
  isAuth,
  isSuperAdmin,
  asyncHandler(async (req, res) => {
    const targetUser = await User.findById(req.params.id).select("email role");
    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    if (targetUser.email === process.env.SUPER_ADMIN_EMAIL) {
      return res.status(200).json(new ApiResponse(200, targetUser, "Super Admin role protected"));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    // Real-time admin update
    req.io.emit('admin:user:updated', user);

    return res.status(200).json(
      new ApiResponse(
        200,
        user,
        "User promoted to admin successfully"
      )
    );
  })
);

// DEMOTE ADMIN TO USER
router.patch(
  "/demote/:id",
  isAuth,
  isSuperAdmin,
  asyncHandler(async (req, res) => {
    const targetUser = await User.findById(req.params.id).select("email role");

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    if (targetUser.email === process.env.SUPER_ADMIN_EMAIL) {
      throw new ApiError(403, "Cannot demote super admin");
    }

    if (targetUser.role !== "admin") {
      throw new ApiError(400, "User is not an admin");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "user" },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    // Real-time admin update
    req.io.emit('admin:user:updated', user);

    return res.status(200).json(
      new ApiResponse(
        200,
        user,
        "User demoted to normal user successfully"
      )
    );
  })
);



// BAN USER
router.patch(
  "/users/:id/ban",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { banReason } = req.body;
    const adminUser = req.user;
    const targetId = req.params.id;

    // Fetch target
    const targetUser = await User.findById(targetId).select("email role isBanned");
    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    // Self ban protection
    if (targetUser._id.toString() === adminUser._id.toString()) {
      throw new ApiError(403, "Cannot ban yourself");
    }

    // Permission checks
    const isSuperAdmin = adminUser.email === process.env.SUPER_ADMIN_EMAIL;
    const isTargetSuperAdmin = targetUser.email === process.env.SUPER_ADMIN_EMAIL;
    const isTargetAdmin = targetUser.role === "admin";
    const canBanTargetAdmin = isSuperAdmin;

    if (isTargetSuperAdmin) {
      throw new ApiError(403, "Cannot ban super admin");
    }

    if (isTargetAdmin && !canBanTargetAdmin) {
      throw new ApiError(403, "Admin access required to ban admins");
    }

    // Ban user
    const updatedUser = await User.findByIdAndUpdate(
      targetId,
      {
        isBanned: true,
        banReason: banReason || "No reason provided",
        bannedAt: new Date(),
        bannedBy: adminUser._id,
        $push: {
          banHistory: {
            reason: banReason || "No reason provided",
            bannedAt: new Date(),
            bannedBy: adminUser._id
          }
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    // Real-time admin update
    req.io.emit('admin:user:updated', updatedUser);

    return res.status(200).json(
      new ApiResponse(200, updatedUser, "User banned successfully")
    );
  })
);

// UNBAN USER
router.patch(
  "/users/:id/unban",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const targetId = req.params.id;
    const adminUser = req.user;

    // Fetch target
    const targetUser = await User.findById(targetId).select("email role isBanned");
    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    // Self check (optional)
    if (targetUser._id.toString() === adminUser._id.toString() && targetUser.isBanned) {
      throw new ApiError(403, "Contact super admin to unban yourself");
    }

    // Update
    const updatedUser = await User.findByIdAndUpdate(
      targetId,
      {
        isBanned: false,
        banReason: "",
        bannedAt: null,
        bannedBy: null
      },
      { new: true, runValidators: true }
    ).select("-password");

    // Real-time admin update
    req.io.emit('admin:user:updated', updatedUser);

    return res.status(200).json(
      new ApiResponse(200, updatedUser, "User unbanned successfully")
    );
  })
);





// AUTO GENERATE POTD
router.post(
  "/potd",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    await generatePotd(req, res);
  })
);

// MANUAL POTD
router.post(
  "/manual-potd",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const {
      date =
        new Date()
          .toISOString()
          .split("T")[0],
      questions,
    } = req.body;

    if (
      !questions ||
      !Array.isArray(
        questions
      ) ||
      questions.length === 0
    ) {
      throw new ApiError(
        400,
        "Questions array required"
      );
    }

    const potd =
      await Potd.findOneAndUpdate(
        { date },
        {
          date,
          questions,
          isManual: true,
          generatedAt:
            new Date(),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        potd,
        "Manual POTD created/updated successfully"
      )
    );
  })
);



// AUTO GENERATE CPOTD
router.post(
  "/cpotd",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    await generateCpotd(req, res);
  })
);

// MANUAL CPOTD
router.post(
  "/manual-cpotd",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const {
      date =
        new Date()
          .toISOString()
          .split("T")[0],
      questions,
    } = req.body;

    if (
      !questions ||
      !Array.isArray(
        questions
      ) ||
      questions.length === 0
    ) {
      throw new ApiError(
        400,
        "Questions array required"
      );
    }

    const cpotd =
      await CodingPotd.findOneAndUpdate(
        { date },
        {
          date,
          questions,
          isManual: true,
          generatedAt:
            new Date(),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        cpotd,
        "Manual CPOTD created/updated successfully"
      )
    );
  })
);



router.get(
  "/email/stats",
  isAuth,
  isAdmin,
  getEmailStats
);

router.get(
  "/email/logs",
  isAuth,
  isAdmin,
  getEmailLogs
);

router.post(
  "/email/send-single",
  isAuth,
  isAdmin,
  sendSingleEmail
);

router.post(
  "/email/send-bulk",
  isAuth,
  isAdmin,
  sendBulkEmails
);

router.post(
  "/email/send-segment",
  isAuth,
  isAdmin,
  sendToSegment
);

router.post(
  "/email/test-template",
  isAuth,
  isAdmin,
  testTemplate
);



router.get(
  "/analytics",
  isAuth,
  isAdmin,
  getAdminDashboardAnalytics
);



router.get(
  "/settings",
  isAuth,
  isAdmin,
  getSettings
);

router.put(
  "/settings",
  isAuth,
  isAdmin,
  updateSettings
);


router.get('/users/export', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  
  const csvData = users.map(user => ({
    Name: user.fullName,
    Email: user.email,
    'Role': user.role?.toUpperCase() || 'USER',
    'Level': user.level || 1,
    'Credits': user.credits || 0,
    'Status': user.isBanned ? 'BANNED' : (user.isOnline ? 'ONLINE' : 'OFFLINE'),
    'Last Seen': user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'Never',
    'Joined': new Date(user.createdAt).toLocaleDateString()
  }));

  const csvHeader = Object.keys(csvData[0] || {}).join(',');
  const csvRows = csvData.map(row => Object.values(row).map(val => 
    `"${String(val).replace(/"/g, '""')}"`
  ).join(',')).join('\\n');

  const csvContent = csvHeader + '\\n' + csvRows;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=users-${new Date().toISOString().split('T')[0]}.csv`);
  res.status(200).send(csvContent);
}));



export default router;
