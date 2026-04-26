import Joi from "joi";

export const submitContactForm = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().lowercase().trim().max(255).required(),
  message: Joi.string().trim().min(1).max(2000).required(),
});
