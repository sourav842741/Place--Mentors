import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendContactMail } from "../config/mail.js";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name?.trim()) {
    throw new ApiError(400, "Name is required");
  }
  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }
  if (!validateEmail(email)) {
    throw new ApiError(400, "Please enter a valid email");
  }
  if (!message?.trim()) {
    throw new ApiError(400, "Message is required");
  }

  // Send email to admin
  await sendContactMail(name.trim(), email.trim(), message.trim());

  return res.status(200).json(
    new ApiResponse(200, { success: true }, "Message sent successfully")
  );
});

