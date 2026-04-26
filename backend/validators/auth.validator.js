import Joi from "joi";
import { email, password, fullName, skills, otp } from "./common.validator.js";

export const sendSignupOtp = Joi.object({
  fullName: fullName.required(),
  email: email.required(),
  password: password.required(),
  skills: skills.required(),
});

export const signIn = Joi.object({
  email: email.required(),
  password: password.required(),
  deviceId: Joi.string().trim().max(255).optional(),
});

export const googleAuth = Joi.object({
  fullName: fullName.optional(),
  email: email.required(),
  avatar: Joi.string().uri().optional().allow(""),
  deviceId: Joi.string().trim().max(255).optional(),
});

export const sendResetOtp = Joi.object({
  email: email.required(),
});

export const verifyResetOtp = Joi.object({
  email: email.required(),
  otp: otp.required(),
});

export const resetPassword = Joi.object({
  email: email.required(),
  otp: otp.required(),
  newPassword: password.required(),
});

export const updateProfile = Joi.object({
  fullName: fullName.optional(),
  skills: skills.optional(),
});
