import Joi from "joi";
import mongoose from "mongoose";

export const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "MongoDB ObjectId validation");

export const email = Joi.string().email().lowercase().trim().max(255);
export const password = Joi.string().min(6).max(128).trim();
export const fullName = Joi.string().trim().min(1).max(100);
export const skills = Joi.array().items(Joi.string().trim().min(1)).min(1);
export const otp = Joi.string().length(4).pattern(/^\d+$/);
export const message = Joi.string().trim().min(1).max(5000);
export const subject = Joi.string().trim().min(1).max(200);
export const description = Joi.string().trim().min(1).max(5000);
export const category = Joi.string().valid(
  "Login Issue",
  "Payment",
  "Premium",
  "Bug Report",
  "Resume",
  "Interview",
  "Account",
  "Other"
);
export const priority = Joi.string().valid("Low", "Medium", "High");
export const status = Joi.string().valid("Open", "In Progress", "Solved", "Rejected");
export const planId = Joi.string().valid("starter", "pro", "premium");
export const amount = Joi.number().integer().positive().max(100000);
export const credits = Joi.number().integer().positive().max(100000);
export const page = Joi.number().integer().min(1).default(1);
export const limit = Joi.number().integer().min(1).max(100).default(20);
