import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendContactMail } from "../config/mail.js";

export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  await sendContactMail(name.trim(), email.trim(), message.trim());

  return res.status(200).json(new ApiResponse(200, { success: true }, "Message sent successfully"));
});
