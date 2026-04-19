import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import User from "../models/user.model.js";
import Potd from "../models/Potd.js";
import CodingPotd from "../models/CodingPotd.js";

import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/admin.middleware.js";

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

/* ======================================================
   🔥 PUBLIC SETTINGS (NO AUTH)
   Endpoint => /api/admin/public-settings
====================================================== */

router.get(
  "/public-settings",
  getPublicSettings
);

/* ======================================================
   🔥 USERS MANAGEMENT
====================================================== */

// GET ALL USERS
router.get(
  "/users",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");

    return res.status(200).json(
      new ApiResponse(
        200,
        users,
        "Users fetched successfully"
      )
    );
  })
);

// PROMOTE USER TO ADMIN
router.patch(
  "/promote/:id",
  isAuth,
  isAdmin,
  asyncHandler(async (req, res) => {
    const user =
      await User.findByIdAndUpdate(
        req.params.id,
        { role: "admin" },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        user,
        "User promoted to admin successfully"
      )
    );
  })
);

/* ======================================================
   🔥 POTD MANAGEMENT
====================================================== */

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

/* ======================================================
   🔥 CPOTD MANAGEMENT
====================================================== */

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

/* ======================================================
   🔥 EMAIL SYSTEM
====================================================== */

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

/* ======================================================
   🔥 ANALYTICS
====================================================== */

router.get(
  "/analytics",
  isAuth,
  isAdmin,
  getAdminDashboardAnalytics
);

/* ======================================================
   🔥 SETTINGS MANAGEMENT (ADMIN)
   Endpoint:
   GET /api/admin/settings
   PUT /api/admin/settings
====================================================== */

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

/* ======================================================
   ✅ EXPORT
====================================================== */

export default router;