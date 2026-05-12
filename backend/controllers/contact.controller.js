import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { buildContactTemplate } from "../config/mail.js";

import { enqueueEmailJob } from "../producers/emailProducer.js";

export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw new ApiError(400, "All fields are required");
  }

  // Build email template
  const { subject, html } = buildContactTemplate({
    name: name.trim(),
    senderEmail: email.trim(),
    message: message.trim(),
  });

  // Queue email job
  await enqueueEmailJob({
    // Admin receiving email
    to: "souravkumar85055@gmail.com",

    subject,

    html,

    meta: {
      jobType: "contact_form",
      senderEmail: email.trim(),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { success: true }, "Message submitted successfully"));
});
