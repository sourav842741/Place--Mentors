import Joi from "joi";

export const createTicket = Joi.object({
  subject: Joi.string().trim().min(1).max(200).required().messages({
    "any.required": "Subject is required",
    "string.empty": "Subject is required",
  }),
  category: Joi.string()
    .valid(
      "Login Issue",
      "Payment",
      "Premium",
      "Bug Report",
      "Resume",
      "Interview",
      "Account",
      "Other"
    )
    .required()
    .messages({
      "any.required": "Category is required",
      "any.only": "Invalid category",
    }),
  priority: Joi.string().trim().max(20).optional().allow(""),
  description: Joi.string().trim().min(1).max(5000).required().messages({
    "any.required": "Description is required",
    "string.empty": "Description is required",
  }),
  email: Joi.string().email().lowercase().trim().max(255).optional(),
  mobile: Joi.string().trim().max(20).optional().allow(""),
});

export const replyToTicket = Joi.object({
  message: Joi.string().trim().min(1).max(5000).required(),
  isInternal: Joi.boolean().optional(),
});

export const updateTicketStatus = Joi.object({
  status: Joi.string().valid("Open", "In Progress", "Solved", "Rejected").required().messages({
    "any.only": "Invalid status",
  }),
  internalNote: Joi.string().trim().max(2000).optional(),
});
