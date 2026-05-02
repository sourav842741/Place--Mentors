import Joi from "joi";
import { subject, category, priority, description } from "./common.validator.js";

export const chatWithSupportAI = Joi.object({
  message: Joi.string().trim().min(1).max(5000).required().messages({
    "any.required": "Message is required",
    "string.empty": "Message is required",
    "string.min": "Message cannot be empty",
    "string.max": "Message is too long (max 5000 characters)",
  }),
  history: Joi.array()
    .items(
      Joi.object({
        role: Joi.string().valid("user", "ai").required(),
        text: Joi.string().trim().min(1).max(10000).required(),
      })
    )
    .optional(),
});

export const escalateToTicket = Joi.object({
  subject: subject.required().messages({
    "any.required": "Subject is required",
    "string.empty": "Subject is required",
  }),
  category: category.required().messages({
    "any.required": "Category is required",
    "any.only": "Invalid category",
  }),
  priority: priority.optional().allow(""),
  description: description.required().messages({
    "any.required": "Description is required",
    "string.empty": "Description is required",
  }),
  email: Joi.string().email().lowercase().trim().max(255).optional(),
  mobile: Joi.string().trim().max(20).optional().allow(""),
  aiChatSummary: Joi.string().trim().max(10000).optional().allow(""),
});
