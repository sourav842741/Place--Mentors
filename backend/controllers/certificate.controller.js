import Certificate from "../models/Certificate.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/* =====================================================
   GET /api/certificates
   User Certificates List
===================================================== */
export const getCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({
    userId: req.user._id,
  })
    .populate("userId", "fullName avatar")
    .sort({ issuedAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      certificates,
      "Certificates fetched successfully"
    )
  );
});

/* =====================================================
   POST /api/certificates/generate
   Generate Certificate
===================================================== */
export const generateCertificate = asyncHandler(async (req, res) => {
  const { badgeName } = req.body;

  if (!badgeName || typeof badgeName !== "string") {
    throw new ApiError(400, "badgeName is required");
  }

  const cleanBadgeName = badgeName.trim();

  const user = await User.findById(req.user._id).select(
    "badges"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  /* Check badge earned */
  const userBadge = user.badges.find(
    (badge) => badge.name === cleanBadgeName
  );

  if (!userBadge) {
    throw new ApiError(
      400,
      `Badge "${cleanBadgeName}" not earned yet`
    );
  }

  /* Existing Certificate */
  let certificate = await Certificate.findOne({
    userId: req.user._id,
    badgeName: cleanBadgeName,
  });

  if (certificate) {
    return res.status(200).json(
      new ApiResponse(
        200,
        certificate,
        "Certificate already exists"
      )
    );
  }

  /* Create New */
  const certificateId = Certificate.generateId();

  certificate = await Certificate.create({
    userId: req.user._id,
    badgeName: cleanBadgeName,
    certificateId,
    metadata: {
      badgeIcon: userBadge.icon || "",
      earnedAt: userBadge.earnedAt || new Date(),
    },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      certificate,
      "Certificate generated successfully"
    )
  );
});

/* =====================================================
   GET /api/certificates/:id
   Private Single Certificate
===================================================== */
export const getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate("userId", "fullName avatar");

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      certificate,
      "Certificate fetched successfully"
    )
  );
});

/* =====================================================
   DELETE /api/certificates/:id
===================================================== */
export const deleteCertificate = asyncHandler(async (req, res) => {
  const deleted = await Certificate.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!deleted) {
    throw new ApiError(404, "Certificate not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Certificate deleted successfully"
    )
  );
});

/* =====================================================
   GET /api/certificates/verify/:id
   Public Verify Route
===================================================== */
export const verifyCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Certificate ID required");
  }

  const certificate = await Certificate.findOne({
    certificateId: id,
  })
    .populate("userId", "fullName avatar")
    .lean();

  if (!certificate) {
    return res.status(404).json(
      new ApiResponse(
        404,
        {
          success: false,
          valid: false,
        },
        "Invalid certificate"
      )
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        success: true,
        valid: true,
        certificate: {
          certificateId:
            certificate.certificateId,

          fullName:
            certificate.userId?.fullName ||
            "Unknown User",

          avatar:
            certificate.userId?.avatar || "",

          badgeName:
            certificate.badgeName,

          issuedAt:
            certificate.issuedAt,

          badgeIcon:
            certificate.metadata?.badgeIcon ||
            "",
        },
      },
      "Certificate verified successfully"
    )
  );
});